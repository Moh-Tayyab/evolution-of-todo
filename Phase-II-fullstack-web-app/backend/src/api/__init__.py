# @spec: specs/002-fullstack-web-app/plan.md
# API router setup

from fastapi import APIRouter

api_router = APIRouter(prefix="/api")

# Import and register route modules
from .routes import tasks, tags, health

api_router.include_router(tasks.router)
api_router.include_router(tags.router)
api_router.include_router(health.router)

__all__ = ["api_router"]
