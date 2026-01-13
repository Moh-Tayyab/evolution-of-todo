from fastapi import APIRouter
from .routes import tasks, tags, health, auth

api_router = APIRouter()

# Include authentication routes (signup, login, me)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Task and tag management endpoints
api_router.include_router(tasks.router, tags=["tasks"])
api_router.include_router(tags.router, tags=["tags"])

# Health check endpoint (no prefix to avoid /health/health)
api_router.include_router(health.router, tags=["health"])
