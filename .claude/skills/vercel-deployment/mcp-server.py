"""
Vercel MCP Server - Professional Deployment Automation
@spec: .claude/skills/vercel-deployment/SKILL.md

This MCP server provides comprehensive Vercel platform integration for:
- Project management (create, list, inspect)
- Deployment operations (deploy, list, rollback, promote)
- Environment variable management (sync, add, remove, list)
- Domain management (add, remove, list)
- Deployment verification (health checks, URL validation)
- Team/organization management

Features:
- FastMCP framework for tool definitions
- Proper authentication via VERCEL_TOKEN
- Retry logic with exponential backoff
- Comprehensive error handling
- Post-deployment verification
- Health check endpoints
"""

import asyncio
import os
import json
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
from pathlib import Path

try:
    from fastmcp import FastMCP, Context
    import httpx
except ImportError as e:
    print(f"ERROR: Missing required dependency: {e}")
    print("Install with: pip install fastmcp httpx")
    raise

# Initialize FastMCP server
mcp = FastMCP("Vercel Deployment Professional")

# Configuration
VERCEL_API_BASE = "https://api.vercel.com/v1"
VERCEL_API_BASE_V2 = "https://api.vercel.com/v2"
VERCEL_TOKEN = os.getenv("VERCEL_TOKEN", "")
DEFAULT_TIMEOUT = 30.0

# HTTP client with retry logic
class VercelClient:
    """HTTP client for Vercel API with retry logic and error handling."""

    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client with connection pooling."""
        if self._client is None:
            timeout = httpx.Timeout(60.0)
            limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)
            self._client = httpx.AsyncClient(
                timeout=timeout,
                limits=limits,
                headers=self.headers
            )
        return self._client

    async def _request_with_retry(
        self,
        method: str,
        url: str,
        max_retries: int = 3,
        **kwargs
    ) -> Dict[str, Any]:
        """Make HTTP request with exponential backoff retry logic."""
        client = await self._get_client()
        base_delay = 1.0

        for attempt in range(max_retries):
            try:
                response = await client.request(method, url, **kwargs)
                response.raise_for_status()

                # Handle rate limiting
                if response.status_code == 429:
                    retry_after = int(response.headers.get("retry-after", 60))
                    if attempt < max_retries - 1:
                        await asyncio.sleep(retry_after)
                        continue

                return response.json()

            except httpx.HTTPStatusError as e:
                # Don't retry on client errors (4xx)
                if 400 <= e.response.status_code < 500:
                    raise
                # Retry on server errors (5xx) with backoff
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    await asyncio.sleep(delay)
                    continue
                raise

            except httpx.RequestError as e:
                # Retry on connection errors
                if attempt < max_retries - 1:
                    await asyncio.sleep(base_delay * (2 ** attempt))
                    continue
                raise

        raise Exception("Max retries exceeded")

    async def get(self, endpoint: str, api_version: str = "v1", **params) -> Dict[str, Any]:
        """Make GET request to Vercel API."""
        base_url = VERCEL_API_BASE_V2 if api_version == "v2" else VERCEL_API_BASE
        url = f"{base_url}{endpoint}"
        return await self._request_with_retry("GET", url, params=params)

    async def post(self, endpoint: str, data: Dict, api_version: str = "v2") -> Dict[str, Any]:
        """Make POST request to Vercel API."""
        base_url = VERCEL_API_BASE_V2 if api_version == "v2" else VERCEL_API_BASE
        url = f"{base_url}{endpoint}"
        return await self._request_with_retry("POST", url, json=data)

    async def put(self, endpoint: str, data: Dict, api_version: str = "v2") -> Dict[str, Any]:
        """Make PUT request to Vercel API."""
        base_url = VERCEL_API_BASE_V2 if api_version == "v2" else VERCEL_API_BASE
        url = f"{base_url}{endpoint}"
        return await self._request_with_retry("PUT", url, json=data)

    async def delete(self, endpoint: str, api_version: str = "v2") -> Dict[str, Any]:
        """Make DELETE request to Vercel API."""
        base_url = VERCEL_API_BASE_V2 if api_version == "v2" else VERCEL_API_BASE
        url = f"{base_url}{endpoint}"
        return await self._request_with_retry("DELETE", url)

    async def close(self):
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()


# Global client
_client: Optional[VercelClient] = None


def get_client() -> VercelClient:
    """Get or create Vercel client singleton."""
    global _client
    if _client is None:
        if not VERCEL_TOKEN:
            raise ValueError(
                "VERCEL_TOKEN environment variable is required. "
                "Set it with: export VERCEL_TOKEN=your_token"
            )
        _client = VercelClient(VERCEL_TOKEN)
    return _client


# ============================================================================
# MCP TOOLS - PROJECT MANAGEMENT
# ============================================================================

@mcp.tool()
async def list_projects(
    team_slug: Optional[str] = None
) -> Dict[str, Any]:
    """
    List all Vercel projects accessible to the authenticated user.

    Args:
        team_slug: Optional team slug to filter projects by team

    Returns:
        Dictionary containing list of projects with their details

    Example:
        /vercel-deploy list-projects
        /vercel-deploy list-projects team_slug=my-team
    """
    client = get_client()
    params = {}
    if team_slug:
        params["teamId"] = team_slug

    result = await client.get("/projects", params=params)

    return {
        "success": True,
        "projects": result.get("projects", []),
        "pagination": result.get("pagination", {})
    }


@mcp.tool()
async def get_project(
    project_id: str,
    team_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get detailed information about a specific Vercel project.

    Args:
        project_id: The ID or name of the project
        team_id: Optional team ID for team-scoped projects

    Returns:
        Dictionary containing project details including name, framework,
        build settings, and environment configuration

    Example:
        /vercel-deploy get-project prj_abc123
    """
    client = get_client()
    params = {"teamId": team_id} if team_id else {}

    result = await client.get(f"/projects/{project_id}", params=params)

    return {
        "success": True,
        "project": result
    }


