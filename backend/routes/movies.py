from fastapi import APIRouter, HTTPException, Query, Request
from bson import ObjectId
from pymongo import ReturnDocument
from datetime import datetime

from models import AddReviewRequest, UpdateMovieSummaryRequest, ReviewAnalysis
from config.gemini import generate_content
from fastapi import BackgroundTasks

router = APIRouter()


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict, converting all ObjectIds to strings."""
    if doc is None:
        return None

    # Create a copy to avoid mutating the original
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            # Convert ObjectId to string
            result[key] = str(value)
        elif isinstance(value, dict):
            # Recursively serialize nested dicts
            result[key] = serialize_doc(value)
        elif isinstance(value, list):
            # Handle lists (though we don't have nested lists with ObjectIds in this schema)
            result[key] = value
        else:
            result[key] = value

    # Map _id to id
    if "_id" in result:
        result["id"] = result.pop("_id")

    return result


def analyze_and_update_movie(
    imdbID: str,
    review_text: str,
    current_summary: str,
    movies_collection,
    review_id: str,
    reviews_collection,
):
    """
    Background task to analyze a new review and update the movie's summary and sentiment counts.
    """
    print(f"🤖 [AI Analysis] Started for movie {imdbID}...")

    # Construct the prompt
    prompt = f"""
    You are an expert movie critic assistant.
    
    Current Review Summary: "{current_summary}"
    
    New Review: "{review_text}"
    
    Task:
    1. Update the 'Current Review Summary' to incorporate the insights from the 'New Review'. 
       Keep the summary concise (under 3 sentences) and captures the overall consensus.
       If there was no previous summary, create one based on the new review.
    2. Analyze the sentiment of the 'New Review' as one of: "good", "average", "bad".
    
    Return the result in JSON format.
    """

    try:
        # Call Gemini AI with structured output config
        response_text = generate_content(
            prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": ReviewAnalysis.model_json_schema(),
            },
        )

        # Parse the response
        analysis = ReviewAnalysis.model_validate_json(response_text)

        # Prepare the update for MongoDB
        inc_field = f"sentimentCounts.{analysis.sentiment}"

        movies_collection.update_one(
            {"imdbID": imdbID},
            {
                "$set": {"reviewSummary": analysis.updated_summary},
                "$inc": {inc_field: 1},
            },
        )

        # Update the review document with the sentiment
        reviews_collection.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": {"sentiment": analysis.sentiment}},
        )

        print(
            f"✅ [AI Analysis] Completed for {imdbID}. Sentiment: {analysis.sentiment}"
        )

    except Exception as e:
        print(f"❌ [AI Analysis] Failed for {imdbID}: {e}")


@router.get("/movies/{imdbID}/reviews")
async def get_movie_with_reviews(
    request: Request,
    imdbID: str,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(10, ge=1, le=100, description="Reviews per page"),
    sort: str = Query("createdAt", description="Sort field (createdAt or rating)"),
):
    """
    Get movie with paginated reviews.

    Returns:
    {
        "movie": { ... },
        "reviews": [ ... ],
        "pagination": { ... }
    }
    """
    movies_collection = request.app.state.movies_collection
    reviews_collection = request.app.state.reviews_collection

    # Get or create movie document
    movie_doc = movies_collection.find_one({"imdbID": imdbID})
    if not movie_doc:
        # Create empty movie document if it doesn't exist
        new_movie = {
            "imdbID": imdbID,
            "reviewSummary": "",
            "sentimentCounts": {"good": 0, "average": 0, "bad": 0},
        }
        result = movies_collection.insert_one(new_movie)
        new_movie["_id"] = result.inserted_id
        movie_doc = new_movie

    # Get total review count
    total_reviews = reviews_collection.count_documents({"imdbID": imdbID})
    total_pages = (total_reviews + limit - 1) // limit if total_reviews > 0 else 0

    # Fetch paginated reviews
    skip = (page - 1) * limit
    sort_order = -1 if sort == "createdAt" else 1  # Newest first for createdAt

    reviews_cursor = (
        reviews_collection.find({"imdbID": imdbID})
        .sort(sort, sort_order)
        .skip(skip)
        .limit(limit)
    )

    reviews = [serialize_doc(doc) for doc in reviews_cursor]

    return {
        "movie": serialize_doc(movie_doc),
        "reviews": reviews,
        "pagination": {
            "page": page,
            "limit": limit,
            "totalReviews": total_reviews,
            "totalPages": total_pages,
            "hasMore": page < total_pages,
        },
    }


@router.post("/movies/{imdbID}/reviews", status_code=201)
async def add_review(
    request: Request,
    imdbID: str,
    review: AddReviewRequest,
    background_tasks: BackgroundTasks,
):
    """Add a new review to a movie and trigger AI analysis."""

    movies_collection = request.app.state.movies_collection
    reviews_collection = request.app.state.reviews_collection

    # Get or create movie document
    movie_doc = movies_collection.find_one({"imdbID": imdbID})
    if not movie_doc:
        # Create movie document if it doesn't exist
        new_movie = {
            "imdbID": imdbID,
            "reviewSummary": "",
            "sentimentCounts": {"good": 0, "average": 0, "bad": 0},
        }
        result = movies_collection.insert_one(new_movie)
        movie_doc = movies_collection.find_one({"_id": result.inserted_id})

    # Create review document
    review_doc = {
        "movieId": str(movie_doc["_id"]),  # Convert ObjectId to string
        "imdbID": imdbID,
        "rating": review.rating,
        "text": review.text,
        "name": review.name,
        "email": review.email,
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }

    result = reviews_collection.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id

    # Trigger background analysis
    background_tasks.add_task(
        analyze_and_update_movie,
        imdbID,
        review.text,
        movie_doc.get("reviewSummary", ""),
        movies_collection,
        str(review_doc["_id"]),
        reviews_collection,
    )

    return serialize_doc(review_doc)


@router.delete("/reviews/{review_id}")
async def delete_review(request: Request, review_id: str):
    """Delete a review by ID."""
    reviews_collection = request.app.state.reviews_collection

    try:
        obj_id = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review ID")

    result = reviews_collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")

    return {"message": "Review deleted successfully"}


@router.patch("/movies/{imdbID}/summary")
async def update_movie_summary(
    request: Request,
    imdbID: str,
    update: UpdateMovieSummaryRequest,
):
    """Update movie summary and sentiment counts."""
    movies_collection = request.app.state.movies_collection

    update_data = {
        "reviewSummary": update.reviewSummary,
        "sentimentCounts": update.sentimentCounts.model_dump(),
    }

    result = movies_collection.find_one_and_update(
        {"imdbID": imdbID},
        {"$set": update_data},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    return serialize_doc(result)
