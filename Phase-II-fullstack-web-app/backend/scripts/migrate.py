#!/usr/bin/env python3
"""
Database migration script for Phase II Todo Application

Creates all tables and indexes in the Neon PostgreSQL database.
Run this script to initialize the database schema.

Usage:
    cd backend
    python scripts/migrate.py
"""

import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import SQLModel, select, Session
from src.database import engine, get_session
from src.models import Task, Tag, TaskTag, Priority
from src.config import get_settings
from datetime import datetime
from uuid import uuid4


def test_connection():
    """Test database connection and display connection info."""
    print("\n" + "=" * 60)
    print("DATABASE CONNECTION TEST")
    print("=" * 60)

    settings = get_settings()

    # Mask sensitive parts of connection string
    db_url = settings.database_url
    if "@" in db_url:
        # Extract host from connection string
        parts = db_url.split("@")
        host = parts[1].split("/")[0] if len(parts) > 1 else "unknown"
        print(f"✓ Database Host: {host}")

    print(f"✓ Database URL configured: Yes")

    # Test connection
    try:
        with Session(engine) as session:
            # Simple query to test connection
            result = session.execute(select(1)).scalar()
            if result == 1:
                print("✓ Database Connection: SUCCESS")
                return True
    except Exception as e:
        print(f"✗ Database Connection: FAILED")
        print(f"  Error: {e}")
        return False


def create_tables():
    """Create all database tables."""
    print("\n" + "=" * 60)
    print("CREATING DATABASE TABLES")
    print("=" * 60)

    try:
        SQLModel.metadata.create_all(engine)
        print("✓ Created tables:")
        print("  - tasks")
        print("  - tags")
        print("  - task_tags")
        return True
    except Exception as e:
        print(f"✗ Failed to create tables: {e}")
        return False


def verify_schema():
    """Verify that all tables and columns exist."""
    print("\n" + "=" * 60)
    print("VERIFYING DATABASE SCHEMA")
    print("=" * 60)

    try:
        with Session(engine) as session:
            # Check tasks table
            tasks_query = session.exec(select(Task).limit(1))
            print("✓ tasks table exists")
            print("  Columns: id, user_id, title, description, priority,")
            print("           completed, created_at, updated_at")

            # Check tags table
            tags_query = session.exec(select(Tag).limit(1))
            print("✓ tags table exists")
            print("  Columns: id, user_id, name, color, created_at")

            # Check task_tags junction table
            task_tags_query = session.exec(select(TaskTag).limit(1))
            print("✓ task_tags table exists")
            print("  Columns: task_id, tag_id")

            return True
    except Exception as e:
        print(f"✗ Schema verification failed: {e}")
        return False


def insert_sample_data():
    """Optionally insert sample data for testing."""
    print("\n" + "=" * 60)
    print("SAMPLE DATA (OPTIONAL)")
    print("=" * 60)
    print("To insert sample data, run:")
    print("  python scripts/seed.py")


def main():
    """Run all migration steps."""
    print("\n" + "=" * 60)
    print("PHASE II TODO APPLICATION - DATABASE MIGRATION")
    print("=" * 60)

    success = True

    # Step 1: Test connection
    if not test_connection():
        print("\n✗ Migration aborted: Database connection failed")
        print("  Please check your DATABASE_URL in .env")
        return 1

    # Step 2: Create tables
    if not create_tables():
        print("\n✗ Migration aborted: Failed to create tables")
        return 1

    # Step 3: Verify schema
    if not verify_schema():
        print("\n✗ Migration completed with warnings")
        success = False

    # Step 4: Sample data info
    insert_sample_data()

    # Summary
    print("\n" + "=" * 60)
    if success:
        print("MIGRATION COMPLETE ✓")
        print("=" * 60)
        print("\nNext steps:")
        print("  1. Start backend: uvicorn src.main:app --reload")
        print("  2. Start frontend: cd ../frontend && npm run dev")
        print("  3. Open: http://localhost:3000")
        return 0
    else:
        print("MIGRATION COMPLETE WITH WARNINGS ⚠")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
