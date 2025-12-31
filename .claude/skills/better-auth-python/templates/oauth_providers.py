# OAuth Providers Configuration

from better_auth import BetterAuth
from better_auth.providers import GitHubProvider, GoogleProvider

auth = BetterAuth(
    database_url="postgresql://user:password@localhost:5432/db",
    secret=os.getenv("BETTER_AUTH_SECRET"),
    providers=[
        # GitHub OAuth
        GitHubProvider(
            client_id=os.getenv("GITHUB_CLIENT_ID"),
            client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
            scope=["user:email"],
        ),
        # Google OAuth
        GoogleProvider(
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
            scope=["openid", "email", "profile"],
        )
    ]
)


# OAuth callback route
@app.get("/auth/callback/{provider}")
async def oauth_callback(provider: str, code: str):
    user = await auth.handle_oauth_callback(provider, code)
    response = JSONResponse({"message": "Logged in"})
    response.set_cookie(
        key="better_auth_session",
        value=user.session_token,
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return response
