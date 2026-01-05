from fastapi import APIRouter
from .routes import auth, tasks, tags, health

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
