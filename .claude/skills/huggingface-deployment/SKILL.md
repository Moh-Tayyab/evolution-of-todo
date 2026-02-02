# Hugging Face Spaces Deployment

## Overview

This skill provides comprehensive tools and workflows for deploying applications to Hugging Face Spaces - a platform for hosting machine learning demos, web applications, and APIs.

## Quick Reference

| Tool | Purpose |
|------|---------|
| `list_spaces` | List all Spaces with filtering |
| `create_space` | Create a new Space |
| `get_space_info` | Get detailed Space information |
| `update_file` | Update files via Git API |
| `restart_space` | Restart a Space |
| `wait_for_space_ready` | Wait for Space to be running |
| `check_space_health` | Health check via HTTP |
| `get_space_logs` | View Space logs |
| `get_space_runtime` | Get runtime status |

## What is Hugging Face Spaces?

**Hugging Face Spaces** is a platform for:
- Hosting ML demos and web applications
- Deploying FastAPI, Gradio, Streamlit apps
- Sharing interactive AI/ML applications
- Free hosting with upgrade options

**Key Features:**
- Docker-based deployment
- Git integration for CI/CD
- Built-in monitoring and logs
- Secret management
- Public/private spaces
- Hardware options (CPU, GPU)

## Space SDK Types

| SDK | Description | Use Case |
|-----|-------------|----------|
| **docker** | Full Docker container | FastAPI, custom servers |
| **gradio** | Gradio interface | ML model demos |
| **streamlit** | Streamlit apps | Data apps |
| **static** | Static HTML/CSS/JS | Frontend-only |

## Hardware Tiers

| Tier | Description | Cost |
|------|-------------|------|
| **cpu-basic** | Free CPU | Free |
| **cpu-upgrade** | 8x vCPU, 30GB RAM | ~$0.10/hour |
| **t4-small** | NVIDIA T4 GPU | ~$0.45/hour |
| **a10g-small** | NVIDIA A10G GPU | ~$1.50/hour |
| **a10g-large** | 4x NVIDIA A10G | ~$6.00/hour |

## Deployment Workflow

```
┌─────────────────┐
│  Prepare Code   │
│  (Dockerfile,   │
│   requirements) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Space    │
│  (via API/Web)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Push to HF Git  │
│  (git push)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Wait for Build  │
│  & Deploy       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verify Health   │
│  (HTTP Check)   │
└─────────────────┘
```

## Tool Reference

### list_spaces

List all Hugging Face Spaces with optional filtering.

```yaml
parameters:
  author:
    type: string
    description: Filter by username/organization
  search:
    type: string
    description: Search term for space names
  limit:
    type: integer
    default: 100
    description: Maximum number of results
```

**Example:**
```python
# List all spaces for a user
await mcp.list_spaces(author="evolution-of-todo")

# Search for spaces
await mcp.list_spaces(search="todo", limit=50)
```

### create_space

Create a new Hugging Face Space.

```yaml
parameters:
  space_id:
    type: string
    required: true
    description: "Space ID in format 'username/space-name'"
  sdk:
    type: string
    enum: ["docker", "gradio", "streamlit", "static"]
    default: "docker"
  hardware:
    type: string
    default: "cpu-basic"
    description: "Hardware tier"
  private:
    type: boolean
    default: false
```

**Example:**
```python
# Create a Docker space
await mcp.create_space(
    space_id="evolution-of-todo/backend-api",
    sdk="docker",
    hardware="cpu-basic"
)
```

### get_space_info

Get detailed information about a Space.

```yaml
parameters:
  space_id:
    type: string
    required: true
    description: "Space ID in format 'username/space-name'"
```

**Example:**
```python
info = await mcp.get_space_info("evolution-of-todo/backend-api")
# Returns: space_id, author, name, sdk, hardware, tags, etc.
```

### update_file

Update or create a file in a Space repository.

```yaml
parameters:
  space_id:
    type: string
    required: true
  file_path:
    type: string
    required: true
    description: "Path in repository (e.g., 'app.py')"
  content:
    type: string
    required: true
    description: "File content"
  commit_message:
    type: string
    default: "Update file"
```

**Example:**
```python
# Update a file via API
await mcp.update_file(
    space_id="evolution-of-todo/backend-api",
    file_path="app.py",
    content="# FastAPI app\n...",
    commit_message="Add new endpoint"
)
```

### restart_space

Restart a Space (useful for troubleshooting).

```yaml
parameters:
  space_id:
    type: string
    required: true
```

**Example:**
```python
await mcp.restart_space("evolution-of-todo/backend-api")
```

### wait_for_space_ready

