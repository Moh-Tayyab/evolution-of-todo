# Better Auth Python Setup

from fastapi import FastAPI, Depends, HTTPException
from better_auth import BetterAuth
from better_auth.plugins import email_password

# Initialize FastAPI app
app = FastAPI()

# Configure Better Auth with email/password plugin
auth = BetterAuth(
    app=app,
    database_url="postgresql://user:password@localhost:5432/db",
    secret=os.getenv("BETTER_AUTH_SECRET"),
    plugins=[
        email_password(
            enabled=True,
            require_email_verification=True,
        )
    ]
)

# Mount auth router
app.mount("/auth", auth.router)


# Dependency to get current user
async def get_current_user(
    session: dict = Depends(auth.get_session)
):
    user_id = session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await auth.get_user(user_id)


# Protected route example
@app.get("/api/todos")
async def get_todos(user: dict = Depends(get_current_user)):
    return {"message": f"Hello {user['name']}", "user_id": user["id"]}
