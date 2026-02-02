# @spec: specs/002-fullstack-web-app/plan.md
# Health check endpoint

from fastapi import APIRouter, status, Depends
from pydantic import BaseModel
from sqlmodel import Session

from src.database import get_session

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    database: str


@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check(session: Session = Depends(get_session)):
    """
    Health check endpoint.

    Returns:
        Health status with database connection
    """
    # Test database connection
    try:
        session.exec("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return HealthResponse(
        status="healthy",
        database=db_status,
    )
