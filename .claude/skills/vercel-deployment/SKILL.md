# Vercel Deployment Skill (Professional)

## Overview

Expert-level Vercel deployment automation skill using MCP (Model Context Protocol) server with comprehensive Vercel REST API integration. Provides professional-grade deployment operations, health checks, environment management, and rollback capabilities.

## Architecture

```
┌─────────────────┐     HTTP      ┌─────────────────┐
│   Claude Code   │◄──────────────►│  Vercel MCP     │
│   (Client)      │   FastMCP      │   Server        │
└─────────────────┘                └────────┬────────┘
                                            │
                                      ┌─────▼─────┐
                                      │  Vercel   │
                                      │    API    │
                                      │ (REST v1) │
                                      └───────────┘
```

### Components

1. **MCP Server** (`mcp-server.py`)
   - FastMCP framework implementation
   - 20+ tools for Vercel operations
   - Retry logic with exponential backoff
   - Health checks and deployment verification

2. **VercelClient** (HTTP Client)
   - Connection pooling
   - Rate limit handling (429 responses)
   - Proper error handling for 4xx vs 5xx errors
   - Async operations with httpx

3. **Tool Categories**
   - Project Management
   - Deployment Operations
   - Environment Variables
   - Deployment Verification
   - Domain Management
   - Utility/Validation

## Prerequisites

1. **VERCEL_TOKEN**: Get from https://vercel.com/account/tokens
   ```bash
   export VERCEL_TOKEN=your_token_here
   ```

2. **Install Dependencies**:
   ```bash
   pip install fastmcp httpx
   ```

3. **Configure MCP Server** in `.mcp.json`:
   ```json
   {
     "mcpServers": {
       "vercel": {
         "command": "python",
         "args": [".claude/skills/vercel-deployment/mcp-server.py"],
         "env": {
           "VERCEL_TOKEN": "VERCEL_TOKEN"
         }
       }
     }
   }
   ```

## MCP Tools Reference

### Project Management Tools

#### `list_projects(team_slug?)`

List all Vercel projects accessible to authenticated user.

**Parameters:**
- `team_slug` (optional): Filter projects by team

