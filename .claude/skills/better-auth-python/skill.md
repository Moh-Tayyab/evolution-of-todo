# Better Auth Python Skill

## Overview
This skill provides expertise for Better Auth integration with Python FastAPI backends. Use it for authentication setup, session management, OAuth providers, and plugin configuration.

## Usage
Invoke this skill when you need help with:
- Setting up Better Auth with FastAPI
- Configuring OAuth providers (GitHub, Google, etc.)
- Implementing JWT session handling
- Adding auth plugins (2FA, username, phone, etc.)
- Managing user sessions and cookies
- Handling authentication middleware

## Core Concepts

### Basic Setup

```python
from fastapi import FastAPI, Depends
from better_auth import BetterAuth

app = FastAPI()
auth = BetterAuth(
    app=app,
    database_url="postgresql://user:password@localhost:5432/db",
    secret="your-secret-key",
)
app.mount("/auth", auth.router)
```

### Email/Password Authentication

```python
from better_auth.plugins import email_password

auth = BetterAuth(
    plugins=[
        email_password(
            enabled=True,
            require_email_verification=True,
        )
    ]
)
```

### OAuth Providers

```python
from better_auth.providers import GitHubProvider, GoogleProvider

auth = BetterAuth(
    providers=[
        GitHubProvider(
            client_id=os.getenv("GITHUB_CLIENT_ID"),
            client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
        ),
        GoogleProvider(
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        )
    ]
)
```

### Session Management

```python
from fastapi import Depends, HTTPException

async def get_current_user(
    session: dict = Depends(auth.get_session)
):
    user_id = session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = await get_user_by_id(user_id)
    return user

@app.get("/protected-route")
async def protected_route(user: User = Depends(get_current_user)):
    return {"message": f"Hello {user.name}", "user_id": user.id}
```

## Examples

### Sign Up Route

```python
@app.post("/auth/signup")
async def signup(email: str, password: str, name: str):
    user = await auth.create_user(email=email, password=password, name=name)
    return {"message": "User created", "user_id": user.id}
```

### Sign In Route

```python
@app.post("/auth/signin")
async def signin(request: Request, email: str, password: str):
    session = await auth.authenticate(email, password)
    response = JSONResponse({"message": "Signed in"})
    response.set_cookie(key="better_auth_session", value=session.token)
    return response
```

### Protected API Route

```python
@app.get("/api/todos")
async def get_todos(user: User = Depends(get_current_user)):
    todos = await db.execute(select(Todo).where(Todo.user_id == user.id))
    return todos
```

## Best Practices

1. **HTTPS in production** - Always use secure cookies
2. **Strong secret keys** - Use environment variables
3. **Email verification** - Require email verification for security
4. **Session timeout** - Configure appropriate session expiration
5. **Rate limiting** - Protect auth endpoints from abuse
6. **Secure password storage** - Always hash passwords
7. **Error messages** - Don't leak information
8. **OAuth state** - Use proper state parameters
9. **JWT validation** - Verify JWT signature and expiration
10. **Logout everywhere** - Invalidate all sessions

## Common Pitfalls

### Cookie Issues
Always set correct cookie attributes:
```python
response.set_cookie(
    key="session",
    value=token,
    httponly=True,
    secure=True,
    samesite="lax"
)
```

## Tools Used
- **Read/Grep Tools:** Examine code, find patterns, read existing implementations
- **Write/Edit Tools:** Create new schemas/endpoints, modify existing code
- **Bash:** Run servers, execute migrations, install dependencies
- **Context7 MCP:** Semantic search in PostgreSQL/Python/Helm documentation

## Verification Process
After implementing changes:
1. **Health Check:** Verify application is running (`/health` endpoint or similar)
2. **Database Check:** Run query to verify database connection
3. **Migration Check:** Confirm migrations applied successfully
4. **Integration Check:** Test API calls work end-to-end
5. **Log Review:** Check for errors in application logs

## Error Patterns
Common errors to recognize:
- **Connection errors:** Database/API unreachable, network timeouts
- **Schema errors:** Invalid table/column names, constraint violations
- **Type errors:** Invalid data types, missing fields
- **Authentication errors:** Invalid tokens, expired sessions
- **Configuration errors:** Missing environment variables, invalid config
