# @spec: specs/002-fullstack-web-app/data-model.md
# @spec: specs/002-fullstack-web-app/spec.md
# Tag CRUD endpoints

from typing import List, Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from src.api.deps import get_current_user_id
from src.database import get_session
from src.models.tag import Tag
from src.schemas.tag import TagCreate, TagUpdate, TagRead, TagReadWithCount

router = APIRouter()


@router.get("/{user_id}/tags", response_model=List[TagReadWithCount])
async def list_tags(
    user_id: UUID,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    session: Session = Depends(get_session),
):
    """
    List all tags for a user with task counts.

    Args:
        user_id: User ID from URL path
        current_user_id: Authenticated user ID from JWT
        session: Database session

    Returns:
        List of tags with task counts
    """
    # Verify user ownership
    if current_user_id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Get tags
    tags = session.exec(
        select(Tag).where(Tag.user_id == user_id)
    ).all()

    # Add task counts
    tags_with_counts = []
    for tag in tags:
        task_count = len(tag.tasks) if tag.tasks else 0
        tag_dict = {
            **tag.model_dump(),
            "task_count": task_count,
        }
        tags_with_counts.append(tag_dict)

    return tags_with_counts


@router.post("/{user_id}/tags", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(
    user_id: UUID,
    tag_data: TagCreate,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    session: Session = Depends(get_session),
):
    """
    Create a new tag for a user.

    Args:
        user_id: User ID from URL path
        tag_data: Tag creation data
        current_user_id: Authenticated user ID from JWT
        session: Database session

    Returns:
        Created tag

    Raises:
        HTTPException: If user ID mismatch or tag name already exists
    """
    # Verify user ownership
    if current_user_id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Check for duplicate tag name
    existing = session.exec(
        select(Tag).where(
            (Tag.user_id == user_id) &
            (Tag.name == tag_data.name)
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag name already exists for this user",
        )

    # Create tag
    tag = Tag.model_validate(tag_data, update={"user_id": user_id})
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


@router.put("/{user_id}/tags/{tag_id}", response_model=TagRead)
async def update_tag(
    user_id: UUID,
    tag_id: UUID,
    tag_data: TagUpdate,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    session: Session = Depends(get_session),
):
    """
    Update an existing tag.

    Args:
        user_id: User ID from URL path
        tag_id: Tag ID to update
        tag_data: Tag update data
        current_user_id: Authenticated user ID from JWT
        session: Database session

    Returns:
        Updated tag

    Raises:
        HTTPException: If tag not found or user ID mismatch
    """
    # Verify user ownership
    if current_user_id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Get tag
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found",
        )

    # Verify tag ownership
    if tag.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: tag belongs to another user",
        )

    # Update tag fields
    tag_data_dict = tag_data.model_dump(exclude_unset=True)
    for field, value in tag_data_dict.items():
        setattr(tag, field, value)

    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


@router.delete("/{user_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    user_id: UUID,
    tag_id: UUID,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    session: Session = Depends(get_session),
):
    """
    Delete a tag.

    Args:
        user_id: User ID from URL path
        tag_id: Tag ID to delete
        current_user_id: Authenticated user ID from JWT
        session: Database session

    Raises:
        HTTPException: If tag not found or user ID mismatch
    """
    # Verify user ownership
    if current_user_id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Get tag
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found",
        )

    # Verify tag ownership
    if tag.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: tag belongs to another user",
        )

    # Delete tag (cascade will remove task_tags entries)
    session.delete(tag)
    session.commit()
    return None
