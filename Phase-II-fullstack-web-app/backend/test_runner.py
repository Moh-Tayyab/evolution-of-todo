#!/usr/bin/env python
"""
Simple test runner script to run a specific test without pytest's complexity.
"""
import asyncio
import sys
from uuid import uuid4
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# Add src to path
sys.path.insert(0, '.')

from src.mcp.tools import add_task

TEST_DATABASE_URL = "sqlite+aiosqlite:///test_simple.db"


async def run_test():
    """Run a simple test."""
    print("Creating test database...")
    test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(test_engine) as session:
        print("Running test...")
        test_user_id = uuid4()

        result = await add_task(session, test_user_id, "Buy milk")

        print(f"Result success: {result.success}")
        print(f"Result data: {result.data}")
        assert result.success is True
        assert result.data["title"] == "Buy milk"
        print("✓ Test passed!")

    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

    print("All tests passed!")


if __name__ == "__main__":
    asyncio.run(run_test())
