#!/usr/bin/env python3
"""
Database seed script for Phase II Todo Application

Inserts sample data for testing purposes.

Usage:
    cd backend
    python scripts/seed.py
"""

import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session
from src.database import engine
from src.models import Task, Tag, TaskTag, Priority
from datetime import datetime
from uuid import uuid4, UUID
import random


SAMPLE_USERS = [
    UUID("123e4567-e89b-12d3-a456-426614174000"),
]

SAMPLE_TASKS = [
    {
        "title": "Complete Phase II implementation",
        "description": "Finish implementing all user stories for the full-stack web application",
        "priority": Priority.HIGH,
        "completed": False,
    },
    {
        "title": "Write comprehensive tests",
        "description": "Achieve >=80% backend coverage and >=70% frontend coverage",
        "priority": Priority.MEDIUM,
        "completed": False,
    },
    {
        "title": "Set up CI/CD pipeline",
        "description": "Configure GitHub Actions for automated testing and deployment",
        "priority": Priority.LOW,
        "completed": True,
    },
    {
        "title": "Review alignment with Hackathon-II requirements",
        "description": "Ensure all requirements are met and documented",
        "priority": Priority.HIGH,
        "completed": True,
    },
    {
        "title": "Create deployment documentation",
        "description": "Document how to deploy the application to production",
        "priority": Priority.MEDIUM,
        "completed": False,
    },
]

SAMPLE_TAGS = [
    {"name": "Development", "color": "#3B82F6"},
    {"name": "Testing", "color": "#10B981"},
    {"name": "Documentation", "color": "#F59E0B"},
    {"name": "Hackathon", "color": "#EF4444"},
    {"name": "Urgent", "color": "#DC2626"},
]


def clear_sample_data():
    """Clear existing sample data."""
    print("\nClearing existing sample data...")
    from sqlmodel import delete
    with Session(engine) as session:
        # Delete task_tags relationships
        session.exec(delete(TaskTag))
        # Delete tasks
        session.exec(delete(Task))
        # Delete tags
        session.exec(delete(Tag))
        session.commit()
    print("✓ Cleared existing sample data")


def seed_tags(user_id: UUID) -> list[Tag]:
    """Create sample tags."""
    print("\nSeeding tags...")
    tags = []
    with Session(engine) as session:
        for tag_data in SAMPLE_TAGS:
            tag = Tag(
                id=uuid4(),
                user_id=user_id,
                **tag_data
            )
            session.add(tag)
            tags.append(tag)
        session.commit()
        for tag in tags:
            session.refresh(tag)
    print(f"✓ Created {len(tags)} tags")
    return tags


def seed_tasks(user_id: UUID, tags: list[Tag]) -> list[Task]:
    """Create sample tasks with random tag assignments."""
    print("\nSeeding tasks...")
    tasks = []
    with Session(engine) as session:
        for task_data in SAMPLE_TASKS:
            task = Task(
                id=uuid4(),
                user_id=user_id,
                **task_data
            )
            session.add(task)
            tasks.append(task)
        session.commit()
        for task in tasks:
            session.refresh(task)

            # Assign random tags (1-3 tags per task)
            num_tags = random.randint(1, min(3, len(tags)))
            assigned_tags = random.sample(tags, num_tags)
            for tag in assigned_tags:
                task_tag = TaskTag(task_id=task.id, tag_id=tag.id)
                session.add(task_tag)
            session.commit()

    print(f"✓ Created {len(tasks)} tasks")
    return tasks


def main():
    """Run seed script."""
    print("\n" + "=" * 60)
    print("PHASE II TODO APPLICATION - DATABASE SEED")
    print("=" * 60)

    user_id = SAMPLE_USERS[0]

    # Clear existing data
    clear_sample_data()

    # Create tags
    tags = seed_tags(user_id)

    # Create tasks with tags
    tasks = seed_tasks(user_id, tags)

    # Summary
    print("\n" + "=" * 60)
    print("SEEDING COMPLETE ✓")
    print("=" * 60)
    print(f"\nCreated sample data for user: {user_id}")
    print(f"  Tasks: {len(tasks)}")
    print(f"  Tags: {len(tags)}")
    print("\nSign in credentials:")
    print("  Email: Use your Better Auth account")
    print("  The sample tasks will appear after sign in")

    return 0


if __name__ == "__main__":
    sys.exit(main())
