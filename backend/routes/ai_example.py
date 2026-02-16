"""
Example routes demonstrating how to use the Gemini AI client.

This file shows different ways to integrate Gemini AI into your FastAPI routes.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Import the Gemini client and helper function
from config.gemini import gemini_client, generate_content, DEFAULT_MODEL

router = APIRouter(prefix="/ai", tags=["AI"])


class PromptRequest(BaseModel):
    """Request model for AI generation."""

    prompt: str
    model: str = DEFAULT_MODEL


class AIResponse(BaseModel):
    """Response model for AI generation."""

    text: str
    model: str


@router.post("/generate", response_model=AIResponse)
async def generate_ai_content(request: PromptRequest):
    """
    Generate content using Gemini AI.

    Example request:
    {
        "prompt": "Explain how AI works in a few words",
        "model": "gemini-2.0-flash-exp"
    }
    """
    try:
        # Method 1: Using the helper function
        response_text = generate_content(request.prompt, request.model)

        return AIResponse(text=response_text, model=request.model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.post("/generate-direct", response_model=AIResponse)
async def generate_ai_content_direct(request: PromptRequest):
    """
    Generate content using Gemini AI (direct client usage).

    This demonstrates using the gemini_client directly instead of the helper function.
    """
    try:
        # Method 2: Using the client directly
        response = gemini_client.models.generate_content(
            model=request.model, contents=request.prompt
        )

        return AIResponse(text=response.text, model=request.model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.get("/test")
async def test_ai():
    """
    Simple test endpoint to verify AI is working.
    """
    try:
        response = generate_content("Say 'Hello from Gemini AI!' in a creative way")
        return {"message": "AI is working!", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI test failed: {str(e)}")
