# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/002-fullstack-web-app/data-model.md
# Configuration module for FastAPI Todo application

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str
    jwt_secret: str
    better_auth_url: str
    better_auth_secret: str = ""  # Shared secret with frontend for JWT verification

    # Optional: OpenAI API key (for Phase III AI chatbot)
    openai_api_key: str = ""

    # Optional: Redis for distributed rate limiting
    redis_url: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Allow extra fields in .env


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