**Returns:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "prj_abc123",
      "name": "my-app",
      "framework": "nextjs",
      "link": {...}
    }
  ],
  "pagination": {...}
}
```

**Usage:**
```
Use the list_projects tool to show all my Vercel projects
```

---

#### `get_project(project_id, team_id?)`

Get detailed information about a specific project.

**Parameters:**
- `project_id`: Project ID or name
- `team_id` (optional): Team ID for team-scoped projects

**Returns:**
```json
{
  "success": true,
  "project": {
    "id": "prj_abc123",
    "name": "my-app",
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "outputDirectory": ".next"
  }
}
```

**Usage:**
```
Use get_project tool with project_id "evolution-of-todo"
```

---

#### `create_project(name, framework?, team_id?)`

Create a new Vercel project.

**Parameters:**
- `name`: Project name (must be unique)
- `framework` (default: "nextjs"): Framework type
- `team_id` (optional): Team ID

**Usage:**
```
Use create_project tool with name "my-new-app" and framework "nextjs"
```

---

### Deployment Operations Tools

#### `deploy_project(project_id, path?, environment?, team_id?)`

Create a new deployment.

**Parameters:**
- `project_id`: Project ID or name
- `path` (optional): Path to project directory
- `environment` (default: "production"): Target environment
- `team_id` (optional): Team ID

**Returns:**
```json
{
  "success": true,
  "deployment_id": "dpl_xyz789",
  "deployment_url": "https://my-app.vercel.app",
  "state": "QUEUED",
  "environment": "production"
}
```

**Usage:**
```
Use deploy_project tool with project_id "evolution-of-todo" and environment "production"
```

---

#### `list_deployments(project_id, environment?, limit?)`

List deployments for a project.

**Parameters:**
- `project_id`: Project ID or name
- `environment` (optional): Filter by environment
- `limit` (default: 20): Max deployments to return

**Usage:**
```
Use list_deployments tool with project_id "evolution-of-todo" and environment "production"
```

---

#### `get_deployment_status(deployment_id, project_id, team_id?)`

Get deployment status and details.

**Parameters:**
- `deployment_id`: Deployment ID
- `project_id`: Project ID or name
- `team_id` (optional): Team ID

**Returns:**
```json
{
  "success": true,
  "deployment": {...},
  "is_ready": true,
  "has_error": false,
  "state": "READY"
}
```

**Usage:**
```
Use get_deployment_status tool with deployment_id "dpl_xyz789" and project_id "evolution-of-todo"
```

---

#### `rollback_deployment(project_id, deployment_id, team_id?)`

Rollback to a specific deployment.

**Parameters:**
- `project_id`: Project ID or name
- `deployment_id`: Deployment ID to rollback to
- `team_id` (optional): Team ID

**Usage:**
```
Use rollback_deployment tool with project_id "evolution-of-todo" and deployment_id "dpl_abc123"
```

---

#### `promote_deployment(deployment_id, target_environment?, project_id?, team_id?)`

Promote preview deployment to production.

**Parameters:**
- `deployment_id`: Preview deployment URL or ID
- `target_environment` (default: "production"): Target environment
- `project_id` (optional): Project ID
- `team_id` (optional): Team ID

**Usage:**
```
Use promote_deployment tool with deployment_id "https://my-app-preview.vercel.app" and target_environment "production"
```

---

### Environment Variable Tools

#### `list_environment_variables(project_id, team_id?)`

List all environment variables.

**Parameters:**
- `project_id`: Project ID or name
- `team_id` (optional): Team ID

**Usage:**
```
Use list_environment_variables tool with project_id "evolution-of-todo"
```

---

#### `add_environment_variable(project_id, key, value, target?, type?, team_id?)`

Add or update environment variable.

**Parameters:**
- `project_id`: Project ID or name
- `key`: Variable name
- `value`: Variable value
- `target` (default: ["production", "preview"]): Target environments
- `type` (default: "plain"): Variable type (plain, secret, system)
- `team_id` (optional): Team ID

**Usage:**
```
Use add_environment_variable tool with project_id "evolution-of-todo", key "NEXT_PUBLIC_API_URL", and value "https://api.example.com"
```

---

#### `remove_environment_variable(project_id, env_id, team_id?)`

Remove environment variable.

**Parameters:**
- `project_id`: Project ID or name
- `env_id`: Environment variable ID
- `team_id` (optional): Team ID

**Usage:**
```
Use remove_environment_variable tool with project_id "evolution-of-todo" and env_id "env_abc123"
```

---

#### `sync_env_from_file(project_id, env_file, target?, team_id?)`

**KEY FEATURE**: Synchronize environment variables from .env file.

**Parameters:**
- `project_id`: Project ID or name
- `env_file`: Path to .env file
- `target` (default: ["production", "preview"]): Target environments
- `team_id` (optional): Team ID

**Returns:**
```json
{
  "success": true,
  "added": ["NEW_VAR"],
  "updated": ["API_URL", "DATABASE_URL"],
  "errors": [],
  "message": "Synced 3 environment variables"
}
```

**Usage:**
```
Use sync_env_from_file tool with project_id "evolution-of-todo" and env_file ".env.production"
```

---

### Deployment Verification Tools

#### `verify_deployment(deployment_url, health_path?, timeout?)`

Verify deployment is accessible and responding correctly.

**Parameters:**
- `deployment_url`: Deployment URL
- `health_path` (default: "/"): Health check endpoint path
- `timeout` (default: 60): Timeout in seconds

**Returns:**
```json
{
  "success": true,
  "status": "healthy",
  "url": "https://my-app.vercel.app",
  "checks": {
    "dns_resolution": {"status": "pass", "details": "..."},
    "ssl_certificate": {"status": "pass", "details": "..."},
    "http_response": {"status": "pass", "details": "..."},
    "health_endpoint": {"status": "pass", "details": "..."}
  },
  "response_time": 2.3
}
```

**Usage:**
```
Use verify_deployment tool with deployment_url "https://my-app.vercel.app" and health_path "/api/health"
```

---

#### `wait_for_deployment_ready(project_id, deployment_id, timeout?, poll_interval?)`

Wait for deployment to become ready (polls until state = READY).

**Parameters:**
- `project_id`: Project ID or name
- `deployment_id`: Deployment ID
- `timeout` (default: 300): Max wait time in seconds
- `poll_interval` (default: 5): Seconds between status checks

**Returns:**
```json
{
  "success": true,
  "state": "READY",
  "deployment_url": "https://my-app.vercel.app",
  "total_time": 45.2,
  "poll_count": 10,
  "verification": {...},
  "status_history": [...]
}
```

**Usage:**
```
Use wait_for_deployment_ready tool with project_id "evolution-of-todo" and deployment_id "dpl_xyz789"
```

---

### Domain Management Tools

#### `list_domains(project_id)`

List all custom domains.

**Parameters:**
- `project_id`: Project ID or name

**Usage:**
```
Use list_domains tool with project_id "evolution-of-todo"
```

---

#### `add_domain(project_id, domain, redirect?)`

Add custom domain.

**Parameters:**
- `project_id`: Project ID or name
- `domain`: Custom domain to add
- `redirect` (optional): Redirect path

**Usage:**
```
Use add_domain tool with project_id "evolution-of-todo" and domain "www.example.com"
```

---

#### `remove_domain(project_id, domain)`

Remove custom domain.

**Parameters:**
- `project_id`: Project ID or name
- `domain`: Custom domain to remove

**Usage:**
```
Use remove_domain tool with project_id "evolution-of-todo" and domain "www.example.com"
```

---

### Utility Tools

#### `get_project_info(path)`

Get project metadata from local directory.

**Parameters:**
- `path`: Path to project directory

**Returns:**
```json
{
  "success": true,
  "project": {
    "path": "/path/to/frontend",
    "name": "frontend",
    "framework": "nextjs",
    "has_package_json": true,
    "has_vercel_json": true,
    "has_env_file": true,
    "build_command": "next build",
    "env_vars": {"API_URL": "..."}
  }
}
```

**Usage:**
```
Use get_project_info tool with path "./frontend"
```

---

#### `validate_deployment_config(project_path)`

Validate project is ready for deployment.

**Parameters:**
- `project_path`: Path to project directory

**Returns:**
```json
{
  "valid": true,
  "warnings": ["No build script found"],
  "errors": [],
  "recommendations": ["Add vercel.json"]
}
```

**Usage:**
```
Use validate_deployment_config tool with project_path "./frontend"
```

---

## Deployment Workflow Examples

### Complete Production Deployment

```
# 1. Validate project is ready
Use validate_deployment_config tool with project_path "./frontend"

