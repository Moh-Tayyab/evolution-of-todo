# Hugging Face Spaces Deployment Agent

## Overview

Expert agent for deploying applications to Hugging Face Spaces - a platform for hosting ML demos, FastAPI backends, and interactive web applications.

## Capabilities

- **Space Management**: Create, configure, and delete Spaces
- **Git-based Deployment**: CI/CD via Hugging Face Git integration
- **Multi-SKDK Support**: Docker, Gradio, Streamlit, Static
- **Environment Management**: Secrets and variables configuration
- **Health Monitoring**: Logs, runtime status, and health checks
- **Hardware Scaling**: CPU to GPU tier upgrades

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Development Machine                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Source     │  │  Dockerfile  │  │  requirements │          │
│  │    Code      │  │              │  │     .txt      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                    │
│         └─────────────────┴─────────────────┘                    │
│                           │                                       │
│                           ▼                                       │
│                  ┌─────────────────┐                              │
│                  │   HF Git Push   │                              │
│                  │   (git push)    │                              │
│                  └────────┬────────┘                              │
└──────────────────────────────────┼────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Hugging Face Spaces                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Space Repository                       │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │    │
│  │  │   src/  │  │ Docker  │  │ require │  │ README  │    │    │
│  │  │         │  │  file   │  │  ments  │  │         │    │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                       │
│                           ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Space Builder                           │    │
│  │  - Pull latest code                                     │    │
│  │  - Build Docker image                                   │    │
│  │  - Run health checks                                    │    │
│  │  - Deploy container                                     │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                       │
│                           ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                Running Container                         │    │
│  │  - Port 7860 exposed                                    │    │
│  │  - Health check at /health                              │    │
│  │  - Logs streamed to HF                                  │    │
│  │  - Auto-restart on failure                              │    │
│  └────────────────────────┬────────────────────────────────┘    │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Public URL                                  │
│            https://huggingface.co/spaces/user/space              │
│                                                                   │
│  - HTTPS proxy on port 443                                       │
│  - Auto SSL certificate                                         │
│  - Custom domain support                                        │
│  - Public access (or private via token)                          │
└───────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Authentication

Get your Hugging Face token:
1. Visit https://huggingface.co/settings/tokens
2. Create a token with **write** permissions
3. Set environment variable:

```bash
export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Or add to `.env`:
```
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Create Space

```bash
# Using CLI
huggingface-cli login
huggingface-cli repo create my-space --type space --sdk docker

# Or via MCP
await mcp.create_space(
    space_id="username/my-space",
    sdk="docker",
    hardware="cpu-basic"
)
```

### 3. Deploy

```bash
# Clone the space repository
git clone https://huggingface.co/spaces/username/my-space
cd my-space

# Copy your files
cp -r /path/to/project/* .

# Push to Hugging Face
git add .
git commit -m "Initial deployment"
git push
```

## FastAPI Deployment Guide

### Standard Dockerfile

```dockerfile
# Base image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose Hugging Face port
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", --port", "7860"]
```

### Minimal requirements.txt

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlmodel==0.0.22
pg8000==1.31.2
python-jose[cryptography]==3.3.0
openai>=1.0.0
mcp>=0.9.0
python-dotenv==1.0.1
```

### README.md with Metadata

```markdown
---
title: FastAPI Backend
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
---

# FastAPI Backend on Hugging Face Spaces

FastAPI application deployed via Docker.

## Features

- RESTful API
- PostgreSQL database integration
- JWT authentication
- AI chatbot capabilities

## API Endpoints

- `GET /health` - Health check
- `GET /api/{user_id}/tasks` - List tasks
- `POST /api/{user_id}/tasks` - Create task
```

### Health Check Endpoint

```python
from fastapi import FastAPI
from datetime import datetime
from src.database import engine

app = FastAPI(title="FastAPI Backend")

@app.get("/health")
async def health_check():
    """Health check for Hugging Face Spaces monitoring."""
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")

        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Unhealthy: {str(e)}")
```

## Environment Configuration

### Secrets Management

Set secrets in Space settings at:
```
https://huggingface.co/spaces/USERNAME/SPACE-NAME/settings
```

**Required Secrets for Production:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key (for AI features)
- `HF_TOKEN` - Hugging Face authentication token

### Environment Variables in Code

```python
from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    JWT_SECRET: str = os.getenv("JWT_SECRET")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")

