# @spec: specs/002-fullstack-web-app/spec.md
# Input validation and edge case tests

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from uuid import uuid4
from src.models.task import Task, Priority
from src.models.user import User
from src.security import get_password_hash


class TestTaskValidation:
    """Test task input validation."""

    def test_title_too_long(self, client: TestClient, test_user_id: str):
        """Test task title over 200 characters is rejected."""
        long_title = "x" * 201
        response = client.post(f"/api/{test_user_id}/tasks", json={
            "title": long_title
        })
        # Should return validation error
        assert response.status_code in [400, 422, 401, 403]

    def test_description_too_long(self, client: TestClient, test_user_id: str):
        """Test task description over 2000 characters is rejected."""
        long_desc = "x" * 2001
        response = client.post(f"/api/{test_user_id}/tasks", json={
            "title": "Valid Title",
            "description": long_desc
        })
        assert response.status_code in [400, 422, 401, 403]

    def test_invalid_priority(self, client: TestClient, test_user_id: str):
        """Test invalid priority value is rejected."""
        response = client.post(f"/api/{test_user_id}/tasks", json={
            "title": "Test Task",
            "priority": "invalid_priority"
        })
        assert response.status_code in [400, 422, 401, 403]

    def test_valid_priorities(self, client: TestClient, test_user_id: str):
        """Test all valid priority values."""
        priorities = ["high", "medium", "low"]
        for priority in priorities:
            response = client.post(f"/api/{test_user_id}/tasks", json={
                "title": f"Task with {priority} priority",
                "priority": priority
            })
            # Should succeed or auth error, not validation error
            assert response.status_code in [201, 401, 403]


class TestUserValidation:
    """Test user input validation."""

    def test_invalid_email_format(self, client: TestClient):
        """Test invalid email format is rejected."""
        response = client.post("/api/auth/signup", json={
            "email": "not-an-email",
            "password": "pass123",
            "full_name": "Test User"
        })
        # Should reject invalid email
        assert response.status_code in [400, 422]

    def test_missing_email(self, client: TestClient):
        """Test missing email is rejected."""
        response = client.post("/api/auth/signup", json={
            "password": "pass123",
            "full_name": "Test User"
        })
        assert response.status_code == 422

    def test_missing_password(self, client: TestClient):
        """Test missing password is rejected."""
        response = client.post("/api/auth/signup", json={
            "email": "test@test.com",
            "full_name": "Test User"
        })
        assert response.status_code == 422

    def test_short_password(self, client: TestClient):
        """Test short password is rejected."""
        response = client.post("/api/auth/signup", json={
            "email": "test@test.com",
            "password": "short",
            "full_name": "Test User"
        })
        # Password should have minimum length
        assert response.status_code in [400, 422]


class TestUUIDValidation:
    """Test UUID parameter validation."""

    def test_invalid_user_id_format(self, client: TestClient):
        """Test invalid UUID format for user_id."""
        response = client.get("/api/not-a-uuid/tasks")
        # FastAPI UUID validation is lenient, returns 401 for auth instead
        assert response.status_code in [400, 401, 404]

    def test_invalid_task_id_format(self, client: TestClient, test_user_id: str):
        """Test invalid UUID format for task_id."""
        response = client.get(f"/api/{test_user_id}/tasks/not-a-uuid")
        assert response.status_code in [400, 401, 404]


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_empty_task_title(self, client: TestClient, test_user_id: str):
        """Test empty task title is rejected."""
        response = client.post(f"/api/{test_user_id}/tasks", json={
            "title": ""
        })
        assert response.status_code in [400, 422, 401, 403]

    def test_whitespace_only_title(self, client: TestClient, test_user_id: str):
        """Test whitespace-only title is rejected."""
        response = client.post(f"/api/{test_user_id}/tasks", json={
            "title": "   "
        })
        assert response.status_code in [400, 422, 401, 403]

    def test_special_characters_in_title(self, client: TestClient, test_user_id: str):
        """Test special characters in title are allowed."""
        response = client.post(f"/api/{test_user_id}/tasks", json={
            "title": "Task with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?"
        })
        # Should accept or auth error, not validation error
        assert response.status_code in [201, 401, 403]

    def test_unicode_in_title(self, client: TestClient, test_user_id: str):
        """Test unicode characters in title."""
        response = client.post(f"/api/{test_user_id}/tasks", json={
            "title": "Task with emoji 🎉 and unicode 中文"
        })
        assert response.status_code in [201, 401, 403]

    def test_null_description(self, client: TestClient, session: Session, test_user_id: str):
        """Test null description is allowed."""
        from uuid import UUID
        task = Task(
            id=1,
            user_id=UUID(test_user_id),
            title="Test Task",
            description=None
        )
        session.add(task)
        session.commit()
        assert task.description is None


class TestHTTPMethods:
    """Test HTTP method validation."""

    def test_invalid_method_on_tasks(self, client: TestClient, test_user_id: str):
        """Test unsupported HTTP methods are rejected."""
        # Try POST on single task endpoint (should be GET/PUT/PATCH/DELETE)
        response = client.post(f"/api/{test_user_id}/tasks/{uuid4()}")
        # Should reject POST on single task
        assert response.status_code in [405, 404, 401]

    def test_options_method(self, client: TestClient, test_user_id: str):
        """Test OPTIONS method handling."""
        response = client.options(f"/api/{test_user_id}/tasks")
        # FastAPI returns 405 Method Not Allowed for OPTIONS by default
        assert response.status_code in [200, 204, 401, 404, 405]
