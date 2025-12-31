# Authentication Flows: Phase II Todo Full-Stack Web Application

**Feature**: 002-fullstack-web-app
**Date**: 2025-12-29
**Status**: Complete

## Overview

Authentication is handled by Better Auth on the frontend with JWT tokens verified by the FastAPI backend. This document describes the authentication flows and token handling.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│   Better Auth   │────▶│    Database     │
│   (Next.js)     │     │   (Frontend)    │     │   (users tbl)   │
│                 │     │                 │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │ JWT in Authorization header
         ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│    Backend      │────▶│    Database     │
│   (FastAPI)     │     │   (tasks tbl)   │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Flow 1: User Registration (Sign Up)

```
┌──────────┐          ┌──────────────┐          ┌──────────┐
│  User    │          │   Frontend   │          │ Database │
└────┬─────┘          └──────┬───────┘          └────┬─────┘
     │                       │                       │
     │ 1. Fill signup form   │                       │
     │──────────────────────▶│                       │
     │                       │                       │
     │                       │ 2. Validate (Zod)     │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │ 3. better-auth.signUp()
     │                       │ (email, password)     │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │ 4. Hash password,     │
     │                       │    create user        │
     │                       │◀──────────────────────│
     │                       │                       │
     │                       │ 5. Issue JWT + session│
     │                       │                       │
     │ 6. Redirect to        │                       │
     │    /dashboard         │                       │
     │◀──────────────────────│                       │
     │                       │                       │
```

### Sign Up Request/Response

**Frontend Call** (Better Auth):
```typescript
const { user, session } = await authClient.signUp.email({
  email: "user@example.com",
  password: "SecurePass123",
  name: "John Doe", // optional
});
```

**Success Response**:
- User object with id, email, name
- Session with JWT token (stored in cookie or localStorage)
- Redirect to `/dashboard`

**Error Cases**:
| Condition | Frontend Message |
|-----------|------------------|
| Email already exists | "An account with this email already exists" |
| Invalid email format | "Please enter a valid email address" |
| Weak password | "Password must have at least 8 characters, 1 uppercase, 1 lowercase, 1 number" |

## Flow 2: User Authentication (Sign In)

```
┌──────────┐          ┌──────────────┐          ┌──────────┐
│  User    │          │   Frontend   │          │ Database │
└────┬─────┘          └──────┬───────┘          └────┬─────┘
     │                       │                       │
     │ 1. Fill signin form   │                       │
     │──────────────────────▶│                       │
     │                       │                       │
     │                       │ 2. Validate (Zod)     │
     │                       │                       │
     │                       │ 3. better-auth.signIn()
     │                       │ (email, password)     │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │ 4. Verify credentials │
     │                       │◀──────────────────────│
     │                       │                       │
     │                       │ 5. Issue JWT (24h)    │
     │                       │    + session          │
     │                       │                       │
     │ 6. Redirect to        │                       │
     │    /dashboard         │                       │
     │◀──────────────────────│                       │
     │                       │                       │
```

### Sign In Request/Response

**Frontend Call** (Better Auth):
```typescript
const { user, session } = await authClient.signIn.email({
  email: "user@example.com",
  password: "SecurePass123",
});
```

**JWT Token Structure** (payload):
```json
{
  "sub": "123e4567-e89b-12d3-a456-426614174000",  // user_id
  "email": "user@example.com",
  "iat": 1703851200,  // issued at
  "exp": 1703937600   // expires (24h later)
}
```

**Error Cases**:
| Condition | Frontend Message |
|-----------|------------------|
| Invalid credentials | "Invalid email or password" (generic for security) |
| Account not found | "Invalid email or password" (same message) |

## Flow 3: Authenticated API Request

