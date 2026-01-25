# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/002-fullstack-web-app/spec.md
# @spec: specs/003-ai-chatbot/spec.md
# FastAPI application entry point with startup validation and health checks

from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from .database import engine
from .api import api_router
from .models import Task, Tag, TaskTag, User, Conversation, Message
from .config import get_settings
from sqlmodel import SQLModel

logger = logging.getLogger(__name__)
settings = get_settings()

# Import rate limiter exception handler
from slowapi.errors import RateLimitExceeded


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager with startup validation.

    On startup:
    - Creates all database tables
    - Validates OpenAI API configuration
    - Logs service readiness

    On shutdown:
    - Closes database connections
    """
    # Startup tasks
    logger.info("Starting Todo API...")

    # Create database tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise

    # Validate OpenAI configuration
    if settings.openai_api_key:
        logger.info("OpenAI integration: ENABLED")
    else:
        logger.warning("OpenAI integration: DISABLED (OPENAI_API_KEY not set)")

    logger.info(f"Todo API v0.2.0 started successfully")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"Log level: {settings.log_level}")

    yield

    # Shutdown tasks
    logger.info("Shutting down Todo API...")
    await engine.dispose()
    logger.info("Database connections closed")


# Create FastAPI app
app = FastAPI(
    title="Todo API",
    description="FastAPI backend for Todo application with AI chatbot",
    version="0.2.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Configure CORS for frontend integration and ChatKit
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
        settings.better_auth_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"],
)

# Add rate limit exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceeded errors with proper 429 response."""
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": "Rate limit exceeded. Please try again later.",
        },
        headers={
            "Retry-After": "60",
            "X-RateLimit-Limit": "60",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": "60",
        },
    )

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Todo API",
        "version": "0.2.0",
        "status": "running",
        "features": {
            "tasks": True,
            "tags": True,
            "ai_chatbot": bool(settings.openai_api_key),
        },
        "docs": "/docs" if settings.debug else "disabled in production",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring and orchestration.

    Returns service health status and feature availability.
    Includes database connectivity check.
    """
    from sqlalchemy import text

    health_status = {
        "status": "healthy",
        "service": "todo-api",
        "version": "0.2.0",
        "features": {
            "tasks": True,
            "tags": True,
            "ai_chatbot": bool(settings.openai_api_key),
        },
    }

    # Check database connectivity
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            result.fetchone()
        health_status["database"] = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_status["status"] = "degraded"
        health_status["database"] = f"disconnected: {str(e)}"

    # Check OpenAI API
    if settings.openai_api_key:
        try:
            # Simple validation: check if key format is correct
            if settings.openai_api_key.startswith("sk-"):
                health_status["openai"] = "configured"
            else:
                health_status["openai"] = "invalid_key_format"
                health_status["status"] = "degraded"
        except Exception as e:
            health_status["openai"] = f"error: {str(e)}"
            health_status["status"] = "degraded"
    else:
        health_status["openai"] = "disabled"

    # Return appropriate status code
    if health_status["status"] == "degraded":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_status
        )

    return health_status


@app.get("/health/chat", tags=["Health"])
async def chat_health_check():
    """
    Dedicated health check for AI chatbot feature.

    Returns detailed status of OpenAI integration.
    Use this endpoint to verify chatbot readiness before enabling the feature.
    """
    if not settings.openai_api_key:
        return {
            "status": "disabled",
            "message": "OpenAI API key not configured. Set OPENAI_API_KEY to enable chatbot.",
            "configured": False,
        }

    # Validate API key format
    is_valid_format = (
        settings.openai_api_key.startswith("sk-") and
        len(settings.openai_api_key) >= 20
    )

    if not is_valid_format:
        return {
            "status": "error",
            "message": "OpenAI API key format is invalid. Get a valid key from https://platform.openai.com/api-keys",
            "configured": True,
            "valid": False,
        }

    return {
        "status": "healthy",
        "message": "AI chatbot is ready",
        "configured": True,
        "valid": True,
        "model": "gpt-4o-mini",
    }
