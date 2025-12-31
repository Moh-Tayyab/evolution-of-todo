---
name: better-auth-python-expert
description: >
  Expert-level Better Auth Python skills with OAuth flow, session management,
  plugins, 2FA, JWT handling, and security best practices.
---

# Better Auth Python Expert Skill

You are a **Better Auth principal engineer** specializing in production authentication.

## Core Responsibilities

### 1.1 Better Auth Initialization

```python
# config/auth.py
from better_auth import BetterAuth
from better_auth.adapters import SQLAlchemyAdapter
from better_auth.plugins import EmailAndPasswordPlugin, MagicLinkPlugin
from better_auth.ui.models import User

# Database adapter
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("postgresql://user:pass@localhost:5432/db")
adapter = SQLAlchemyAdapter(engine)

# Initialize Better Auth
auth = BetterAuth(
    database=adapter,
    secret="your-secret-key-here-change-in-production",
    debug=False,  # Set False in production
    enable_password_reset=True,
    enable_magic_link=True,
)

# Plugin configuration
auth.register_plugin(
    EmailAndPasswordPlugin(
        enable_verification=True,  # Email verification required
        require_email_verification=True,  # User must verify email
        min_password_length=8,
    )
)

auth.register_plugin(
    MagicLinkPlugin(
        enable_magic_link=True,  # Send magic login links
        magic_link_token_expiry=3600,  # 1 hour
    )
)
```

### 1.2 OAuth Provider Integration

```python
# auth/oauth.py
from better_auth.plugins import OAuth2Plugin
from better_auth.adapters import SQLAlchemyAdapter
from authlib.integrations.google import GoogleOAuth2
from authlib.integrations.github import GitHubOAuth2
from better_auth.ui.models import User

# Google OAuth setup
google = GoogleOAuth2(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
)

# GitHub OAuth setup
github = GitHubOAuth2(
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
)

# OAuth plugin
oauth_plugin = OAuth2Plugin(
    # OAuth provider list
    providers={
        "google": {
            "client": google,
            "display_name": "Google",
            "icon_url": "/static/icons/google.svg",
        },
        "github": {
            "client": github,
            "display_name": "GitHub",
            "icon_url": "/static/icons/github.svg",
        },
    },
    # OAuth callback
    callback_url="/auth/callback",
    # User creation
    auto_register=True,  # Automatically register new users
    # User mapping
    get_user_func=get_or_create_user,
)

# Register OAuth plugin
auth.register_plugin(oauth_plugin)

# User lookup/creation function
async def get_or_create_user(
    oauth_name: str,
    user_info: dict,
) -> User:
    """Get or create user from OAuth data."""
    email = user_info.get("email")
    if not email:
        raise ValueError("Email required from OAuth provider")

    # Check if user exists
    db = auth.database
    user = await db.get_user_by_email(email)

    if not user:
        # Create new user
        user = await db.create_user(
            email=email,
            email_verified=True,  # OAuth provides verified email
            password_hash=None,  # No password for OAuth
            name=user_info.get("name"),
            avatar_url=user_info.get("picture"),
        )
    else:
        # Update user info
        user.name = user_info.get("name")
        user.avatar_url = user_info.get("picture")
        await db.update_user(user)

    return user
```

### 1.3 Session Management

```python
# auth/session.py
from better_auth import BetterAuth
from starlette.middleware.base import HTTPException
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import JSONResponse

# Session middleware
session_middleware = SessionMiddleware(
    secret="session-secret-key",
    same_site="lax",  # Allow cross-origin if needed
    max_age=3600 * 24 * 7,  # 7 days
    https_only=False,  # Allow both HTTP and HTTPS in development
)

# Session management
class SessionManager:
    def __init__(self, auth: BetterAuth):
        self.auth = auth

    async def create_session(self, user: User) -> str:
        """Create session for authenticated user."""
        return await self.auth.backend.create_session(user)

    async def get_session(self, token: str) -> User:
        """Get user from session token."""
        session_data = await self.auth.backend.get_session(token)
        if not session_data:
            raise HTTPException(status_code=401, detail="Invalid session")

        user_id = session_data.get("user_id")
        user = await self.auth.database.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    async def delete_session(self, token: str):
        """Delete session on logout."""
        await self.auth.backend.delete_session(token)

# Session dependency
async def get_current_user(token: str = None) -> User | None:
    """Dependency to get current user from session."""
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    session_manager = SessionManager(auth)
    return await session_manager.get_session(token)
```

### 1.4 JWT Token Management

