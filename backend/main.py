import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
import os

from routes.movies import router as movies_router

load_dotenv()

app = FastAPI(title="Movie Reviews API")

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_db():
    """Connect to MongoDB Atlas on startup."""
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise RuntimeError("MONGODB_URI not found in .env")

    client = MongoClient(mongo_uri)
    db = client["movies"]

    # Initialize both collections
    movies_collection = db["movies"]
    reviews_collection = db["reviews"]

    # Store on app state so routes can access them
    app.state.mongo_client = client
    app.state.db = db
    app.state.movies_collection = movies_collection
    app.state.reviews_collection = reviews_collection
    print("✅ Connected to MongoDB Atlas")
    print(f"   - movies collection: {movies_collection.name}")
    print(f"   - reviews collection: {reviews_collection.name}")


@app.on_event("shutdown")
def shutdown_db():
    """Close MongoDB connection on shutdown."""
    app.state.mongo_client.close()
    print("🔌 MongoDB connection closed")


# Include routes
app.include_router(movies_router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
