# Session Middleware and Auth Decorator

from functools import wraps
from fastapi import Request, HTTPException


# Session verification decorator
def require_auth(func):
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        session_token = request.cookies.get("better_auth_session")
        if not session_token:
            raise HTTPException(status_code=401, detail="No session found")

        # Verify session
        session = await auth.verify_session(session_token)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")

        # Add user to request state
        request.state.user = session.user
        return await func(request, *args, **kwargs)

    return wrapper


# Usage with FastAPI routes
@app.get("/api/protected")
@require_auth
async def protected_route(request: Request):
    user = request.state.user
    return {"user_id": user.id, "email": user.email}


# Optional auth (doesn't require login)
async def get_optional_user(request: Request):
    session_token = request.cookies.get("better_auth_session")
    if session_token:
        session = await auth.verify_session(session_token)
        return session.user if session else None
    return None


@app.get("/api/public")
async def public_route(user: dict | None = Depends(get_optional_user)):
    if user:
        return {"message": "Hello logged in user", "user_id": user.id}
    return {"message": "Hello guest"}
