from pydantic import BaseModel, Field
from typing import Optional, Literal


class SentimentCounts(BaseModel):
    good: int = 0
    average: int = 0
    bad: int = 0


# Movie document (no embedded reviews)
class Movie(BaseModel):
    id: Optional[str] = None
    imdbID: str
    reviewSummary: str = ""
    sentimentCounts: SentimentCounts = SentimentCounts()


# Review document (separate collection)
class Review(BaseModel):
    id: Optional[str] = None
    movieId: Optional[str] = None  # Reference to Movie._id
    imdbID: str  # Denormalized for faster queries
    rating: Optional[int] = None
    text: str = ""
    name: str = ""
    email: str = ""
    createdAt: Optional[str] = None
    sentiment: Optional[str] = None  # Store sentiment analysis result


# Request models
class AddReviewRequest(BaseModel):
    rating: Optional[int] = None
    text: str = ""
    name: str = ""
    email: str = ""


class UpdateMovieSummaryRequest(BaseModel):
    reviewSummary: str
    sentimentCounts: SentimentCounts


# AI Analysis Model
class ReviewAnalysis(BaseModel):
    updated_summary: str = Field(
        description="The updated summary based on the current summary and the review."
    )
    sentiment: Literal["good", "average", "bad"] = Field(
        description="The sentiment of the review."
    )