```python
# auth/jwt.py
from datetime import datetime, timedelta
from jose import jwt, JWTError
from better_auth import BetterAuth

class JWTManager:
    def __init__(self, auth: BetterAuth):
        self.auth = auth
        self.secret = auth.secret

    def create_access_token(
        self,
        user_id: int,
        expires_in_minutes: int = 30
    ) -> str:
        """Create JWT access token."""
        payload = {
            "sub": str(user_id),
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=expires_in_minutes),
            "type": "access",
        }
        token = jwt.encode(payload, self.secret, algorithm="HS256")
        return token

    def create_refresh_token(
        self,
        user_id: int,
        expires_in_days: int = 7
    ) -> str:
        """Create JWT refresh token."""
        payload = {
            "sub": str(user_id),
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=expires_in_days),
            "type": "refresh",
        }
        token = jwt.encode(payload, self.secret, algorithm="HS256")
        return token

    def decode_token(self, token: str) -> dict | None:
        """Decode and validate JWT token."""
        try:
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            return payload
        except JWTError:
            raise ValueError("Invalid token")

    async def refresh_tokens(self, refresh_token: str) -> tuple[str, str] | None:
        """Refresh access token using refresh token."""
        try:
            payload = self.decode_token(refresh_token)
            user_id = int(payload.get("sub"))

            # Validate refresh token type
            if payload.get("type") != "refresh":
                raise ValueError("Invalid token type")

            # Create new tokens
            new_access_token = self.create_access_token(user_id)
            new_refresh_token = self.create_refresh_token(user_id)

            return new_access_token, new_refresh_token
        except Exception as e:
            raise ValueError(f"Token refresh failed: {str(e)}")

# JWT verification middleware
async def verify_jwt_token(token: str, secret: str) -> dict | None:
    """Verify JWT token and return user ID."""
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except JWTError:
        return None
```

### 1.5 Two-Factor Authentication (2FA)

```python
# auth/twofa.py
from better_auth import BetterAuth
import pyotp
from qrcode import QRCode
import io
import base64
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import JSONResponse

class TwoFactorAuth:
    def __init__(self, auth: BetterAuth):
        self.auth = auth

    async def setup_2fa(self, user_id: int) -> dict:
        """Setup 2FA for user: generate secret, show QR code."""
        # Generate TOTP secret
        secret = pyotp.random_base32()

        # Generate QR code for authenticator apps
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name="Todo App",
            issuer_name="example.com"
        )

        qr = QRCode(totp_uri)
        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to base64 for JSON response
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        # Store secret securely in database
        # In production, encrypt this secret
        await self.auth.database.update_user_2fa_secret(user_id, secret)

        return {
            "qr_code": img_str,
            "backup_codes": self.generate_backup_codes(secret),
            "message": "Scan QR code and enter code",
        }

    def generate_backup_codes(self, secret: str) -> list[str]:
        """Generate backup codes for 2FA."""
        totp = pyotp.TOTP(secret)
        codes = [totp.now() for _ in range(10)]
        return codes

    async def verify_2fa_code(
        self,
        user_id: int,
        code: str
    ) -> bool:
        """Verify 2FA code."""
        # Get user's 2FA secret
        user = await self.auth.database.get_user_by_id(user_id)
        if not user or not user.totp_secret:
            return False

        # Verify code
        totp = pyotp.TOTP(user.totp_secret)
        if totp.verify(code):
            # Mark as verified if needed
            # await self.auth.database.mark_2fa_verified(user_id)
            return True

        return False

    async def disable_2fa(self, user_id: int):
        """Disable 2FA for user."""
        await self.auth.database.disable_2fa(user_id, delete_secret=True)
        return True
```

### 1.6 Custom Plugins

```python
# auth/plugins/custom_plugin.py
from better_auth.core.plugins import AuthenticationPlugin
from starlette.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

class PhoneVerificationPlugin(AuthenticationPlugin):
    """Custom plugin for phone-based verification."""

    def __init__(self, auth):
        self.auth = auth

    async def send_verification_code(self, phone: str) -> dict:
        """Send SMS verification code."""
        # Generate 6-digit code
        code = "".join([str(random.randint(0, 9)) for _ in range(6)])

        # Store code temporarily (use Redis in production)
        # redis.setex(f"verify:{phone}", code, ex=300)
        await self.auth.database.save_verification_code(phone, code)

        # Send SMS (use Twilio, SendGrid, etc.)
        # sms_service.send(phone, f"Your verification code is: {code}")

        return {
            "message": "Verification code sent",
            "phone": phone[:3] + "****" + phone[-4:],  # Mask phone
        }

    async def verify_code(self, phone: str, code: str) -> bool:
        """Verify SMS verification code."""
        stored_code = await self.auth.database.get_verification_code(phone)

        if not stored_code or stored_code != code:
            return False

        # Clean up used code
        # await self.auth.database.delete_verification_code(phone)
        return True

# Register custom plugin
auth.register_plugin(PhoneVerificationPlugin(auth))
```