# 2. Get project info
Use get_project_info tool with path "./frontend"

# 3. Sync environment variables from .env file
Use sync_env_from_file tool with project_id "evolution-of-todo" and env_file ".env.production"

# 4. Deploy to production
Use deploy_project tool with project_id "evolution-of-todo" and environment "production"

# 5. Wait for deployment to be ready
Use wait_for_deployment_ready tool with project_id "evolution-of-todo" and deployment_id "dpl_xyz789"

# 6. Verify deployment health
Use verify_deployment tool with deployment_url "https://evolution-of-todo.vercel.app" and health_path "/"
```

### Rollback Workflow

```
# 1. List recent deployments
Use list_deployments tool with project_id "evolution-of-todo" and limit 10

# 2. Rollback to specific deployment
Use rollback_deployment tool with project_id "evolution-of-todo" and deployment_id "dpl_abc123"

# 3. Verify rollback
Use verify_deployment tool with deployment_url "https://evolution-of-todo.vercel.app"
```

---

## Features

- **20+ MCP Tools**: Comprehensive Vercel API coverage
- **Retry Logic**: Exponential backoff for API failures
- **Health Checks**: DNS, SSL, HTTP verification
- **Environment Sync**: Automatic .env file synchronization
- **Deployment Polling**: Wait for deployment readiness
- **Rollback Support**: Quick rollback to previous deployments
- **Team Support**: Team/organization scoped operations
- **Domain Management**: Custom domain configuration

---

## Error Handling

The MCP server includes comprehensive error handling:

- **4xx Errors**: Client errors are not retried (authentication, validation)
- **5xx Errors**: Server errors are retried with exponential backoff
- **Rate Limiting (429)**: Respects `retry-after` header
- **Connection Errors**: Retries with backoff
- **Timeout Errors**: Configurable timeouts for all operations

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VERCEL_TOKEN` | Vercel authentication token | Yes |
| `VERCEL_ORG_ID` | Organization ID (optional) | No |
| `VERCEL_PROJECT_ID` | Default project ID (optional) | No |

---

## Authentication

1. Generate token at https://vercel.com/account/tokens
2. Set environment variable: `export VERCEL_TOKEN=your_token`
3. Token is passed via MCP server configuration in .mcp.json

---

## Troubleshooting

### Authentication Failed

```bash
# Verify token is valid
curl -H "Authorization: Bearer $VERCEL_TOKEN" https://api.vercel.com/v2/user

# Regenerate token if expired
# Visit https://vercel.com/account/tokens
```

### Deployment Timeout

```bash
# Use wait_for_deployment_ready with extended timeout
# timeout: 600 (10 minutes)
```

### Environment Variables Not Applied

```bash
# Use sync_env_from_file to bulk sync
# Or verify with list_environment_variables
```

---

## Best Practices

1. **Use `wait_for_deployment_ready`**: Always wait for deployments to complete
2. **Use `verify_deployment`**: Confirm deployment health after completion
3. **Use `sync_env_from_file`**: Keep Vercel env vars in sync with .env files
4. **Use `validate_deployment_config`**: Check project readiness before deploying
5. **Set appropriate timeouts**: Large builds may take 5-10 minutes
6. **Monitor rate limits**: Vercel API has rate limits per token

---

## Files Structure

```
.claude/skills/vercel-deployment/
├── SKILL.md              # This file - comprehensive documentation
├── README.md             # Quick reference guide
├── mcp-server.py         # FastMCP server with 20+ tools
└── scripts/
    ├── deploy.sh         # Shell script wrapper
    └── start-mcp.sh      # MCP server startup script
```

---

## Version History

- **2.0.0**: Professional MCP server with 20+ tools, health checks, environment sync
- **1.0.0**: Basic shell script deployment
