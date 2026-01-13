# @spec: specs/002-fullstack-web-app/plan.md
# @spec: specs/002-fullstack-web-app/spec.md
# FastAPI application entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import engine
from .api import api_router
from .models import Task, Tag, TaskTag, User
from sqlmodel import SQLModel


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Create tables on startup
    SQLModel.metadata.create_all(engine)
    yield
    # Cleanup on shutdown
    pass


# Create FastAPI app
app = FastAPI(
    title="Todo API",
    description="FastAPI backend for Todo application",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Todo API",
        "version": "0.1.0",
        "docs": "/docs",
    }