Wait for a Space to be in RUNNING state.

```yaml
parameters:
  space_id:
    type: string
    required: true
  timeout:
    type: integer
    default: 600
    description: "Maximum wait time in seconds"
  poll_interval:
    type: integer
    default: 10
    description: "Time between checks in seconds"
```

**Example:**
```python
# Wait up to 10 minutes for space to be ready
await mcp.wait_for_space_ready(
    space_id="evolution-of-todo/backend-api",
    timeout=600,
    poll_interval=10
)
```

### check_space_health

Health check via HTTP request.

```yaml
parameters:
  space_url:
    type: string
    required: true
    description: "Full URL of the Space"
```

**Example:**
```python
health = await mcp.check_space_health(
    "https://huggingface.co/spaces/evolution-of-todo/backend-api"
)
# Returns: { status: "healthy", status_code: 200, ... }
```

### get_space_logs

Get recent logs from a Space for debugging.

```yaml
parameters:
  space_id:
    type: string
    required: true
  lines:
    type: integer
    default: 100
```

**Example:**
```python
logs = await mcp.get_space_logs(
    "evolution-of-todo/backend-api",
    lines=200
)
```

### get_space_runtime

Get runtime information (state, hardware, stage).

```yaml
parameters:
  space_id:
    type: string
    required: true
```

**Example:**
```python
runtime = await mcp.get_space_runtime("evolution-of-todo/backend-api")
# Returns: { state: "RUNNING", hardware: {...}, stage: "RUNNING" }
```

### get_username

Get the authenticated user's username.

**Example:**
```python
user = await mcp.get_username()
# Returns: { name: "username", ... }
```

## Deployment Methods

### 1. Git Integration (Recommended)

Push code directly to Hugging Face Git repository.

```bash
# Clone the space repository
git clone https://huggingface.co/spaces/USERNAME/SPACE-NAME
cd SPACE-NAME

# Copy your files
cp -r /path/to/project/* .

# Commit and push
git add .
git commit -m "Deploy backend"
git push
```

**MCP Tool Usage:**
```python
# Create space first
await mcp.create_space("username/space-name", sdk="docker")

# Then use git commands
```

### 2. Web Interface

Upload files via Hugging Face web interface.

1. Go to https://huggingface.co/spaces
2. Create new Space
3. Upload files via web UI
4. Space auto-builds on push

### 3. Hugging Face CLI

```bash
# Login
huggingface-cli login

# Create space
huggingface-cli repo create my-space --type space --sdk docker

# Push files
git push huggingface main
```

### 4. MCP API Deployment

Update individual files via MCP API.

```python
# Update Dockerfile
await mcp.update_file(
    space_id="username/space-name",
    file_path="Dockerfile",
    content="FROM python:3.13\n..."
)

# Update requirements.txt
await mcp.update_file(
    space_id="username/space-name",
    file_path="requirements.txt",
    content="fastapi\nuvicorn\n..."
)

# Update main app
await mcp.update_file(
    space_id="username/space-name",
    file_path="src/main.py",
    content="from fastapi import FastAPI\n..."
)

# Restart to apply changes
await mcp.restart_space("username/space-name")
```

## Dockerfile for FastAPI

Standard Dockerfile for FastAPI on Hugging Face Spaces:

```dockerfile
# Use Python 3.13 slim image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Hugging Face uses 7860)
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

## Environment Variables

### Setting via Secrets

Secrets are encrypted and not visible in public spaces.

```python
# Via MCP (not directly supported in API, use web UI)
# Or set in Space settings: https://huggingface.co/spaces/USERNAME/SPACE-NAME/settings
```

**Recommended Secrets:**
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `HF_TOKEN` - Hugging Face token

### Setting via README.md

For non-sensitive variables:

```markdown
---
title: My Backend
emoji: 🚀
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
---
```

## Project Structure for Hugging Face

```
huggingface/
├── Dockerfile              # Container definition
├── README.md               # Space metadata
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (don't commit secrets!)
├── src/
│   ├── main.py            # FastAPI app
│   ├── config.py          # Configuration
│   ├── database.py        # Database setup
│   ├── models/            # Data models
│   ├── api/               # API routes
│   └── agent/             # AI agent logic
└── tests/                 # Tests (optional)
```

## Health Check Endpoint

Add a `/health` endpoint to your FastAPI app:

```python
from fastapi import FastAPI
from src.database import engine

app = FastAPI()

@app.get("/health")
async def health_check():
    """Health check endpoint for Hugging Face Spaces."""
    try:
        # Check database connection
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")

        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status=503, detail=f"Unhealthy: {str(e)}")
