"""
Gemini AI Configuration Module

This module initializes and exports the Gemini AI client for use across the application.
The API key is loaded from the GEMINI_API_KEY environment variable.
"""

import os
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize the Gemini client
# The client gets the API key from the environment variable `GEMINI_API_KEY`
gemini_client = genai.Client()

# Default model to use
DEFAULT_MODEL = os.getenv("GEMINI_MODEL")


def generate_content(
    prompt: str, model: str = DEFAULT_MODEL, config: dict = None
) -> str:
    """
    Generate content using Gemini AI.

    Args:
        prompt (str): The prompt to send to the AI model
        model (str): The model to use (defaults to gemini-2.0-flash-exp)
        config (dict): Optional configuration for the model (e.g., for structured output)

    Returns:
        str: The generated text response

    Example:
        >>> from config.gemini import generate_content
        >>> response = generate_content("Explain how AI works", config={"response_mime_type": "application/json"})
    """
    response = gemini_client.models.generate_content(
        model=model, contents=prompt, config=config
    )
    return response.text


# Export the client and helper function
__all__ = ["gemini_client", "generate_content", "DEFAULT_MODEL"]