```
┌──────────┐          ┌──────────────┐          ┌──────────┐
│  User    │          │   Frontend   │          │ Backend  │
└────┬─────┘          └──────┬───────┘          └────┬─────┘
     │                       │                       │
     │ 1. Interact with UI   │                       │
     │──────────────────────▶│                       │
     │                       │                       │
     │                       │ 2. Get JWT from       │
     │                       │    session/storage    │
     │                       │                       │
     │                       │ 3. API call with      │
     │                       │    Authorization:     │
     │                       │    Bearer <jwt>       │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │ 4. Verify JWT         │
     │                       │    signature          │
     │                       │                       │
     │                       │ 5. Extract user_id    │
     │                       │    from JWT           │
     │                       │                       │
     │                       │ 6. Validate user_id   │
     │                       │    matches path param │
     │                       │                       │
     │                       │ 7. Execute operation  │
     │                       │                       │
     │                       │ 8. Return response    │
     │◀──────────────────────│◀──────────────────────│
     │                       │                       │
```

### API Request Example

**Frontend API Client**:
```typescript
// @spec: specs/002-fullstack-web-app/contracts/auth-flows.md

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await authClient.getSession();

  if (!session?.token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired, redirect to signin
    window.location.href = "/signin";
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### Backend JWT Verification

```python
# @spec: specs/002-fullstack-web-app/contracts/auth-flows.md

from fastapi import Depends, HTTPException, Header
from jose import jwt, JWTError
from config import settings

async def verify_jwt(authorization: str = Header(...)) -> dict:
    """Extract and verify JWT from Authorization header."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")

    token = authorization[7:]  # Remove "Bearer " prefix

    try:
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")

async def get_current_user_id(
    user_id: str,  # From path parameter
    jwt_payload: dict = Depends(verify_jwt)
) -> str:
    """Validate that path user_id matches JWT subject."""
    if jwt_payload.get("sub") != user_id:
        raise HTTPException(403, "Access denied to this resource")
    return user_id
```

## Flow 4: Sign Out

```
┌──────────┐          ┌──────────────┐
│  User    │          │   Frontend   │
└────┬─────┘          └──────┬───────┘
     │                       │
     │ 1. Click Sign Out     │
     │──────────────────────▶│
     │                       │
     │                       │ 2. better-auth.signOut()
     │                       │    (clears session/cookie)
     │                       │
     │ 3. Redirect to        │
     │    /signin            │
     │◀──────────────────────│
     │                       │
```

### Sign Out Implementation

```typescript
const handleSignOut = async () => {
  await authClient.signOut();
  router.push("/signin");
};
```

## Flow 5: Token Expiration Handling

```
┌──────────┐          ┌──────────────┐          ┌──────────┐
│  User    │          │   Frontend   │          │ Backend  │
└────┬─────┘          └──────┬───────┘          └────┬─────┘
     │                       │                       │
     │ 1. Interact with UI   │                       │
     │──────────────────────▶│                       │
     │                       │                       │
     │                       │ 2. API call with      │
     │                       │    expired JWT        │
     │                       │──────────────────────▶│
     │                       │                       │
     │                       │ 3. 401 Unauthorized   │
     │                       │◀──────────────────────│
     │                       │                       │
     │                       │ 4. Clear session      │
     │                       │                       │
     │ 5. Redirect to        │                       │
     │    /signin with       │                       │
     │    "Session expired"  │                       │
     │◀──────────────────────│                       │
     │                       │                       │
```

## Protected Route Pattern

**Frontend (ProtectedRoute component)**:
```typescript
// @spec: specs/002-fullstack-web-app/contracts/auth-flows.md

"use client";

import { useSession } from "better-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| JWT stored in localStorage | Use httpOnly cookies where possible |
| Token theft | 24h expiration limits exposure window |
| CSRF | JWT in header (not cookie) prevents CSRF |
| Timing attacks | Use constant-time comparison for token validation |
| User enumeration | Generic "Invalid email or password" message |

## Environment Variables

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<shared-secret-min-32-chars>
BETTER_AUTH_URL=http://localhost:3000
```

**Backend (.env)**:
```
DATABASE_URL=postgresql://user:pass@neon.tech/dbname
BETTER_AUTH_SECRET=<same-shared-secret>
CORS_ORIGINS=http://localhost:3000
```

**CRITICAL**: `BETTER_AUTH_SECRET` must be identical in both frontend and backend for JWT verification to work.
