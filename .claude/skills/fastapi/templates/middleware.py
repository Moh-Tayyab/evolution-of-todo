# FastAPI Middleware and Dependencies

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Verify JWT token and get current user"""

    token = credentials.credentials

    # Verify token (implement your JWT verification)
    try:
        # user = decode_jwt_token(token)
        # if not user:
        #     raise HTTPException(status_code=401, detail="Invalid token")
        # return user

        # Mock for demo
        return {"id": 1, "email": "user@example.com"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


# Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing"""

    import time
    start_time = time.time()

    response = await call_next(request)

    process_time = (time.time() - start_time) * 1000

    print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms")

    response.headers["X-Process-Time"] = f"{process_time:.2f}"
    return response


# Error Handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom error handler"""

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )
