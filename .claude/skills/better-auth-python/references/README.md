# Better Auth Python References

Official documentation and resources for implementing Better Auth patterns in Python web applications.

## Official Resources

### Better Auth Documentation
- **Official Website**: https://better-auth.com
- **GitHub Repository**: https://github.com/better-auth/better-auth
- **Documentation**: https://better-auth.com/docs
- **API Reference**: https://better-auth.com/docs/api

### Python Implementation Guide
While Better Auth is primarily TypeScript/JavaScript, these patterns can be adapted for Python:
- **FastAPI Auth**: https://fastapi.tiangolo.com/tutorial/security/
- **Pyramid Auth**: https://docs.pylonsproject.org/projects/pyramid/en/latest/tutorials/auth.html
- **Django Auth**: https://docs.djangoproject.com/en/stable/topics/auth/

## Core Concepts

### Session Management
- **Session-Based Auth**: Server-side sessions with secure cookies
- **JWT Tokens**: Stateless authentication with JSON Web Tokens
- **OAuth2 Integration**: Social login providers (Google, GitHub, etc.)
- **Multi-Factor Authentication**: 2FA/TOTP support

## Python Authentication Patterns

### FastAPI Security

#### JWT Authentication
```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username
```

#### OAuth2 with FastAPI
```python
from fastapi.security import OAuth2AuthorizationCodeBearer
from authlib.integrations.starlette_client import OAuth

oauth = OAuth()
oauth.register(
    name='google',
    client_id='your-client-id',
    client_secret='your-client-secret',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)
```

### Django Authentication

#### Custom User Model
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField(null=True)
    two_factor_enabled = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
```

#### Authentication Views
```python
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect

def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})
```

### Flask Authentication

#### Flask-Login
```python
from flask import Flask, render_template, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user

app = Flask(__name__)
app.secret_key = 'your-secret-key'
login_manager = LoginManager()
login_manager.init_app(app)

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

@app.route('/login')
def login():
    user = User(1)
    login_user(user)
    return redirect(url_for('protected'))

@app.route('/protected')
@login_required
def protected():
    return 'Logged in!'
```

## Security Best Practices

### Password Hashing
```python
import bcrypt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### Token Management
- Use short-lived access tokens (15-30 minutes)
- Implement refresh tokens for long-term sessions
- Store tokens securely (httpOnly cookies)
- Rotate tokens on sensitive operations

### Session Security
- Use secure, httpOnly cookies
- Implement CSRF protection
- Set appropriate SameSite attributes
- Regenerate session IDs after login

## OAuth2 Providers

### Google OAuth2
- **Console**: https://console.cloud.google.com/
- **Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Scopes**: https://developers.google.com/identity/protocols/oauth2/scopes

### GitHub OAuth2
- **Developer Settings**: https://github.com/settings/developers
- **Documentation**: https://docs.github.com/en/developers/apps/building-oauth-apps

### Other Providers
- **Auth0**: https://auth0.com/docs
- **Firebase Auth**: https://firebase.google.com/docs/auth
- **Okta**: https://developer.okta.com/docs/

## Two-Factor Authentication

### PyOTP for TOTP
```python
import pyotp

def generate_totp_secret():
    return pyotp.random_base32()

def verify_totp(token: str, secret: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(token)

def get_totp_qrcode(secret: str, email: str):
    import qrcode
    from io import BytesIO

    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=email,
        issuer_name="Your App"
    )
    return qrcode.make(totp_uri)
```

## Testing Authentication

### Pytest Fixtures
```python
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def authenticated_client(client):
    # Create test user
    response = client.post("/signup", json={
        "email": "test@example.com",
        "password": "testpass123"
    })
    token = response.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client

def test_protected_route(authenticated_client):
    response = authenticated_client.get("/protected")
    assert response.status_code == 200
```

## Related Libraries

### Core Libraries
- **FastAPI**: https://fastapi.tiangolo.com/
- **Django**: https://www.djangoproject.com/
- **Flask**: https://flask.palletsprojects.com/
- **Pyramid**: https://trypyramid.com/

### Auth Libraries
- **Python-JOSE**: https://python-jose.readthedocs.io/
- **Passlib**: https://passlib.readthedocs.io/
- **PyOTP**: https://pyotp.readthedocs.io/
- **Authlib**: https://docs.authlib.org/

### OAuth Integration
- **Authlib**: https://docs.authlib.org/en/latest/client/oauth2.html
- **Requests-OAuthlib**: https://requests-oauthlib.readthedocs.io/

## Deployment Considerations

### Environment Variables
```bash
# .env
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/db
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=strict
```

### Production Checklist
- [ ] Use strong, random SECRET_KEY
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Use password hashing (bcrypt/argon2)
- [ ] Enable CSRF protection
- [ ] Set up session timeout
- [ ] Implement 2FA for sensitive operations
- [ ] Monitor authentication attempts
- [ ] Regular security audits

## Troubleshooting

### Common Issues

**Issue: CORS errors on OAuth callback**
- Configure CORS middleware properly
- Add callback URL to OAuth provider whitelist

**Issue: JWT validation failing**
- Verify SECRET_KEY matches between services
- Check token expiration time
- Ensure algorithm matches

**Issue: Session not persisting**
- Check cookie settings (secure, httpOnly)
- Verify domain/sameSite attributes
- Check session storage backend

## Community Resources

- **FastAPI Discord**: https://discord.gg/VQj8eP9f
- **Django Forum**: https://forum.djangoproject.com/
- **PyBooklet**: https://pybooklet.herokuapp.com/
- **r/Python**: https://reddit.com/r/Python

## Security Checklist

- [ ] Passwords hashed with bcrypt/argon2
- [ ] HTTPS enforced in production
- [ ] Secure cookie flags enabled
- [ ] CSRF protection implemented
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all fields
- [ ] SQL injection prevention (ORM/parameterized queries)
- [ ] XSS protection (template escaping)
- [ ] Secure session storage
- [ ] Logging of auth events (without sensitive data)