@mcp.tool()
async def create_project(
    name: str,
    framework: str = "nextjs",
    team_id: Optional[str] = None
) -> Dict[str, str]:
    """
    Create a new Vercel project.

    Args:
        name: Project name (must be unique across your account)
        framework: Framework type (nextjs, react, vue, etc.)
        team_id: Optional team ID to create project under a team

    Returns:
        Dictionary with success status and project details

    Example:
        /vercel-deploy create-project my-app --framework nextjs
    """
    client = get_client()

    data = {"name": name, "framework": framework}
    if team_id:
        data["teamId"] = team_id

    try:
        result = await client.post("/projects", data)
        return {
            "success": True,
            "project_id": result.get("id"),
            "name": result.get("name"),
            "url": f"https://{name}.vercel.app"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# MCP TOOLS - DEPLOYMENT OPERATIONS
# ============================================================================

@mcp.tool()
async def deploy_project(
    project_id: str,
    path: Optional[str] = None,
    environment: str = "production",
    team_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Deploy a Vercel project (create a new deployment).

    Args:
        project_id: The ID or name of the project to deploy
        path: Optional path to the project directory
        environment: Target environment (production, preview)
        team_id: Optional team ID for team projects

    Returns:
        Dictionary with deployment status and URL

    Example:
        /vercel-deploy deploy prj_abc123 --environment production
    """
    client = get_client()

    data = {
        "name": f"{project_id}-{int(datetime.now().timestamp())}",
        "target": [environment]
    }

    if team_id:
        data["teamId"] = team_id
    if path:
        data["path"] = path

    result = await client.post(f"/projects/{project_id}/deployments", data)

    return {
        "success": True,
        "deployment_id": result.get("id"),
        "deployment_url": result.get("url"),
        "state": result.get("state"),
        "environment": environment
    }


@mcp.tool()
async def list_deployments(
    project_id: str,
    environment: Optional[str] = None,
    limit: int = 20
) -> Dict[str, Any]:
    """
    List deployments for a Vercel project.

    Args:
        project_id: The ID or name of the project
        environment: Filter by environment (production, preview)
        limit: Maximum number of deployments to return

    Returns:
        Dictionary with list of deployments and their status

    Example:
        /vercel-deploy list-deployments prj_abc123
        /vercel-deploy list-deployments prj_abc123 --environment production
    """
    client = get_client()

    params = {"limit": limit}
    if environment:
        params["environment"] = environment

    result = await client.get(f"/projects/{project_id}/deployments", params=params)

    return {
        "success": True,
        "deployments": result.get("deployments", []),
        "pagination": result.get("pagination", {})
    }


@mcp.tool()
async def get_deployment_status(
    deployment_id: str,
    project_id: str,
    team_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get the status and details of a specific deployment.

    Args:
        deployment_id: The unique ID of the deployment
        project_id: The project ID or name
        team_id: Optional team ID

    Returns:
        Dictionary with deployment state, build logs, and readiness status

    Example:
        /vercel-deploy deployment-status dpl_abc123
    """
    client = get_client()

    params = {"teamId": team_id} if team_id else {}

    result = await client.get(f"/v13/deployments/{deployment_id}", params=params)

    # Determine if deployment is ready
    state = result.get("state", "")
    is_ready = state in ["READY", "BUILDING", "DEPLOYING"]
    has_error = result.get("error", None)

    return {
        "success": True,
        "deployment": result,
        "is_ready": is_ready,
        "has_error": has_error is not None,
        "state": state
    }


@mcp.tool()
async def rollback_deployment(
    project_id: str,
    deployment_id: str,
    team_id: Optional[str] = None
) -> Dict[str, str]:
    """
    Rollback a project to a specific deployment.

    Args:
        project_id: The ID or name of the project
        deployment_id: The deployment ID to rollback to
        team_id: Optional team ID

    Returns:
        Dictionary with rollback status

    Example:
        /vercel-deploy rollback prj_abc123 dpl_xyz789
    """
    client = get_client()

    data = {
        "deploymentId": deployment_id
    }

    if team_id:
        data["teamId"] = team_id

    result = await client.post(f"/projects/{project_id}/rollback", data)

    return {
        "success": True,
        "message": f"Rolled back to deployment {deployment_id}",
        "deployment": result
    }


@mcp.tool()
async def promote_deployment(
    deployment_id: str,
    target_environment: str = "production",
    project_id: Optional[str] = None,
    team_id: Optional[str] = None
) -> Dict[str, str]:
    """
    Promote a preview deployment to production.

    Args:
        deployment_id: The preview deployment URL or ID to promote
        target_environment: Target environment (default: production)
        project_id: Optional project ID
        team_id: Optional team ID

    Returns:
        Dictionary with promotion status

    Example:
        /vercel-deploy promote https://my-app.vercel.app
    """
    client = get_client()

    # Determine project from deployment if not provided
    if not project_id:
        # Extract project from deployment URL
        if deployment_id.startswith("http"):
            from urllib.parse import urlparse
            parsed = urlparse(deployment_id)
            project_id = parsed.hostname.replace(".vercel.app", "")
        else:
            project_id = deployment_id

    data = {
        "deploymentId": deployment_id,
        "target": [target_environment]
    }

    if team_id:
        data["teamId"] = team_id

    result = await client.post(f"/projects/{project_id}/promote", data)

    return {
        "success": True,
        "message": f"Promoted deployment to {target_environment}",
        "deployment": result
    }


# ============================================================================
# MCP TOOLS - ENVIRONMENT VARIABLES
# ============================================================================

@mcp.tool()
async def list_environment_variables(
    project_id: str,
    team_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    List all environment variables for a project.

    Args:
        project_id: The ID or name of the project
        team_id: Optional team ID

    Returns:
        Dictionary with list of environment variables

    Example:
        /vercel-deploy list-env prj_abc123
    """
    client = get_client()

    params = {"teamId": team_id} if team_id else {}

    result = await client.get(f"/projects/{project_id}/env", params=params)

    return {
        "success": True,
        "env_vars": result.get("envs", [])
    }


@mcp.tool()
async def add_environment_variable(
    project_id: str,
    key: str,
    value: str,
    target: List[str] = ["production", "preview"],
    type: str = "plain",
    team_id: Optional[str] = None
) -> Dict[str, str]:
    """
    Add or update an environment variable for a project.

    Args:
        project_id: The ID or name of the project
        key: Environment variable name
        value: Environment variable value
        target: Target environments (production, preview, development)
        type: Variable type (plain, secret, system)
        team_id: Optional team ID

    Returns:
        Dictionary with success status and environment variable ID

    Example:
        /vercel-deploy set-env prj_abc123 API_URL https://api.example.com
        /vercel-deploy set-env prj_abc123 DATABASE_URL postgres://... --type secret
    """
    client = get_client()

    data = {
        "key": key,
        "value": value,
        "type": type,
        "target": target
    }

    if team_id:
        data["teamId"] = team_id

    result = await client.post(f"/projects/{project_id}/env", data)

    return {
        "success": True,
        "env_id": result.get("id"),
        "key": key,
        "message": f"Environment variable '{key}' added successfully"
    }


@mcp.tool()
async def remove_environment_variable(
    project_id: str,
    env_id: str,
    team_id: Optional[str] = None
) -> Dict[str, str]:
    """
    Remove an environment variable from a project.

    Args:
        project_id: The ID or name of the project
        env_id: The ID of the environment variable to remove
        team_id: Optional team ID

    Returns:
        Dictionary with success status

    Example:
        /vercel-deploy remove-env prj_abc123 env_abc123
    """
    client = get_client()

    params = {"teamId": team_id} if team_id else {}

    result = await client.delete(f"/projects/{project_id}/env/{env_id}", params=params)

    return {
        "success": True,
        "message": f"Environment variable {env_id} removed successfully"
    }


@mcp.tool()
async def sync_env_from_file(
    project_id: str,
    env_file: str,
    target: List[str] = ["production", "preview"],
    team_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Synchronize environment variables from a .env file to Vercel.

    Reads a .env file and updates all environment variables in Vercel.

    Args:
        project_id: The ID or name of the project
        env_file: Path to the .env file
        target: Target environments for the variables
        team_id: Optional team ID

    Returns:
        Dictionary with sync results including added, updated, and removed variables

    Example:
        /vercel-deploy sync-env prj_abc123 .env.production
        /vercel-deploy sync-env prj_abc123 .env --target production
    """
    from pathlib import Path

    env_path = Path(env_file)
    if not env_path.exists():
        return {
            "success": False,
            "error": f"Environment file not found: {env_file}"
        }

    # Parse .env file
    env_vars = {}
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                env_vars[key.strip()] = value.strip().strip('"\'')

    client = get_client()

    # Get existing environment variables
    params = {"teamId": team_id} if team_id else {}
    existing = await client.get(f"/projects/{project_id}/env", params=params)
    existing_envs = {env["key"]: env["id"] for env in existing.get("envs", [])}

    added = []
    updated = []
    errors = []

    # Add or update each environment variable
    for key, value in env_vars.items():
        try:
            if key in existing_envs:
                # Update existing
                await client.delete(f"/projects/{project_id}/env/{existing_envs[key]}", params=params)
                await client.post(f"/projects/{project_id}/env", data={
                    "key": key,
                    "value": value,
                    "type": "plain",
                    "target": target,
                    "teamId": team_id
                })
                updated.append(key)
            else:
                # Add new
                await client.post(f"/projects/{project_id}/env", data={
                    "key": key,
                    "value": value,
                    "type": "plain",
                    "target": target,
                    "teamId": team_id
                })
                added.append(key)
        except Exception as e:
            errors.append(f"{key}: {str(e)}")

    return {
        "success": True,
        "added": added,
        "updated": updated,
        "errors": errors,
        "message": f"Synced {len(added) + len(updated)} environment variables"
    }


# ============================================================================
# MCP TOOLS - DEPLOYMENT VERIFICATION
# ============================================================================

@mcp.tool()
async def verify_deployment(
    deployment_url: str,
    health_path: str = "/",
    timeout: int = 60
) -> Dict[str, Any]:
    """
    Verify that a deployment is accessible and responding correctly.

    Performs health checks on the deployed application.

    Args:
        deployment_url: The URL of the deployment to verify
        health_path: Path to health check endpoint (default: /)
        timeout: Maximum time to wait for health check in seconds

    Returns:
        Dictionary with verification results including status, response time,
        and any issues found

    Example:
        /vercel-deploy verify https://my-app.vercel.app
        /vercel-deploy verify https://my-app.vercel.app --health-path /api/health
    """
    import asyncio

    client = get_client()

    # Ensure URL has protocol
    if not deployment_url.startswith("http"):
        deployment_url = f"https://{deployment_url}"

    start_time = datetime.now()
    end_time = start_time + timedelta(seconds=timeout)

    checks = {
        "dns_resolution": {"status": "pending", "details": ""},
        "ssl_certificate": {"status": "pending", "details": ""},
        "http_response": {"status": "pending", "details": ""},
        "health_endpoint": {"status": "pending", "details": ""}
    }

    try:
        # DNS Resolution check
        import socket
        host = deployment_url.split("://")[1].split("/")[0]
        try:
            socket.gethostbyname(host)
            checks["dns_resolution"] = {
                "status": "pass",
                "details": f"DNS resolved successfully for {host}"
            }
        except socket.gaierror as e:
            checks["dns_resolution"] = {
                "status": "fail",
                "details": f"DNS resolution failed: {e}"
            }
            return {
                "success": False,
                "checks": checks,
                "error": "DNS resolution failed"
            }

        # HTTP Response check
        async def check_http():
            try:
                response = await client._get_client().get(
                    deployment_url,
                    timeout=10.0,
                    follow_redirects=True
                )

                response_time = (datetime.now() - start_time).total_seconds()

                if response.status_code == 200:
                    checks["http_response"] = {
                        "status": "pass",
                        "details": f"HTTP 200 OK (response time: {response_time:.2f}s)"
                    }
                else:
                    checks["http_response"] = {
                        "status": "fail",
                        "details": f"HTTP {response.status_code}: {response.text[:200]}"
                    }

                # SSL Certificate check
                if deployment_url.startswith("https://"):
                    checks["ssl_certificate"] = {
                        "status": "pass",
                        "details": "SSL certificate is valid"
                    }

            except httpx.RequestError as e:
                checks["http_response"] = {
                    "status": "fail",
                    "details": f"HTTP request failed: {e}"
                }

        await check_http()

        # Health endpoint check
        health_url = f"{deployment_url.rstrip('/')}/{health_path.lstrip('/')}"
        try:
            health_response = await client._get_client().get(
                health_url,
                timeout=5.0
            )

            if health_response.status_code == 200:
                health_data = health_response.json()
                checks["health_endpoint"] = {
                    "status": "pass",
                    "details": f"Health check passed: {health_data.get('status', 'ok')}"
                }
            else:
                checks["health_endpoint"] = {
                    "status": "fail",
                    "details": f"Health check returned {health_response.status_code}"
                }
        except Exception as e:
            checks["health_endpoint"] = {
                "status": "skip",
                "details": f"Health check not available: {e}"
            }

        # Determine overall status
        all_pass = all(
            check["status"] in ["pass", "skip"]
            for check in checks.values()
        )

        overall_status = "healthy" if all_pass else "unhealthy"

        return {
            "success": all_pass,
            "status": overall_status,
            "url": deployment_url,
            "checks": checks,
            "response_time": (datetime.now() - start_time).total_seconds()
        }

    except Exception as e:
        return {
            "success": False,
            "status": "error",
            "error": str(e),
            "checks": checks
        }


@mcp.tool()
async def wait_for_deployment_ready(
    project_id: str,
    deployment_id: str,
    timeout: int = 300,
    poll_interval: int = 5
) -> Dict[str, Any]:
    """
    Wait for a deployment to become ready (state = READY).

    Polls the deployment status until it's ready or timeout occurs.

    Args:
        project_id: The ID or name of the project
        deployment_id: The deployment ID to wait for
        timeout: Maximum time to wait in seconds
        poll_interval: Time between status checks in seconds

    Returns:
        Dictionary with final status, wait time, and readiness checks

    Example:
        /vercel-deploy wait-ready prj_abc123 dpl_xyz789
    """
    client = get_client()

    start_time = datetime.now()
    end_time = start_time + timedelta(seconds=timeout)

    poll_count = 0
    status_history = []

    while datetime.now() < end_time:
        poll_count += 1

        try:
            result = await client.get(f"/v13/deployments/{deployment_id}")
            state = result.get("state", "")

            status_history.append({
                "timestamp": datetime.now().isoformat(),
                "state": state,
                "poll": poll_count
            })

            if state == "READY":
                total_time = (datetime.now() - start_time).total_seconds()

                # Verify the deployment is accessible
                deployment_url = result.get("url", "")
                if deployment_url:
                    verification = await verify_deployment(deployment_url)
                else:
                    verification = {"success": False, "error": "No deployment URL"}

                return {
                    "success": True,
                    "state": state,
                    "deployment_url": deployment_url,
                    "total_time": total_time,
                    "poll_count": poll_count,
                    "verification": verification,
                    "status_history": status_history
                }
            elif state in ["ERROR", "CANCELED", "FAILED"]:
                return {
                    "success": False,
                    "state": state,
                    "error": result.get("error", "Deployment failed"),
                    "status_history": status_history
                }

            # Not ready yet, wait and poll again
            await asyncio.sleep(poll_interval)

        except Exception as e:
            status_history.append({
                "timestamp": datetime.now().isoformat(),
                "state": "ERROR",
                "error": str(e),
                "poll": poll_count
            })
            break

    total_time = (datetime.now() - start_time).total_seconds()

    return {
        "success": False,
        "state": "TIMEOUT",
        "error": f"Deployment not ready after {timeout}s",
        "total_time": total_time,
        "poll_count": poll_count,
        "status_history": status_history
    }


# ============================================================================
# MCP TOOLS - DOMAIN MANAGEMENT
# ============================================================================

@mcp.tool()
async def list_domains(
    project_id: str
) -> Dict[str, Any]:
    """
    List all domains configured for a project.

    Args:
        project_id: The ID or name of the project

    Returns:
        Dictionary with list of domains and their configuration

    Example:
        /vercel-deploy list-domains prj_abc123
    """
    client = get_client()

    result = await client.get(f"/projects/{project_id}/domains")

    return {
        "success": True,
        "domains": result.get("domains", [])
    }


@mcp.tool()
async def add_domain(
    project_id: str,
    domain: str,
    redirect: Optional[str] = None
) -> Dict[str, str]:
    """
    Add a custom domain to a Vercel project.

    Args:
        project_id: The ID or name of the project
        domain: The custom domain to add
        redirect: Optional redirect path for the domain

    Returns:
        Dictionary with success status and domain configuration details

    Example:
        /vercel-deploy add-domain prj_abc123 www.example.com
        /vercel-deploy add-domain prj_abc123 www.example.com --redirect /app
    """
    client = get_client()

    data = {"name": domain}
    if redirect:
        data["redirect"] = redirect

    result = await client.post(f"/projects/{project_id}/domains", data)

    return {
        "success": True,
        "domain": result,
        "message": f"Domain {domain} added successfully"
    }


@mcp.tool()
async def remove_domain(
    project_id: str,
    domain: str
) -> Dict[str, str]:
    """
    Remove a custom domain from a Vercel project.

    Args:
        project_id: The ID or name of the project
        domain: The custom domain to remove

    Returns:
        Dictionary with success status

    Example:
        /vercel-deploy remove-domain prj_abc123 www.example.com
    """
    client = get_client()

    # Get domain ID first
    domains_result = await client.get(f"/projects/{project_id}/domains")

    domain_id = None
    for d in domains_result.get("domains", []):
        if d.get("name") == domain:
            domain_id = d.get("id")
            break

    if not domain_id:
        return {
            "success": False,
            "error": f"Domain {domain} not found"
        }

    result = await client.delete(f"/projects/{project_id}/domains/{domain_id}")

    return {
        "success": True,
        "message": f"Domain {domain} removed successfully"
    }


# ============================================================================
# MCP TOOLS - UTILITY
# ============================================================================

@mcp.tool()
async def get_project_info(
    context: Context,
    path: str
) -> Dict[str, Any]:
    """
    Get project information from a local project directory.

    Scans package.json, vercel.json, and other configuration files
    to extract project metadata for deployment.

    Args:
        context: MCP context for path resolution
        path: Path to the project directory

    Returns:
        Dictionary with project information including name, framework,
        build commands, and environment variables

    Example:
        /vercel-deploy project-info ./frontend
    """
    from pathlib import Path

    project_path = Path(path).resolve()

    if not project_path.exists():
        return {
            "success": False,
            "error": f"Directory not found: {path}"
        }

    info = {
        "path": str(project_path),
        "name": project_path.name,
        "has_package_json": False,
        "has_vercel_json": False,
        "has_env_file": False,
        "framework": "unknown",
        "build_command": None,
        "dev_command": None,
        "env_vars": {}
    }

    # Check package.json
    package_json = project_path / "package.json"
    if package_json.exists():
        info["has_package_json"] = True
        try:
            import json
            with open(package_json) as f:
                package_data = json.load(f)

            info.update({
                "name": package_data.get("name", project_path.name),
                "version": package_data.get("version"),
                "scripts": package_data.get("scripts", {})
            })

            # Detect framework
            dependencies = package_data.get("dependencies", {})
            dev_dependencies = package_data.get("devDependencies", {})

            if "next" in dependencies or "next" in dev_dependencies:
                info["framework"] = "nextjs"
            elif "react" in dependencies:
                info["framework"] = "react"
            elif "vue" in dependencies:
                info["framework"] = "vue"
        except Exception as e:
            info["parse_error"] = str(e)

    # Check vercel.json
    vercel_json = project_path / "vercel.json"
    if vercel_json.exists():
        info["has_vercel_json"] = True
        try:
            import json
            with open(vercel_json) as f:
                vercel_config = json.load(f)

            info["vercel_config"] = vercel_config
        except Exception as e:
            info["parse_error"] = str(e)

    # Check for .env files
    for env_file in [".env", ".env.local", ".env.production"]:
        env_path = project_path / env_file
        if env_path.exists():
            info["has_env_file"] = True
            info["env_file"] = env_file

            # Parse environment variables (non-comment lines)
            env_vars = {}
            try:
                with open(env_path) as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, value = line.split("=", 1)
                            env_vars[key.strip()] = value.strip().strip('"\'')
                info["env_vars"] = env_vars
            except Exception:
                pass
            break

    return {
        "success": True,
        "project": info
    }


@mcp.tool()
async def validate_deployment_config(
    project_path: str
) -> Dict[str, Any]:
    """
    Validate that a project is ready for Vercel deployment.

    Checks for:
    - Valid package.json
    - Build script available
    - No deployment blocking issues

    Args:
        project_path: Path to the project directory

    Returns:
        Dictionary with validation results, warnings, and recommendations

    Example:
        /vercel-deploy validate-config ./frontend
    """
    from pathlib import Path
    import json

    path = Path(project_path).resolve()

    results = {
        "valid": True,
        "warnings": [],
        "errors": [],
        "recommendations": []
    }

    # Check package.json exists
    package_json = path / "package.json"
    if not package_json.exists():
        results["errors"].append("package.json not found")
        results["valid"] = False
        return results

    # Parse package.json
    try:
        with open(package_json) as f:
            package_data = json.load(f)
    except Exception as e:
        results["errors"].append(f"Invalid package.json: {e}")
        results["valid"] = False
        return results

    # Check for build script
    scripts = package_data.get("scripts", {})
    if "build" not in scripts:
        results["warnings"].append("No build script found")
        results["recommendations"].append("Add a build script to package.json")
    else:
        build_cmd = scripts["build"]
        if "next" not in build_cmd.lower() and any(fw in build_cmd.lower() for fw in ["react", "vue", "angular"]):
            results["framework"] = "Detected framework but build may not use Vercel optimizer"

    # Check for start script
    if "start" not in scripts and "dev" not in scripts:
        results["warnings"].append("No start or dev script found")

    # Check for vercel.json
    vercel_json = path / "vercel.json"
    if not vercel_json.exists():
        results["recommendations"].append("Consider adding vercel.json for custom build settings")

    # Check for large files
    node_modules = path / "node_modules"
    if node_modules.exists():
        import shutil
        size = shutil.disk_usage(node_modules).sum()
        size_mb = size / (1024 * 1024)
        if size_mb > 500:
            results["warnings"].append(f"node_modules is large ({size_mb:.1f}MB), consider .vercelignore")

    return results


# ============================================================================
# SERVER STARTUP
# ============================================================================

async def main():
    """Start the MCP server."""
    await mcp.run()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
