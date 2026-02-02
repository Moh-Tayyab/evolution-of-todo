# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/002-fullstack-web-app/data-model.md
# @spec: specs/003-ai-chatbot/spec.md (NFR-008: OpenAI API configuration)
# Configuration module for FastAPI Todo application

from pydantic import Field
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Literal
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    All settings are validated at startup to fail fast on misconfiguration.
    """

    # Database
    database_url: str = Field(
        ...,
        description="PostgreSQL or SQLite connection URL"
    )

    # Authentication
    jwt_secret: str = Field(
        ...,
        min_length=32,
        description="JWT secret key for token signing (min 32 chars)"
    )
    better_auth_url: str = Field(
        default="http://localhost:3000",
        description="Better Auth service URL"
    )
    better_auth_secret: str = Field(
        default="",
        description="Shared secret with frontend for JWT verification"
    )

    # OpenAI Integration (Phase III: AI Chatbot)
    openai_api_key: str = Field(
        default="",
        description="OpenAI API key for AI chatbot (leave empty to disable chat feature)"
    )

    # Optional: Rate limiting
    redis_url: str = Field(
        default="",
        description="Redis URL for distributed rate limiting (optional)"
    )

    # Development settings
    environment: Literal["development", "test", "production"] = Field(
        default="development",
        description="Application environment"
    )
    debug: bool = Field(
        default=False,
        description="Enable debug mode (verbose logging, auto-reload)"
    )
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO",
        description="Logging level"
    )
    port: int = Field(
        default=8000,
        ge=1024,
        le=65535,
        description="Server port"
    )

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Allow extra fields in .env

    def validate_openai_config(self) -> None:
        """Validate OpenAI configuration if chat feature is enabled.

        Raises:
            ValueError: If OPENAI_API_KEY is required but not set
        """
        # Skip validation for test environment
        if self.environment == "test":
            return

        if self.openai_api_key:
            if not self.openai_api_key.startswith("sk-"):
                logger.warning(
                    "OPENAI_API_KEY does not start with 'sk-'. "
                    "This may indicate an invalid API key."
                )
            if len(self.openai_api_key) < 20:
                raise ValueError(
                    "OPENAI_API_KEY appears to be invalid. "
                    "Get a valid key from https://platform.openai.com/api-keys"
                )
        else:
            logger.warning(
                "OPENAI_API_KEY not set. AI chatbot feature will be disabled."
            )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance.

    Returns:
        Settings: Validated application settings
    """
    settings = Settings()

    # Validate logging configuration
    logging.basicConfig(
        level=getattr(logging, settings.log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Validate OpenAI configuration
    settings.validate_openai_config()

    return settings
