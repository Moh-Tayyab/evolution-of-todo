# @spec: specs/002-fullstack-web-app/spec.md
# @spec: specs/002-fullstack-web-app/data-model.md
# @spec: specs/002-fullstack-web-app/plan.md
# Task CRUD endpoints with search, filter, sort

from typing import List, Optional, Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, col

from src.api.deps import get_current_user_id
from src.database import get_session
from src.models.task import Task, Priority
from src.schemas.task import TaskCreate, TaskUpdate, TaskRead

router = APIRouter()


@router.get("/{user_id}/tasks", response_model=List[TaskRead])
async def list_tasks(
    user_id: UUID,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    session: Session = Depends(get_session),
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[Priority] = None,
    tag_ids: Optional[List[UUID]] = None,
    sort: Optional[str] = "created_at",
    order: Optional[str] = "desc",
):
    """
    List tasks for a user with optional filtering and sorting.

    Args:
        user_id: User ID from URL path
        current_user_id: Authenticated user ID from JWT
        session: Database session
        search: Search term (title, description, tags)
        status_filter: Filter by completion status (all, completed, incomplete)
        priority: Filter by priority level
        tag_ids: Filter by tag IDs
        sort: Sort field (created_at, priority, title)
        order: Sort direction (asc, desc)

    Returns:
        List of tasks
    """
    # Verify user ownership
    if current_user_id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Build query
    query = select(Task).where(Task.user_id == user_id)

    # Apply filters
    if status_filter == "completed":
        query = query.where(Task.completed == True)
    elif status_filter == "incomplete":
        query = query.where(Task.completed == False)

    if priority:
        query = query.where(Task.priority == priority)

    if tag_ids:
        # Filter tasks that have ALL the specified tags (AND logic)
        from src.models.task_tag import TaskTag
        for tag_id in tag_ids:
            query = query.where(
                Task.id.in_(
                    select(TaskTag.task_id).where(TaskTag.tag_id == tag_id)
                )
            )

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Task.title.ilike(search_pattern)) |
            (Task.description.ilike(search_pattern))
        )

    # Apply sorting
    sort_column = col(Task.created_at)
    if sort == "priority":
        # Map priority to numeric values for sorting
        sort_column = col(Task.priority)
    elif sort == "title":
        sort_column = col(Task.title)

    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Execute query
    tasks = session.exec(query).all()
    return tasks


@router.post("/{user_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: UUID,
    task_data: TaskCreate,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    session: Session = Depends(get_session),
):
    """
    Create a new task for a user.

    Args:
        user_id: User ID from URL path
        task_data: Task creation data
        current_user_id: Authenticated user ID from JWT
        session: Database session

    Returns:
        Created task

    Raises:
        HTTPException: If user ID mismatch or task limit reached
    """
    # Verify user ownership
    if current_user_id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Check task limit (100 per user)
    existing_count = session.exec(
        select(Task).where(Task.user_id == user_id)
    ).count()

    if existing_count >= 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task limit reached: maximum 100 tasks per user",
        )

    # Create task
    task = Task.model_validate(task_data, update={"user_id": user_id})
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def update_task(
    user_id: UUID,
    task_id: UUID,
    task_data: TaskUpdate,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    session: Session = Depends(get_session),
):
    """
    Update an existing task.

    Args:
        user_id: User ID from URL path
        task_id: Task ID to update
        task_data: Task update data
        current_user_id: Authenticated user ID from JWT
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: If task not found or user ID mismatch
    """
    # Verify user ownership
    if current_user_id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Get task
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Verify task ownership
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: task belongs to another user",
        )

    # Update task fields
    task_data_dict = task_data.model_dump(exclude_unset=True)
    for field, value in task_data_dict.items():
        setattr(task, field, value)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.patch("/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def patch_task(
    user_id: UUID,
    task_id: UUID,
    task_data: TaskUpdate,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    session: Session = Depends(get_session),
):
    """
    Partially update an existing task.

    Args:
        user_id: User ID from URL path
        task_id: Task ID to update
        task_data: Task partial update data
        current_user_id: Authenticated user ID from JWT
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: If task not found or user ID mismatch
    """
    # Verify user ownership
    if current_user_id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Get task
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Verify task ownership
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: task belongs to another user",
        )

    # Update task fields (partial update)
    task_data_dict = task_data.model_dump(exclude_unset=True)
    for field, value in task_data_dict.items():
        setattr(task, field, value)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: UUID,
    task_id: UUID,
    current_user_id: Annotated[str, Depends(get_current_user_id)],
    session: Session = Depends(get_session),
):
    """
    Delete a task.

    Args:
        user_id: User ID from URL path
        task_id: Task ID to delete
        current_user_id: Authenticated user ID from JWT
        session: Database session

    Raises:
        HTTPException: If task not found or user ID mismatch
    """
    # Verify user ownership
    if current_user_id != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user ID mismatch",
        )

    # Get task
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Verify task ownership
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: task belongs to another user",
        )

    # Delete task
    session.delete(task)
    session.commit()
    return None