```

## Troubleshooting

### Space Not Building

1. **Check Dockerfile**: Ensure syntax is correct
2. **Check requirements.txt**: Ensure all dependencies are valid
3. **View logs**: Use `get_space_logs` tool

```python
logs = await mcp.get_space_logs("username/space-name", lines=500)
```

### Space Not Responding

1. **Check runtime state**:
```python
runtime = await mcp.get_space_runtime("username/space-name")
print(runtime["state"])  # Should be "RUNNING"
```

2. **Check health**:
```python
health = await mcp.check_space_health("https://huggingface.co/spaces/username/space-name")
```

3. **Restart space**:
```python
await mcp.restart_space("username/space-name")
```

### Port Issues

Hugging Face expects port **7860**. Ensure your app binds to this port:

```bash
# uvicorn
uvicorn src.main:app --host 0.0.0.0 --port 7860

# gunicorn
gunicorn src.main:app -b 0.0.0.0:7860
```

### Database Connection Issues

1. Verify `DATABASE_URL` is set in Space secrets
2. Check SSL settings (Neon requires `?sslmode=require`)
3. Test connection from health endpoint

### Out of Memory

- Upgrade to `cpu-upgrade` tier
- Optimize dependencies
- Reduce worker count

## Best Practices

### 1. Use Docker Layer Caching

```dockerfile
# Copy requirements first
COPY requirements.txt .
RUN pip install -r requirements.txt

# Then copy code
COPY . .
```

### 2. Minimal Base Image

```dockerfile
FROM python:3.13-slim  # Smaller than full image
```

### 3. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s \
    CMD curl -f http://localhost:7860/health || exit 1
```

### 4. Secrets Management

- Never commit secrets to Git
- Use Hugging Face Secrets for sensitive data
- Use `.env` only for local development

### 5. Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Application started")
```

### 6. Error Handling

```python
from fastapi import HTTPException, status

@app.get("/api/tasks")
async def get_tasks():
    try:
        # Your logic here
        return tasks
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
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
      - uses: actions/checkout@v3

      - name: Deploy to HF
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: |
          git config --global user.email "github-actions@github.com"
          git config --global user.name "GitHub Actions"
          git push https://$HF_TOKEN@huggingface.co/spaces/USERNAME/SPACE-NAME main
```

## MCP Server Setup

### Configuration

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "huggingface": {
      "command": "python",
      "args": [".claude/skills/huggingface-deployment/mcp-server.py"],
      "env": {
        "HF_TOKEN": "HF_TOKEN"
      }
    }
  }
}
```

### Enable in Settings

Add to `.claude/settings.local.json`:

```json
{
  "enabledMcpjsonServers": ["huggingface"]
}
```

### Get HF Token

1. Go to https://huggingface.co/settings/tokens
2. Create new token (write permissions)
3. Set as environment variable or in `.env`:
```
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Complete Deployment Example

```python
# 1. Create space
await mcp.create_space(
    space_id="evolution-of-todo/backend-api",
    sdk="docker",
    hardware="cpu-basic"
)

# 2. Update Dockerfile
await mcp.update_file(
    space_id="evolution-of-todo/backend-api",
    file_path="Dockerfile",
    content=open("Dockerfile").read()
)

# 3. Update requirements
await mcp.update_file(
    space_id="evolution-of-todo/backend-api",
    file_path="requirements.txt",
    content=open("requirements.txt").read()
)

# 4. Update main app
await mcp.update_file(
    space_id="evolution-of-todo/backend-api",
    file_path="src/main.py",
    content=open("src/main.py").read()
)

# 5. Restart space
await mcp.restart_space("evolution-of-todo/backend-api")

# 6. Wait for ready
await mcp.wait_for_space_ready(
    space_id="evolution-of-todo/backend-api",
    timeout=600
)

# 7. Check health
health = await mcp.check_space_health(
    "https://huggingface.co/spaces/evolution-of-todo/backend-api"
)

print(f"Deployment status: {health['status']}")
```

## Related Skills

- **Vercel Deployment**: Frontend deployment to Vercel
- **FastAPI**: Backend API framework
- **Playwright**: E2E testing for deployed applications

## Resources

- Hugging Face Spaces: https://huggingface.co/spaces
- Spaces Documentation: https://huggingface.co/docs/hub/spaces
- API Reference: https://huggingface.co/docs/huggingface_hub/guides/huggingface_spaces
- Pricing: https://huggingface.co/pricing#spaces

## Support

For issues or questions:
1. Check Space logs: `get_space_logs`
2. Review Hugging Face documentation
3. Check Dockerfile and requirements.txt syntax
4. Verify environment variables are set