settings = Settings()
```

### Neon PostgreSQL Connection

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

The `?sslmode=require` parameter is critical for Neon.

## Deployment Workflow

### 1. Preparation

```bash
# Navigate to project
cd /path/to/project

# Create deployment folder
mkdir -p huggingface
cd huggingface

# Copy necessary files
cp -r ../src .
cp ../requirements.txt .
cp ../Dockerfile .
```

### 2. Space Creation

```bash
# Create via Hugging Face CLI
huggingface-cli repo create backend-api \
    --type space \
    --sdk docker \
    --hardware cpu-basic
```

### 3. Git Push Deployment

```bash
# Initialize if needed
git init

# Add Hugging Face remote
git remote add huggingface \
    https://huggingface.co/spaces/username/backend-api

# Commit and push
git add .
git commit -m "Deploy FastAPI backend"
git push huggingface main
```

### 4. Monitor Deployment

```python
# Wait for space to be ready
await mcp.wait_for_space_ready(
    space_id="username/backend-api",
    timeout=600,
    poll_interval=10
)

# Check runtime status
runtime = await mcp.get_space_runtime("username/backend-api")

# Verify health
health = await mcp.check_space_health(
    "https://huggingface.co/spaces/username/backend-api"
)
```

## Troubleshooting Guide

### Space Not Building

**Symptoms**: Build fails, status shows "BUILD_ERROR"

**Diagnosis**:
```python
logs = await mcp.get_space_logs("username/space-name", lines=500)
```

**Common Fixes**:

1. **Invalid Dockerfile syntax**:
```dockerfile
# WRONG
FROM python:3.13

# RIGHT
FROM python:3.13-slim
```

2. **Missing or invalid requirements.txt**:
```
# Check format
fastapi==0.115.0
uvicorn[standard]==0.32.0
```

3. **Port not exposed**:
```dockerfile
# MUST expose port 7860
EXPOSE 7860
```

### Space Not Responding

**Symptoms**: HTTP 502, 503, or timeout

**Diagnosis**:
```python
runtime = await mcp.get_space_runtime("username/space-name")
print(runtime["state"])  # Should be "RUNNING"
```

**Common Fixes**:

1. **App not binding to correct host/port**:
```bash
# WRONG - binds to localhost only
uvicorn src.main:app --host localhost --port 7860

# RIGHT - binds to all interfaces
uvicorn src.main:app --host 0.0.0.0 --port 7860
```

2. **Health check failing**:
```dockerfile
# Add proper health check
HEALTHCHECK --interval=30s --timeout=10s \
    CMD curl -f http://localhost:7860/health || exit 1
```

3. **Restart the space**:
```python
await mcp.restart_space("username/space-name")
```

### Database Connection Issues

**Symptoms**: Logs show "connection refused" or SSL errors

**Diagnosis**: Check `DATABASE_URL` in Space secrets

**Fixes**:

1. **Add SSL mode**:
```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

2. **Verify Neon database is active**:
```bash
# Check Neon console
# Ensure database is not suspended
```

3. **Test connection in health check**:
```python
@app.get("/health")
async def health():
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

### Out of Memory

**Symptoms**: Logs show "out of memory" or container restarts

**Fixes**:

1. **Upgrade hardware tier**:
```python
await mcp.create_space(
    space_id="username/space-name",
    hardware="cpu-upgrade"  # 8x vCPU, 30GB RAM
)
```

2. **Optimize dependencies**:
```
# Remove unused packages
# Use specific versions
```

3. **Reduce worker count**:
```bash
# Instead of:
uvicorn src.main:app --workers 4

# Use:
uvicorn src.main:app --workers 1
```

### Slow Startup

**Symptoms**: Space takes >5 minutes to start

**Fixes**:

1. **Use slim base image**:
```dockerfile
FROM python:3.13-slim  # Not FROM python:3.13
```

2. **Cache dependencies**:
```dockerfile
# Copy requirements first
COPY requirements.txt .
RUN pip install -r requirements.txt

