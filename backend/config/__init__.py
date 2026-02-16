"""
Configuration package for the Movie Search Backend.
"""

from .gemini import gemini_client, generate_content, DEFAULT_MODEL

__all__ = ["gemini_client", "generate_content", "DEFAULT_MODEL"]
