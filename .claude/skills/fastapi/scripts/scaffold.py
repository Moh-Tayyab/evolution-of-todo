#!/usr/bin/env python3
#!/usr/bin/env python3
"""
scaffold.py

Scaffold script for Claude Code skills automation.

Author: Evolution of Todo Project
Version: 1.0.0
License: MIT
"""

"""
FastAPI Project Scaffolder
===========================

Production-grade tool for generating FastAPI project structures with
best practices, authentication, testing, and Docker configuration.

Features:
- Generate complete FastAPI project structure
- Include authentication (JWT, OAuth2)
- Add database integration (SQLAlchemy, Tortoise ORM)
- Create API router templates
- Generate test suites
- Add Docker configuration
- Include CI/CD templates

Usage:
    python -m fastapi_scaffold --name my-api --dir ./my-api
    python -m fastapi_scaffold --name my-api --with-auth --with-db
    python -m fastapi_scaffold --name my-api --template fullstack

Author: Claude Code Engineering Team
Version: 1.0.0
License: MIT
"""

import os
import sys
import json
import shutil
import argparse
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime


@dataclass
class ProjectConfig:
    """Configuration for FastAPI project generation."""
    name: str
    directory: Path
    description: str = "FastAPI Application"
    version: str = "1.0.0"
    author: str = "Your Name"
    email: str = "your.email@example.com"

    # Feature flags
    with_auth: bool = False
    with_database: bool = False
    with_redis: bool = False
    with_celery: bool = False
    with_websocket: bool = False
    with_docker: bool = True
    with_ci: bool = True

    # Technology choices
    database_type: str = "postgresql"  # postgresql, mysql, sqlite
    orm_type: str = "sqlalchemy"  # sqlalchemy, tortoise, none
    auth_type: str = "jwt"  # jwt, oauth2, none

    # Python version
    python_version: str = "3.11"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'name': self.name,
            'description': self.description,
            'version': self.version,
            'author': self.author,
            'email': self.email,
            'with_auth': self.with_auth,
            'with_database': self.with_database,
            'with_redis': self.with_redis,
            'with_celery': self.with_celery,
            'with_websocket': self.with_websocket,
            'with_docker': self.with_docker,
            'with_ci': self.with_ci,
            'database_type': self.database_type,
            'orm_type': self.orm_type,
            'auth_type': self.auth_type,
            'python_version': self.python_version,
        }