# Then copy code
COPY . .
```

3. **Lazy imports**:
```python
# Don't import heavy modules at top level
# Import inside functions instead
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy to Hugging Face

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to HF Spaces
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: |
          git config --global user.email "ci@github.com"
          git config --global user.name "GitHub Actions"

          git clone https://$HF_TOKEN@huggingface.co/spaces/USERNAME/SPACE-NAME deploy
          rsync -av --delete ./ deploy/
          cd deploy

          git add .
          git commit -m "Deploy from GitHub: ${{ github.sha }}"
          git push
```

### GitLab CI

```yaml
deploy:
  stage: deploy
  only:
    - main
  script:
    - apt-get update && apt-get install -y git rsync
    - git config --global user.email "ci@gitlab.com"
    - git config --global user.name "GitLab CI"
    - git clone https://$HF_TOKEN@huggingface.co/spaces/USERNAME/SPACE-NAME deploy
    - rsync -av --delete ./ deploy/
    - cd deploy && git push
```

## Advanced Configurations

### Custom Domain

1. In Space settings, add custom domain
2. Configure DNS CNAME record:
```
api.example.com CNAME huggingface.co
```

### GPU Support

```python
# Create space with GPU
await mcp.create_space(
    space_id="username/gpu-space",
    sdk="docker",
    hardware="t4-small"  # NVIDIA T4 GPU
)
```

### Private Space

```python
# Create private space
await mcp.create_space(
    space_id="username/private-api",
    sdk="docker",
    private=True
)
```

## Best Practices

### 1. Image Optimization

```dockerfile
# Multi-stage build
FROM python:3.13-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.13-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

### 2. Dependency Pinning

```
# Use exact versions
fastapi==0.115.0
uvicorn[standard]==0.32.0
```

### 3. Security

- Never commit secrets to Git
- Use Hugging Face Secrets for sensitive data
- Keep dependencies updated
- Scan images for vulnerabilities

### 4. Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

logger.info("Application started")
```

### 5. Error Handling

```python
from fastapi import HTTPException, status

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

## Hardware Tier Comparison

| Tier | vCPU | RAM | GPU | Monthly (approx) |
|------|------|-----|-----|------------------|
| cpu-basic | 2 | 16GB | - | Free |
| cpu-upgrade | 8 | 30GB | - | ~$75 |
| t4-small | 4 | 16GB | 1x T4 | ~$330 |
| a10g-small | 12 | 48GB | 1x A10G | ~$1100 |
| a10g-large | 48 | 192GB | 4x A10G | ~$4400 |

Choose the appropriate tier based on:
- Expected traffic
- ML model requirements
- Budget constraints

## Monitoring and Observability

### Logs

```python
# Get recent logs
logs = await mcp.get_space_logs("username/space-name", lines=500)
```

### Runtime Metrics

```python
# Get runtime status
runtime = await mcp.get_space_runtime("username/space-name")
# Returns: state, hardware, stage, replicas, etc.
```

### Health Monitoring

```python
# Check HTTP endpoint
health = await mcp.check_space_health(
    "https://huggingface.co/spaces/username/space-name"
)
# Returns: status, status_code, response_time
```

## Migration Guide

### From Local to Hugging Face

1. **Prepare Dockerfile**
2. **Update port to 7860**
3. **Set DATABASE_URL with SSL**
4. **Add secrets to Space settings**
5. **Push to Hugging Face Git**

### From Vercel to Hugging Face

1. **Vercel is for frontend, HF for backend**
2. **Keep frontend on Vercel**
3. **Deploy backend to Hugging Face**
4. **Update frontend API URL**

## Common Pitfalls

1. **Forgetting SSL mode in DATABASE_URL**
2. **Binding to localhost instead of 0.0.0.0**
3. **Wrong port (must be 7860)**
4. **Missing health check endpoint**
5. **Committing secrets to repository**
6. **Not caching dependencies in Dockerfile**
7. **Using heavy base images**

## Resources

- Hugging Face Spaces: https://huggingface.co/spaces
- Documentation: https://huggingface.co/docs/hub/spaces
- API Reference: https://huggingface.co/docs/huggingface_hub
- Community Forum: https://discuss.huggingface.co/

## Support

For issues:
1. Check Space logs
2. Review Dockerfile and requirements.txt
3. Verify environment variables
4. Check Hugging Face status page
5. Ask in Hugging Face forums