### 1.7 Security Best Practices

```python
# auth/security.py
from better_auth import BetterAuth
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.gzip import GZipMiddleware
from starlette.security import HTTPException

# Security middleware stack
def get_security_middleware(app):
    """Apply security middleware."""
    return [
        HTTPSRedirectMiddleware(app, allow_hosts=["localhost", "example.com"]),
        CORSMiddleware(
            app,
            allow_origins=["https://example.com"],
            allow_credentials=["cookies"],
            allow_methods=["*"],
            max_age=3600,
        ),
        TrustedHostMiddleware(app, allowed_hosts=["localhost", "*.example.com"]),
        GZipMiddleware(app, minimum_size=1000),
    ]

# CSRF protection
from starlette.middleware.csrf import CSRFMiddleware

csrf_middleware = CSRFMiddleware(
    secret="csrf-secret-key",
    cookie_secure=True,  # HTTPS only
    httponly=True,
    secure=False,
    samesite="strict",
)

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import HTTPException

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/hour"],
    storage_uri="memory://",  # Use Redis in production
)

@_rate_limit_exceeded
async def rate_limit_handler(request, exc):
    raise HTTPException(status_code=429, detail="Rate limit exceeded")

# Password policies
from password_strength import PasswordPolicy

PASSWORD_POLICY = PasswordPolicy(
    min_length=8,
    max_length=128,
    uppercase=True,
    numbers=True,
    special_chars=True,
    non_letters=False,  # No special letters in password
    spaces=False,
)

async def validate_password_strength(password: str) -> dict:
    """Validate password meets security requirements."""
    policy = PASSWORD_POLICY(password)

    return {
        "valid": policy.test(),
        "score": policy.strength(),
        "suggestions": list(policy.suggestions()),
    }
```

### 1.8 Production Deployment

```python
# main.py
from better_auth import BetterAuth
from better_auth.adapters import SQLAlchemyAdapter
from better_auth.starlette import BetterAuthStarlette
from better_auth.openapi import OpenAPIDocsPlugin
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.sessions import SessionMiddleware

# FastAPI app integration
app = Starlette()
auth = BetterAuth(
    database=SQLAlchemyAdapter(engine),
    secret=os.getenv("SECRET_KEY"),
    debug=False,
    plugins=[...],
)

# Mount auth routes with configuration
app.mount("/auth", BetterAuthStarlette(auth, backend=app))

# Add OpenAPI documentation
auth.register_plugin(
    OpenAPIDocsPlugin(
        prefix="/auth/docs",
        title="Authentication API",
        version="1.0.0",
    )
)

# Session middleware
app.add_middleware(
    SessionMiddleware,
    secret="session-secret-key",
    max_age=3600 * 24,  # 24 hours
)

# Security middleware
for middleware in get_security_middleware(app):
    app.add_middleware(middleware)

# Add CORS
from starlette.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_credentials=["cookies"],
    allow_methods=["*"],
)
)
```

---

## When to Use This Skill

- Setting up Better Auth with FastAPI/Starlette
- Configuring OAuth providers (GitHub, Google)
- Implementing JWT session handling
- Adding auth plugins (2FA, phone, custom)
- Managing user sessions and cookies
- Implementing password policies
- Setting up security middleware
- Using Better Auth OpenAPI docs

---

## Anti-Patterns to Avoid

**Never:**
- Skip HTTPS in production
- Store secrets in code
- Use weak password policies
- Skip CSRF protection
- Forget to set secure cookie flags
- Skip rate limiting on auth endpoints
- Store secrets in database (except encrypted)
- Skip email verification
- Allow unlimited session duration

**Always:**
- Use strong secret keys (32+ characters)
- Enable HTTPS in production
- Implement rate limiting
- Verify email addresses
- Use secure cookie attributes
- Set appropriate session timeouts
- Implement 2FA for sensitive operations
- Follow OWASP guidelines
- Use environment variables for secrets
- Test auth flows thoroughly

---

## Tools Used

- **Read/Grep:** Examine auth code, find patterns
- **Write/Edit:** Create auth plugins, middleware
- **Bash:** Run servers, install dependencies
- **Context7 MCP:** Better Auth docs

---

## Verification Process

1. **Auth Flow:** Test registration, login, logout
2. **OAuth:** Test with test accounts (GitHub/Google)
3. **Sessions:** Test session creation and expiration
4. **JWT:** Verify token generation and validation
5. **Security:** Run security scans
6. **Rate Limit:** Test rate limiting behavior
