# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/003-ai-chatbot/spec.md
# API router configuration for all endpoints

from fastapi import APIRouter
from .routes import tasks, tags, health, auth, chat, chatkit

api_router = APIRouter()

# Include authentication routes (signup, login, me)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Chatbot endpoint (Phase III)
api_router.include_router(chat.router, tags=["chat"])

# OpenAI ChatKit protocol endpoint (Phase III)
api_router.include_router(chatkit.router, prefix="/chatkit", tags=["chatkit"])

# Task and tag management endpoints
api_router.include_router(tasks.router, tags=["tasks"])
api_router.include_router(tags.router, tags=["tags"])

# Health check endpoint (no prefix to avoid /health/health)
api_router.include_router(health.router, tags=["health"])
