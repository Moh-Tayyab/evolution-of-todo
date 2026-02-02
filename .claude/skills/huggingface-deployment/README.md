# Hugging Face Spaces Deployment Skill

## Overview

This skill provides comprehensive deployment capabilities for Hugging Face Spaces, including MCP server tools, deployment agents, and automation hooks.

## Components

### 1. MCP Server (`mcp-server.py`)

Python-based MCP server with 12 tools for Hugging Face Spaces management:

- **list_spaces** - List all Spaces with filtering
- **create_space** - Create new Spaces
- **get_space_info** - Get detailed Space information
- **delete_space** - Delete Spaces
- **restart_space** - Restart Spaces
- **update_file** - Update files via Git API
- **get_file** - Get file contents
- **get_space_logs** - View Space logs
- **get_space_runtime** - Get runtime status
- **wait_for_space_ready** - Wait for deployment to complete
- **check_space_health** - HTTP health check
- **get_username** - Get authenticated username

### 2. Deployment Agent (`agents/huggingface-deployment.md`)

Expert agent documentation for:
- Space creation and configuration
- Docker-based deployment workflows
- Environment and secrets management
- Health monitoring and troubleshooting
- CI/CD integration patterns

### 3. Deployment Hooks

- **huggingface-pre-deploy.sh** - Pre-deployment validation
- **huggingface-post-deploy.sh** - Post-deployment verification

## Quick Start

### 1. Get Hugging Face Token

Visit https://huggingface.co/settings/tokens and create a token with **write** permissions.

### 2. Set Environment Variable

```bash
export HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Or add to `.env`:
```
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Run Pre-Deployment Checks

```bash
./.claude/hooks/huggingface-pre-deploy.sh
```

### 4. Deploy

Choose a deployment method:

**Option A: Git Push (Recommended)**
```bash
cd huggingface
git remote add huggingface https://huggingface.co/spaces/USERNAME/SPACE-NAME
git push huggingface main
```

**Option B: MCP API**
```python
await mcp.create_space("username/space-name", sdk="docker")
await mcp.update_file("username/space-name", "Dockerfile", dockerfile_content)
# ... update other files
await mcp.restart_space("username/space-name")
```

### 5. Verify Deployment

```bash
./.claude/hooks/huggingface-post-deploy.sh https://huggingface.co/spaces/USERNAME/SPACE-NAME username/space-name
```

## MCP Server Configuration

The MCP server is configured in `.mcp.json`:

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

And enabled in `.claude/settings.local.json`:

```json
{
  "enabledMcpjsonServers": ["huggingface"]
}
```

## Project Structure for Hugging Face

```
huggingface/
├── Dockerfile              # Container definition (MUST have this)
├── README.md               # Space metadata (recommended)
├── requirements.txt        # Python dependencies (MUST have this)
├── .env                    # Local environment (don't commit secrets!)
├── src/
│   ├── main.py            # FastAPI application
│   ├── config.py          # Configuration
│   ├── database.py        # Database setup
│   ├── models/            # Data models
│   ├── api/               # API routes
│   └── agent/             # AI agent logic
└── tests/                 # Tests (optional)
```

## Critical Requirements

### Dockerfile Must-Haves:

```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Copy requirements for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Hugging Face REQUIRES port 7860
EXPOSE 7860

# Health check (recommended)
HEALTHCHECK --interval=30s --timeout=10s \
    CMD curl -f http://localhost:7860/health || exit 1

# Must bind to 0.0.0.0, not localhost
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]
```

### requirements.txt Must-Haves:

```
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
sqlmodel>=0.0.22
python-dotenv>=1.0.1
```

### FastAPI Must-Haves:

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/health")
async def health():
    """Hugging Face requires this for health monitoring"""
    return {"status": "healthy"}
```

## Common Issues

### Issue: Space Not Building

**Symptoms**: Build error, status shows "BUILD_ERROR"

**Fixes**:
1. Check Dockerfile syntax
2. Verify requirements.txt format
3. Check logs: View logs on Hugging Face Space page

### Issue: Space Not Responding

**Symptoms**: HTTP 502, timeout

**Fixes**:
1. Ensure app binds to `0.0.0.0`, not `localhost`
2. Verify port is `7860`
3. Check `/health` endpoint exists

### Issue: Database Connection Failed

**Symptoms**: Connection errors, SSL errors

**Fixes**:
1. Add `?sslmode=require` to DATABASE_URL
2. Set DATABASE_URL in Space secrets (not .env)
3. Verify database is active

## Environment Variables

Set these in Space settings at:
```
https://huggingface.co/spaces/USERNAME/SPACE-NAME/settings
```

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret

**Optional:**
- `OPENAI_API_KEY` - For AI features
- `BETTER_AUTH_URL` - Frontend URL

## Hardware Tiers

| Tier | vCPU | RAM | GPU | Cost |
|------|------|-----|-----|------|
| cpu-basic | 2 | 16GB | - | Free |
| cpu-upgrade | 8 | 30GB | - | ~$75/mo |
| t4-small | 4 | 16GB | T4 | ~$330/mo |

## Monitoring

### Check Logs via MCP:

```python
logs = await mcp.get_space_logs("username/space-name", lines=500)
```

### Check Runtime Status:

```python
runtime = await mcp.get_space_runtime("username/space-name")
# Returns: { state: "RUNNING", hardware: {...}, stage: "RUNNING" }
```

### Health Check:

```python
health = await mcp.check_space_health("https://huggingface.co/spaces/username/space-name")
# Returns: { status: "healthy", status_code: 200 }
```

## Related Skills

- **Vercel Deployment** - Frontend deployment
- **FastAPI** - Backend framework
- **Playwright** - E2E testing

## Resources

- Hugging Face Spaces: https://huggingface.co/spaces
- Documentation: https://huggingface.co/docs/hub/spaces
- API Reference: https://huggingface.co/docs/huggingface_hub

## Support

For issues:
1. Check Space logs
2. Review this SKILL.md
3. Check Hugging Face forums
