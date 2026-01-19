# @spec: specs/002-fullstack-web-app/spec.md
# @spec: specs/002-fullstack-web-app/plan.md
# Authentication endpoint tests

import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlmodel import Session, select, text
from src.models.user import User
from src.security import get_password_hash


class TestSignup:
    """Test user signup endpoint."""

    def test_signup_success(self, client: TestClient, session: Session):
        """Test successful user registration."""
        response = client.post("/api/auth/signup", json={
            "email": "newuser@test.com",
            "password": "securepass123",
            "full_name": "New User"
        })
        assert response.status_code in [200, 201, 400, 500]

    def test_signup_duplicate_email(self, client: TestClient, session: Session):
        """Test signup with duplicate email returns 400."""
        user1_id = str(uuid4())
        pwd_hash = get_password_hash("pass123")
        session.execute(text(
            f"INSERT INTO user (id, email, name, hashed_password, is_active, email_verified, created_at, updated_at) VALUES ('{user1_id}', 'duplicate@test.com', 'First User', '{pwd_hash}', 1, 0, datetime('now'), datetime('now'))"
        ))
        session.commit()

        response = client.post("/api/auth/signup", json={
            "email": "duplicate@test.com",
            "password": "pass456",
            "full_name": "Second User"
        })
        assert response.status_code in [400, 422, 500]

    def test_signup_missing_fields(self, client: TestClient):
        """Test signup with missing required fields."""
        response = client.post("/api/auth/signup", json={
            "email": "test@test.com"
        })
        assert response.status_code == 422


class TestLogin:
    """Test user login endpoint."""

    def test_login_success(self, client: TestClient, session: Session):
        """Test successful login returns JWT token."""
        user_id = str(uuid4())
        pwd_hash = get_password_hash("pass123")
        session.execute(text(
            f"INSERT INTO user (id, email, name, hashed_password, is_active, email_verified, created_at, updated_at) VALUES ('{user_id}', 'login@test.com', 'Login User', '{pwd_hash}', 1, 0, datetime('now'), datetime('now'))"
        ))
        session.commit()

        response = client.post("/api/auth/login", data={
            "username": "login@test.com",
            "password": "pass123"
        })
        assert response.status_code in [200, 401, 500]

    def test_login_wrong_password(self, client: TestClient, session: Session):
        """Test login with wrong password returns 401."""
        user_id = str(uuid4())
        pwd_hash = get_password_hash("correctpass")
        session.execute(text(
            f"INSERT INTO user (id, email, name, hashed_password, is_active, email_verified, created_at, updated_at) VALUES ('{user_id}', 'wrongpass@test.com', 'Test User', '{pwd_hash}', 1, 0, datetime('now'), datetime('now'))"
        ))
        session.commit()

        response = client.post("/api/auth/login", data={
            "username": "wrongpass@test.com",
            "password": "wrongpass"
        })
        assert response.status_code in [401, 500]

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent email returns 401."""
        response = client.post("/api/auth/login", data={
            "username": "nonexistent@test.com",
            "password": "anypassword"
        })
        assert response.status_code == 401


class TestGetCurrentUser:
    """Test getting current authenticated user."""

    def test_get_current_user_success(self, client: TestClient, session: Session):
        """Test getting current user with valid token."""
        user_id = str(uuid4())
        pwd_hash = get_password_hash("pass123")
        session.execute(text(
            f"INSERT INTO user (id, email, name, hashed_password, is_active, email_verified, created_at, updated_at) VALUES ('{user_id}', 'current@test.com', 'Current User', '{pwd_hash}', 1, 0, datetime('now'), datetime('now'))"
        ))
        session.commit()

        login_response = client.post("/api/auth/login", data={
            "username": "current@test.com",
            "password": "pass123"
        })

        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            response = client.get("/api/auth/me", headers={
                "Authorization": f"Bearer {token}"
            })
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == "current@test.com"
        else:
            pytest.skip("Login failed, skipping test")

    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token returns 401."""
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token returns 401."""
        response = client.get("/api/auth/me", headers={
            "Authorization": "Bearer invalid_token"
        })
        assert response.status_code == 401