class FastAPIProjectGenerator:
    """
    Generate production-ready FastAPI project structures.

    Creates a complete project with:
    - Proper directory structure
    - Configuration management
    - Logging setup
    - API routing
    - Authentication
    - Database integration
    - Testing setup
    - Docker configuration
    - CI/CD pipelines
    """

    def __init__(self, config: ProjectConfig):
        """Initialize the generator."""
        self.config = config
        self.project_root = config.directory / config.name

    def generate(self) -> None:
        """Generate the complete project structure."""
        print(f"Generating FastAPI project: {self.config.name}")
        print(f"Directory: {self.project_root}")

        # Create project structure
        self._create_directory_structure()

        # Generate configuration files
        self._generate_pyproject_toml()
        self._generate_readme()
        self._generate_gitignore()
        self._generate_env_template()

        # Generate application code
        self._generate_main_app()
        self._generate_config()
        self._generate_logging()

        # Generate API routes
        self._generate_api_routes()

        # Generate models if database enabled
        if self.config.with_database:
            self._generate_database_models()

        # Generate authentication if enabled
        if self.config.with_auth:
            self._generate_auth_module()

        # Generate tests
        self._generate_tests()

        # Generate Docker files
        if self.config.with_docker:
            self._generate_docker_files()

        # Generate CI/CD
        if self.config.with_ci:
            self._generate_ci_cd()

        print(f"\n✅ Project generated successfully!")
        print(f"\nNext steps:")
        print(f"  1. cd {self.project_root}")
        print(f"  2. uv venv")
        print(f"  3. source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate")
        print(f"  4. uv pip install -r requirements.txt")
        print(f"  5. cp .env.example .env")
        print(f"  6. Edit .env with your configuration")
        print(f"  7. uvicorn app.main:app --reload")

    def _create_directory_structure(self) -> None:
        """Create the project directory structure."""
        dirs = [
            self.project_root,
            self.project_root / "app" / "api",
            self.project_root / "app" / "api" / "v1",
            self.project_root / "app" / "core" / "config",
            self.project_root / "app" / "core" / "security",
            self.project_root / "app" / "models",
            self.project_root / "app" / "schemas",
            self.project_root / "app" / "services",
            self.project_root / "app" / "db",
            self.project_root / "tests",
            self.project_root / "tests" / "api",
            self.project_root / "scripts",
            self.project_root / "alembic" / "versions",
            self.project_root / "docs",
        ]

        for dir_path in dirs:
            dir_path.mkdir(parents=True, exist_ok=True)

        # Create __init__.py files
        init_dirs = [
            self.project_root / "app",
            self.project_root / "app" / "api",
            self.project_root / "app" / "api" / "v1",
            self.project_root / "app" / "core",
            self.project_root / "app" / "core" / "config",
            self.project_root / "app" / "core" / "security",
            self.project_root / "app" / "models",
            self.project_root / "app" / "schemas",
            self.project_root / "app" / "services",
            self.project_root / "app" / "db",
            self.project_root / "tests",
            self.project_root / "tests" / "api",
        ]

        for init_dir in init_dirs:
            (init_dir / "__init__.py").touch()

    def _generate_pyproject_toml(self) -> None:
        """Generate pyproject.toml for uv."""
        content = f'''[project]
name = "{self.config.name}"
version = "{self.config.version}"
description = "{self.config.description}"
authors = [
    {{name = "{self.config.author}", email = "{self.config.email}"}},
]
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "pydantic>=2.4.0",
    "pydantic-settings>=2.1.0",
    "python-json-logger>=2.0.7",
    {"    "sqlalchemy>=2.0.23","    "alembic>=1.12.1","    "asyncpg>=0.29.0"," if self.config.with_database else "    # sqlalchemy, alembic, asyncpg"},
    {"    "redis>=5.0.1","    "hiredis>=2.2.3"," if self.config.with_redis else "    # redis, hiredis"},
    {"    "celery>=5.3.4"," if self.config.with_celery else "    # celery"},
    {"    "python-jose[cryptography]>=3.3.0","    "passlib[bcrypt]>=1.7.4"," if self.config.with_auth else "    # python-jose, passlib"},
    {"    "python-multipart>=0.0.6"," if self.config.with_auth else "    # python-multipart"},
]
requires-python = ">={self.config.python_version}"
readme = "README.md"
license = {{text = "MIT"}}

[project.optional-dependencies]
dev = [
    "pytest>=7.4.3",
    "pytest-asyncio>=0.21.1",
    "pytest-cov>=4.1.0",
    "httpx>=0.25.2",
    "ruff>=0.1.8",
    "mypy>=1.7.1",
    "black>=23.12.0",
    "pre-commit>=3.6.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
target-version = "py{self.config.python_version.replace('.', '')}"
line-length = 120
select = ["E", "F", "I", "N", "W", "B"]
ignore = ["E501"]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]

[tool.mypy]
python_version = "{self.config.python_version}"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]

[tool.coverage.run]
source = ["app"]
omit = [
    "*/tests/*",
    "*/migrations/*",
]

[tool.black]
line-length = 120
target-version = ["py{self.config.python_version.replace('.', '')}"]
'''

        (self.project_root / "pyproject.toml").write_text(content)

    def _generate_readme(self) -> None:
        """Generate README.md."""
        content = f'''# {self.config.name}

{self.config.description}

## Features

- ✅ FastAPI with async/await
- ✅ Pydantic v2 for validation
- ✅ Structured logging
- ✅ Error handling middleware
- ✅ API versioning
{"- ✅ JWT authentication" if self.config.with_auth else ""}
{"- ✅ Database integration (SQLAlchemy)" if self.config.with_database else ""}
{"- ✅ Redis caching" if self.config.with_redis else ""}
{"- ✅ Celery task queue" if self.config.with_celery else ""}
{"- ✅ WebSocket support" if self.config.with_websocket else ""}
- ✅ Docker support
- ✅ CI/CD pipeline
- ✅ Comprehensive tests

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── v1/          # API v1 routes
│   ├── core/
│   │   ├── config/      # Configuration
│   │   └── security/    # Security utilities
│   ├── models/          # Database models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   ├── db/              # Database utilities
│   └── main.py          # Application entry
├── tests/               # Test suite
├── scripts/             # Utility scripts
├── docs/                # Documentation
├── alembic/             # Database migrations
└── pyproject.toml       # Project dependencies
```

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd {self.config.name}

# Create virtual environment
uv venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate

# Install dependencies
uv pip install -e ".[dev]"

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# nano .env
```

### Running the Application

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/api/test_users.py
```

### Docker

```bash
# Build image
docker build -t {self.config.name} .

# Run container
docker run -p 8000:8000 --env-file .env {self.config.name}

# With docker-compose
docker-compose up
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Configuration

See `.env.example` for all available configuration options.

## Development

### Code Quality

```bash
# Format code
ruff check . --fix
black .

# Type checking
mypy app

# Run pre-commit hooks
pre-commit run --all-files
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## License

MIT License - see LICENSE file for details.
'''

        (self.project_root / "README.md").write_text(content)

    def _generate_gitignore(self) -> None:
        """Generate .gitignore."""
        content = '''# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# PyInstaller
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/

# Translations
*.mo
*.pot

# Django stuff:
*.log
local_settings.py
db.sqlite3

# Flask stuff:
instance/
.webassets-cache

# Scrapy stuff:
.scrapy

# Sphinx documentation
docs/_build/

# PyBuilder
target/

# Jupyter Notebook
.ipynb_checkpoints

# pyenv
.python-version

# celery beat schedule file
celerybeat-schedule

# SageMath parsed files
*.sage.py

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Spyder project settings
.spyderproject
.spyproject

# Rope project settings
.ropeproject

# mkdocs documentation
/site

# mypy
.mypy_cache/
.dmypy.json
dmypy.json

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Project specific
*.db
*.sqlite
logs/
media/
static/files/
'''

        (self.project_root / ".gitignore").write_text(content)

    def _generate_env_template(self) -> None:
        """Generate .env.example."""
        content = f'''# Application
APP_NAME={self.config.name}
APP_VERSION={self.config.version}
DEBUG=true
SECRET_KEY=change-this-in-production-use-openssl-rand-hex-32

# Server
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Database
{"DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname" if self.config.with_database else "# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname"}
{"DATABASE_ECHO=false" if self.config.with_database else "# DATABASE_ECHO=false"}

# Redis
{"REDIS_URL=redis://localhost:6379/0" if self.config.with_redis else "# REDIS_URL=redis://localhost:6379/0"}

# Celery
{"CELERY_BROKER_URL=redis://localhost:6379/1" if self.config.with_celery else "# CELERY_BROKER_URL=redis://localhost:6379/1"}
{"CELERY_RESULT_BACKEND=redis://localhost:6379/2" if self.config.with_celery else "# CELERY_RESULT_BACKEND=redis://localhost:6379/2"}

# Authentication
{"ACCESS_TOKEN_EXPIRE_MINUTES=30" if self.config.with_auth else "# ACCESS_TOKEN_EXPIRE_MINUTES=30"}
{"REFRESH_TOKEN_EXPIRE_DAYS=7" if self.config.with_auth else "# REFRESH_TOKEN_EXPIRE_DAYS=7"}

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# External Services
# Add your external service URLs here
'''

        (self.project_root / ".env.example").write_text(content)

    def _generate_main_app(self) -> None:
        """Generate main application entry point."""
        content = '''"""
FastAPI Application Factory
=========================

Creates and configures the FastAPI application with all middleware,
routes, and startup/shutdown events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config.settings import settings
from app.core.config.logging import setup_logging
from app.api.v1 import api_router


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns:
        Configured FastAPI application instance
    """
    # Setup logging
    setup_logging()
    logger = logging.getLogger(__name__)

    # Create FastAPI app
    app = FastAPI(
        title=settings.APP_NAME,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"/api/v1/openapi.json",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # GZip middleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Include API router
    app.include_router(api_router, prefix="/api/v1")

    # Exception handlers
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    # Startup event
    @app.on_event("startup")
    async def startup_event():
        logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
        # Add database connection setup here
        # Add Redis connection setup here
        # Add Celery setup here

    # Shutdown event
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info(f"Shutting down {settings.APP_NAME}")
        # Add database connection cleanup here
        # Add Redis connection cleanup here

    # Health check
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "version": settings.APP_VERSION}

    return app


# Create app instance
app = create_application()
'''

        (self.project_root / "app" / "main.py").write_text(content)

    def _generate_config(self) -> None:
        """Generate configuration modules."""
        # settings.py
        settings_content = '''"""Application settings configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str
    APP_VERSION: str
    APP_DESCRIPTION: str = "FastAPI Application"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 4

    # Security
    SECRET_KEY: str

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json or text


settings = Settings()
'''

        settings_path = self.project_root / "app" / "core" / "config" / "settings.py"
        settings_path.parent.mkdir(parents=True, exist_ok=True)
        settings_path.write_text(settings_content)

        # logging.py
        logging_content = '''"""Logging configuration."""

import logging
import sys
from typing import Any

from loguru import logger as loguru_logger

from app.core.config.settings import settings


class InterceptHandler(logging.Handler):
    """Intercept standard logging messages and redirect to Loguru."""

    def emit(self, record: logging.LogRecord) -> None:
        """Emit a log record to Loguru."""
        # Get corresponding Loguru level if it exists
        try:
            level = loguru_logger.level(record.levelno).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        loguru_logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging() -> None:
    """Configure application logging."""
    # Remove default handler
    loguru_logger.remove()

    # Add console handler
    if settings.LOG_FORMAT == "json":
        loguru_logger.add(
            sys.stderr,
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            level=settings.LOG_LEVEL,
            serialize=True,
        )
    else:
        loguru_logger.add(
            sys.stderr,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
            level=settings.LOG_LEVEL,
        )

    # Intercept standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
'''

        logging_path = self.project_root / "app" / "core" / "config" / "logging.py"
        logging_path.write_text(logging_content)

    def _generate_api_routes(self) -> None:
        """Generate API route modules."""
        # api_router.py
        api_router_content = '''"""API v1 Router"""

from fastapi import APIRouter

from app.api.v1.endpoints import health, items

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, tags=["health"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
'''

        api_router_path = self.project_root / "app" / "api" / "v1" / "__init__.py"
        (self.project_root / "app" / "api" / "v1" / "endpoints").mkdir(exist_ok=True)
        (self.project_root / "app" / "api" / "v1" / "endpoints" / "__init__.py").touch()

        (self.project_root / "app" / "api" / "v1" / "__init__.py").write_text(api_router_content)

        # endpoints/health.py
        health_content = '''"""Health check endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
'''

        health_path = self.project_root / "app" / "api" / "v1" / "endpoints" / "health.py"
        health_path.write_text(health_content)

        # endpoints/items.py
        items_content = '''"""Items CRUD endpoints."""

from typing import List
from fastapi import APIRouter, HTTPException, status

from app.schemas.item import Item, ItemCreate, ItemUpdate

router = APIRouter()

# In-memory storage (replace with database)
_items_db: List[dict] = []


@router.get("/", response_model=List[Item])
async def list_items(skip: int = 0, limit: int = 100):
    """List all items with pagination."""
    return _items_db[skip : skip + limit]


@router.get("/{item_id}", response_model=Item)
async def get_item(item_id: int):
    """Get a specific item by ID."""
    for item in _items_db:
        if item["id"] == item_id:
            return item
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found"
    )


@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate):
    """Create a new item."""
    item_id = len(_items_db) + 1
    new_item = Item(id=item_id, **item.model_dump())
    _items_db.append(new_item.model_dump())
    return new_item


@router.put("/{item_id}", response_model=Item)
async def update_item(item_id: int, item: ItemUpdate):
    """Update an existing item."""
    for i, existing_item in enumerate(_items_db):
        if existing_item["id"] == item_id:
            updated_item = existing_item.copy()
            updated_item.update(item.model_dump(exclude_unset=True))
            _items_db[i] = updated_item
            return updated_item
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found"
    )


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int):
    """Delete an item."""
    for i, item in enumerate(_items_db):
        if item["id"] == item_id:
            _items_db.pop(i)
            return
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found"
    )
'''

        items_path = self.project_root / "app" / "api" / "v1" / "endpoints" / "items.py"
        items_path.write_text(items_content)

        # schemas/item.py
        schemas_dir = self.project_root / "app" / "schemas"
        schemas_dir.mkdir(exist_ok=True)

        item_schema_content = '''"""Item schemas."""

from pydantic import BaseModel, Field


class ItemBase(BaseModel):
    """Base item schema."""
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    price: float = Field(..., gt=0)
    tax: float | None = Field(None, ge=0)


class ItemCreate(ItemBase):
    """Schema for creating an item."""
    pass


class ItemUpdate(ItemBase):
    """Schema for updating an item."""
    name: str | None = Field(None, min_length=1, max_length=100)
    price: float | None = Field(None, gt=0)


class Item(ItemBase):
    """Complete item schema."""
    id: int

    model_config = {"from_attributes": True}
'''

        (schemas_dir / "item.py").write_text(item_schema_content)

    def _generate_database_models(self) -> None:
        """Generate database models if database is enabled."""
        if not self.config.with_database:
            return

        # Base model
        base_model_content = '''"""Database base model."""

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class TimestampMixin:
    """Add timestamp fields to models."""

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class BaseModel(Base):
    """Base model with common fields."""

    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True)
'''

        base_model_path = self.project_root / "app" / "models" / "base.py"
        base_model_path.write_text(base_model_content)

        # Example model
        user_model_content = '''"""User model."""

from sqlalchemy import Boolean, Column, String, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel, TimestampMixin


class User(BaseModel, TimestampMixin):
    """User model."""

    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    bio = Column(Text)
'''

        (self.project_root / "app" / "models" / "user.py").write_text(user_model_content)

        # Database session
        db_content = '''"""Database session management."""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config.settings import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DATABASE_ECHO)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncSession:
    """Get database session."""
    async with AsyncSessionLocal() as session:
        yield session
'''

        (self.project_root / "app" / "db" / "session.py").write_text(db_content)

    def _generate_auth_module(self) -> None:
        """Generate authentication module if enabled."""
        if not self.config.with_auth:
            return

        security_dir = self.project_root / "app" / "core" / "security"
        security_dir.mkdir(exist_ok=True)

        # auth.py
        auth_content = '''"""Authentication utilities."""

from datetime import datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config.settings import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict[str, Any] | None:
    """Verify JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)
'''

        (security_dir / "auth.py").write_text(auth_content)

        # dependencies.py
        dependencies_content = '''"""FastAPI dependencies."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.auth import verify_token
from app.db.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    # Load user from database
    # user = await get_user_by_id(payload.get("sub"), db)
    # if user is None:
    #     raise credentials_exception

    # return user
    return {"user_id": payload.get("sub")}  # Placeholder
'''

        (security_dir / "dependencies.py").write_text(dependencies_content)

    def _generate_tests(self) -> None:
        """Generate test files."""
        # conftest.py
        conftest_content = '''"""Pytest configuration and fixtures."""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    # Use in-memory SQLite for testing
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
    )

    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with engine.begin() as conn:
        # Create tables
        # async with AsyncSession(engine) as session:
        #     await Base.metadata.create_all(session)

    async with async_session() as session:
        yield session

    await engine.dispose()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
'''

        (self.project_root / "tests" / "conftest.py").write_text(conftest_content)

        # test_items.py
        test_items_content = '''"""Test items endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_items(client: AsyncClient):
    """Test listing items."""
    response = await client.get("/api/v1/items/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_create_item(client: AsyncClient):
    """Test creating an item."""
    item_data = {
        "name": "Test Item",
        "description": "A test item",
        "price": 9.99,
    }
    response = await client.post("/api/v1/items/", json=item_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Item"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_item(client: AsyncClient, db_session):
    """Test getting a specific item."""
    # Create an item first
    item_data = {
        "name": "Test Item",
        "price": 9.99,
    }
    create_response = await client.post("/api/v1/items/", json=item_data)
    item_id = create_response.json()["id"]

    # Get the item
    response = await client.get(f"/api/v1/items/{item_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == item_id


@pytest.mark.asyncio
async def test_update_item(client: AsyncClient):
    """Test updating an item."""
    # Create an item first
    item_data = {
        "name": "Test Item",
        "price": 9.99,
    }
    create_response = await client.post("/api/v1/items/", json=item_data)
    item_id = create_response.json()["id"]

    # Update the item
    update_data = {"price": 19.99}
    response = await client.put(f"/api/v1/items/{item_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 19.99


@pytest.mark.asyncio
async def test_delete_item(client: AsyncClient):
    """Test deleting an item."""
    # Create an item first
    item_data = {
        "name": "Test Item",
        "price": 9.99,
    }
    create_response = await client.post("/api/v1/items/", json=item_data)
    item_id = create_response.json()["id"]

    # Delete the item
    response = await client.delete(f"/api/v1/items/{item_id}")
    assert response.status_code == 204

    # Verify it's deleted
    get_response = await client.get(f"/api/v1/items/{item_id}")
    assert get_response.status_code == 404
'''

        (self.project_root / "tests" / "api" / "test_items.py").write_text(test_items_content)

    def _generate_docker_files(self) -> None:
        """Generate Docker configuration files."""
        # Dockerfile
        dockerfile_content = f'''# Multi-stage build for FastAPI application
FROM python:{self.config.python_version}-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PIP_NO_CACHE_DIR=1 \\
    POETRY_VERSION=1.7.1

# Install build dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy project files
WORKDIR /build
COPY pyproject.toml README.md ./

# Install dependencies
RUN uv pip install --system -e .

# Final stage
FROM python:{self.config.python_version}-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PATH="/root/.local/bin:$PATH"

# Create non-root user
RUN useradd -m -u 1000 appuser

# Copy dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy application
WORKDIR /app
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
'''

        (self.project_root / "Dockerfile").write_text(dockerfile_content)

        # docker-compose.yml
        docker_compose_content = f'''version: "3.8"

services:
  api:
    build: .
    container_name: {self.config.name}
    ports:
      - "8000:8000"
    environment:
      - DEBUG=false
    env_file:
      - .env
    depends_on:
      {"      - db" if self.config.with_database else ""}
      {"      - redis" if self.config.with_redis else ""}
    restart: unless-stopped

  {"db:" if self.config.with_database else ""}
  {"  image: postgres:15-alpine" if self.config.database_type == "postgresql" else ""}
  {"  container_name: {self.config.name}-db" if self.config.with_database else ""}
  {"  environment:" if self.config.with_database else ""}
  {"    POSTGRES_DB: {self.config.name}" if self.config.with_database else ""}
  {"    POSTGRES_USER: {self.config.name}" if self.config.with_database else ""}
  {"    POSTGRES_PASSWORD: changeme" if self.config.with_database else ""}
  {"  volumes:" if self.config.with_database else ""}
  {"    - postgres_data:/var/lib/postgresql/data" if self.config.with_database else ""}
  {"  ports:" if self.config.with_database else ""}
  {"    - \"5432:5432\"" if self.config.with_database else ""}
  {"  restart: unless-stopped" if self.config.with_database else ""}

  {"redis:" if self.config.with_redis else ""}
  {"  image: redis:7-alpine" if self.config.with_redis else ""}
  {"  container_name: {self.config.name}-redis" if self.config.with_redis else ""}
  {"  ports:" if self.config.with_redis else ""}
  {"    - \"6379:6379\"" if self.config.with_redis else ""}
  {"  volumes:" if self.config.with_redis else ""}
  {"    - redis_data:/data" if self.config.with_redis else ""}
  {"  restart: unless-stopped" if self.config.with_redis else ""}

  {"celery_worker:" if self.config.with_celery else ""}
  {"  build: ." if self.config.with_celery else ""}
  {"  container_name: {self.config.name}-worker" if self.config.with_celery else ""}
  {"  command: celery -A app.tasks.worker worker --loglevel=info" if self.config.with_celery else ""}
  {"  env_file:" if self.config.with_celery else ""}
  {"    - .env" if self.config.with_celery else ""}
  {"  depends_on:" if self.config.with_celery else ""}
  {"    - redis" if self.config.with_celery else ""}
  {"  restart: unless-stopped" if self.config.with_celery else ""}

{"volumes:" if self.config.with_database or self.config.with_redis else ""}
{"  postgres_data:" if self.config.with_database else ""}
{"  redis_data:" if self.config.with_redis else ""}
'''

        (self.project_root / "docker-compose.yml").write_text(docker_compose_content)

    def _generate_ci_cd(self) -> None:
        """Generate CI/CD configuration."""
        # GitHub Actions
        github_actions_dir = self.project_root / ".github" / "workflows"
        github_actions_dir.mkdir(parents=True, exist_ok=True)

        github_actions_content = f'''name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '{self.config.python_version}'

    - name: Install uv
      run: |
        curl -LsSf https://astral.sh/uv/install.sh | sh
        echo "$HOME/.local/bin" >> $GITHUB_PATH

    - name: Install dependencies
      run: |
        uv venv
        source .venv/bin/activate
        uv pip install -e ".[dev]"

    - name: Run linter
      run: |
        source .venv/bin/activate
        ruff check .

    - name: Run type checker
      run: |
        source .venv/bin/activate
        mypy app

    - name: Run tests
      run: |
        source .venv/bin/activate
        pytest --cov=app --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{{{ secrets.DOCKER_USERNAME }}}}
        password: ${{{{ secrets.DOCKER_PASSWORD }}}}

    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ${{{{ secrets.DOCKER_USERNAME }}}/{self.config.name}:latest
          ${{{{ secrets.DOCKER_USERNAME }}}/{self.config.name}:${{{{ github.sha }}}}
'''

        (github_actions_dir / "ci.yml").write_text(github_actions_content)

    def _generate_logging(self) -> None:
        """Generate logging configuration."""
        # This was already done in _generate_config()

        pass


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="FastAPI Project Scaffolder - Generate production-ready FastAPI projects",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --name my-api --dir ./my-api
  %(prog)s --name my-api --with-auth --with-db --with-redis
  %(prog)s --name my-api --template fullstack
        """
    )

    parser.add_argument(
        "--name", "-n",
        type=str,
        required=True,
        help="Project/application name"
    )

    parser.add_argument(
        "--dir", "-d",
        type=Path,
        default=Path.cwd(),
        help="Output directory (default: current directory)"
    )

    parser.add_argument(
        "--description",
        type=str,
        default="FastAPI Application",
        help="Project description"
    )

    parser.add_argument(
        "--author",
        type=str,
        default="Your Name",
        help="Author name"
    )

    parser.add_argument(
        "--email",
        type=str,
        default="your.email@example.com",
        help="Author email"
    )

    # Feature flags
    parser.add_argument(
        "--with-auth",
        action="store_true",
        help="Include authentication (JWT)"
    )

    parser.add_argument(
        "--with-db",
        action="store_true",
        help="Include database integration"
    )

    parser.add_argument(
        "--with-redis",
        action="store_true",
        help="Include Redis caching"
    )

    parser.add_argument(
        "--with-celery",
        action="store_true",
        help="Include Celery task queue"
    )

    parser.add_argument(
        "--with-websocket",
        action="store_true",
        help="Include WebSocket support"
    )

    parser.add_argument(
        "--without-docker",
        action="store_true",
        help="Skip Docker files"
    )

    parser.add_argument(
        "--without-ci",
        action="store_true",
        help="Skip CI/CD files"
    )

    # Technology choices
    parser.add_argument(
        "--database-type",
        choices=["postgresql", "mysql", "sqlite"],
        default="postgresql",
        help="Database type (default: postgresql)"
    )

    parser.add_argument(
        "--orm-type",
        choices=["sqlalchemy", "tortoise"],
        default="sqlalchemy",
        help="ORM type (default: sqlalchemy)"
    )

    parser.add_argument(
        "--auth-type",
        choices=["jwt", "oauth2"],
        default="jwt",
        help="Authentication type (default: jwt)"
    )

    parser.add_argument(
        "--python-version",
        type=str,
        default="3.11",
        help="Python version (default: 3.11)"
    )

    args = parser.parse_args()

    # Create config
    config = ProjectConfig(
        name=args.name,
        directory=args.dir,
        description=args.description,
        author=args.author,
        email=args.email,
        with_auth=args.with_auth,
        with_database=args.with_db,
        with_redis=args.with_redis,
        with_celery=args.with_celery,
        with_websocket=args.with_websocket,
        with_docker=not args.without_docker,
        with_ci=not args.without_ci,
        database_type=args.database_type,
        orm_type=args.orm_type,
        auth_type=args.auth_type,
        python_version=args.python_version,
    )

    # Generate project
    try:
        generator = FastAPIProjectGenerator(config)
        generator.generate()
        sys.exit(0)
    except Exception as e:
        print(f"Error generating project: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
