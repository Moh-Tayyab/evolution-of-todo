#!/usr/bin/env python3
"""
Hugging Face Spaces MCP Server
Provides Model Context Protocol tools for Hugging Face Spaces deployment and management.

Compatible with: FastMCP framework
API Version: Hugging Face REST API
"""

import os
import sys
import json
import time
import asyncio
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from pathlib import Path

# MCP Server imports
try:
    from mcp.server.models import InitializationOptions
    from mcp.server import NotificationOptions, Server
    from mcp.server.stdio import stdio_server
    from mcp.types import Tool, TextContent
except ImportError:
    # Fallback for older MCP versions
    from mcp.server import Server
    from mcp.types import Tool, TextContent

# HTTP client
import httpx

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# =============================================================================
# Hugging Face Client with Retry Logic
# =============================================================================

class HuggingFaceClient:
    """HTTP client for Hugging Face API with retry logic and error handling."""

    def __init__(self, token: Optional[str] = None):
        """
        Initialize Hugging Face client.

        Args:
            token: Hugging Face API token (defaults to HF_TOKEN env var)
        """
        self.token = token or os.getenv("HF_TOKEN", "")
        self.base_url = "https://huggingface.co/api"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        } if self.token else {
            "Content-Type": "application/json"
        }

    async def _request_with_retry(
        self,
        method: str,
        endpoint: str,
        max_retries: int = 3,
        base_delay: float = 1.0,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Make HTTP request with exponential backoff retry.

        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint path
            max_retries: Maximum number of retry attempts
            base_delay: Base delay in seconds for exponential backoff
            **kwargs: Additional arguments for httpx

        Returns:
            Response JSON as dictionary

        Raises:
            httpx.HTTPError: If all retries fail
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        last_error = None

        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.request(
                        method,
                        url,
                        headers=self.headers,
                        **kwargs
                    )
                    response.raise_for_status()

                    # Return JSON for successful requests
                    if response.status_code == 204:  # No Content
                        return {}
                    return response.json()

            except httpx.HTTPStatusError as e:
                last_error = e
                # Don't retry client errors (4xx)
                if 400 <= e.response.status_code < 500:
                    logger.error(f"Client error {e.response.status_code}: {e.response.text}")
                    raise
                # Retry server errors (5xx) and rate limits (429)
                logger.warning(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    logger.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)

            except (httpx.TimeoutException, httpx.NetworkError) as e:
                last_error = e
                logger.warning(f"Attempt {attempt + 1}/{max_retries} failed: {e}")
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    logger.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)

        # All retries failed
        logger.error(f"All {max_retries} attempts failed")
        raise last_error

    # ========================================================================
    # Spaces Management
    # ========================================================================

    async def list_spaces(
        self,
        author: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """List all Spaces with optional filtering."""
        params = {"limit": limit}
        if author:
            params["author"] = author
        if search:
            params["search"] = search

        result = await self._request_with_retry("GET", "/spaces", params=params)
        return result if isinstance(result, list) else []

    async def get_space_info(self, space_id: str) -> Dict[str, Any]:
        """Get detailed information about a Space."""
        return await self._request_with_retry("GET", f"/spaces/{space_id}")

    async def create_space(
        self,
        space_id: str,
        sdk: str = "docker",
        hardware: str = "cpu-basic",
        private: bool = False,
        secrets: Optional[Dict[str, str]] = None,
        variables: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Create a new Hugging Face Space.

        Args:
            space_id: Space ID in format "username/space-name"
            sdk: SDK type (docker, gradio, streamlit, static)
            hardware: Hardware tier (cpu-basic, cpu-upgrade, t4-small, etc.)
            private: Whether space is private
            secrets: Optional dictionary of secrets
            variables: Optional dictionary of environment variables
        """
        parts = space_id.split("/")
        if len(parts) != 2:
            raise ValueError(f"Invalid space_id format. Expected 'username/space-name', got: {space_id}")

        username, name = parts

        payload = {
            "id": space_id,
            "sdk": sdk,
            "hardware": {"current": hardware},
            "private": private,
            "repo": {
                "type": "space",
                "name": name,
                "title": name.replace("-", " ").title(),
            }
        }

        result = await self._request_with_retry("POST", "/spaces/create", json=payload)

        # Set secrets if provided
        if secrets:
            await self._set_secrets(username, name, secrets)

        # Set variables if provided
        if variables:
            await self._set_variables(username, name, variables)

        return result

    async def delete_space(self, space_id: str) -> Dict[str, Any]:
        """Delete a Space."""
        return await self._request_with_retry("DELETE", f"/spaces/{space_id}")

    async def restart_space(self, space_id: str) -> Dict[str, Any]:
        """Restart a Space."""
        return await self._request_with_retry("POST", f"/spaces/{space_id}/restart")

    # ========================================================================
    # Repository Management
    # ========================================================================

    async def update_file(
        self,
        space_id: str,
        file_path: str,
        content: str,
        commit_message: str = "Update file"
    ) -> Dict[str, Any]:
        """
        Update or create a file in a Space repository.

        Args:
            space_id: Space ID in format "username/space-name"
            file_path: Path to the file in the repository
            content: File content
            commit_message: Git commit message
        """
        parts = space_id.split("/")
        if len(parts) != 2:
            raise ValueError(f"Invalid space_id format. Expected 'username/space-name', got: {space_id}")

        username, name = parts

        # Check if file exists first
        try:
            existing_file = await self._request_with_retry(
                "GET",
                f"/models/{username}/{name}/raw/main/{file_path}"
            )
            # File exists, get its SHA
            sha = existing_file.get("sha")
        except Exception:
            sha = None

        payload = {
            "message": commit_message,
            "content": content,
        }

        if sha:
            payload["sha"] = sha

        return await self._request_with_retry(
            "POST",
            f"/repos/{username}/{name}/contents/{file_path}",
            json=payload
        )

    async def get_file(self, space_id: str, file_path: str) -> Dict[str, Any]:
        """Get file content from a Space repository."""
        parts = space_id.split("/")
        username, name = parts[0], parts[1]

        return await self._request_with_retry(
            "GET",
            f"/repos/{username}/{name}/contents/{file_path}"
        )

    # ========================================================================
    # Secrets and Variables
    # ========================================================================

    async def _set_secrets(self, username: str, space_name: str, secrets: Dict[str, str]) -> None:
        """Set secrets for a Space (internal method)."""
        for key, value in secrets.items():
            await self._request_with_retry(
                "POST",
                f"/spaces/{username}/{space_name}/secrets",
                json={"key": key, "value": value}
            )

    async def _set_variables(
        self,
        username: str,
        space_name: str,
        variables: Dict[str, str]
    ) -> None:
        """Set environment variables for a Space (internal method)."""
        # Variables are typically set via README.md or .env file
        # For now, we'll update the README with environment variables section
        try:
            existing_readme = await self._request_with_retry(
                "GET",
                f"/repos/{username}/{space_name}/contents/README.md"
            )
            # TODO: Parse and update README with variables
        except Exception as e:
            logger.warning(f"Could not update README with variables: {e}")

    # ========================================================================
    # Monitoring and Logs
    # ========================================================================

    async def get_space_logs(
        self,
        space_id: str,
        lines: int = 100
    ) -> Dict[str, Any]:
        """Get logs from a Space."""
        return await self._request_with_retry(
            "GET",
            f"/spaces/{space_id}/logs",
            params={"lines": lines}
        )

    async def get_space_runtime(self, space_id: str) -> Dict[str, Any]:
        """Get runtime information for a Space."""
        return await self._request_with_retry("GET", f"/spaces/{space_id}/runtime")

    async def wait_for_space_ready(
        self,
        space_id: str,
        timeout: int = 600,
        poll_interval: int = 10
    ) -> Dict[str, Any]:
        """
        Wait for a Space to be in RUNNING state.

        Args:
            space_id: Space ID in format "username/space-name"
            timeout: Maximum time to wait in seconds
            poll_interval: Time between polls in seconds
        """
        start_time = time.time()

        while time.time() - start_time < timeout:
            runtime = await self.get_space_runtime(space_id)
            state = runtime.get("state", "UNKNOWN")

            if state == "RUNNING":
                logger.info(f"Space {space_id} is running!")
                return runtime
            elif state in ["STOPPED", "ERROR"]:
                raise RuntimeError(f"Space {space_id} is in {state} state")

            logger.info(f"Space {space_id} status: {state}. Waiting...")
            await asyncio.sleep(poll_interval)

        raise TimeoutError(f"Space {space_id} did not become ready within {timeout} seconds")

    # ========================================================================
    # Health Checks
    # ========================================================================

    async def check_space_health(self, space_url: str) -> Dict[str, Any]:
        """
        Check if a Space is healthy by checking its HTTP endpoint.

        Args:
            space_url: Full URL of the Space (e.g., https://huggingface.co/spaces/username/space-name)
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(space_url)
                response.raise_for_status()

                return {
                    "status": "healthy",
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds(),
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# =============================================================================
# MCP Server Instance
# =============================================================================

# Global client instance
_client: Optional[HuggingFaceClient] = None

def get_client() -> HuggingFaceClient:
    """Get or create the Hugging Face client singleton."""
    global _client
    if _client is None:
        _client = HuggingFaceClient()
    return _client

# Create MCP server
server = Server("huggingface-spaces")

# =============================================================================
# MCP Tools Registration
# =============================================================================

@server.list_tools()
async def list_tools() -> List[Tool]:
    """List all available MCP tools."""
    tools = [
        Tool(
            name="list_spaces",
            description="List all Hugging Face Spaces with optional filtering by author or search term",
            inputSchema={
                "type": "object",
                "properties": {
                    "author": {
                        "type": "string",
                        "description": "Filter by username/organization"
                    },
                    "search": {
                        "type": "string",
                        "description": "Search term for space names"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results (default: 100)",
                        "default": 100
                    }
                }
            }
        ),
        Tool(
            name="get_space_info",
            description="Get detailed information about a specific Hugging Face Space",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_id": {
                        "type": "string",
                        "description": "Space ID in format 'username/space-name'"
                    }
                },
                "required": ["space_id"]
            }
        ),
        Tool(
            name="create_space",
            description="Create a new Hugging Face Space with specified configuration",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_id": {
                        "type": "string",
                        "description": "Space ID in format 'username/space-name'"
                    },
                    "sdk": {
                        "type": "string",
                        "description": "SDK type: docker, gradio, streamlit, static",
                        "enum": ["docker", "gradio", "streamlit", "static"],
                        "default": "docker"
                    },
                    "hardware": {
                        "type": "string",
                        "description": "Hardware tier: cpu-basic, cpu-upgrade, t4-small, a10g-small, etc.",
                        "default": "cpu-basic"
                    },
                    "private": {
                        "type": "boolean",
                        "description": "Whether the space is private",
                        "default": False
                    }
                },
                "required": ["space_id"]
            }
        ),
        Tool(
            name="delete_space",
            description="Delete a Hugging Face Space (cannot be undone)",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_id": {
                        "type": "string",
                        "description": "Space ID in format 'username/space-name'"
                    }
                },
                "required": ["space_id"]
            }
        ),
        Tool(
            name="restart_space",
            description="Restart a Hugging Face Space",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_id": {
                        "type": "string",
                        "description": "Space ID in format 'username/space-name'"
                    }
                },
                "required": ["space_id"]
            }
        ),
        Tool(
            name="update_file",
            description="Update or create a file in a Space repository via Git API",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_id": {
                        "type": "string",
                        "description": "Space ID in format 'username/space-name'"
                    },
                    "file_path": {
                        "type": "string",
                        "description": "Path to the file in the repository (e.g., 'app.py', 'README.md')"
                    },
                    "content": {
                        "type": "string",
                        "description": "File content"
                    },
                    "commit_message": {
                        "type": "string",
                        "description": "Git commit message",
                        "default": "Update file"
                    }
                },
                "required": ["space_id", "file_path", "content"]
            }
        ),
        Tool(
            name="get_file",
            description="Get file content from a Space repository",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_id": {
                        "type": "string",
                        "description": "Space ID in format 'username/space-name'"
                    },
                    "file_path": {
                        "type": "string",
                        "description": "Path to the file in the repository"
                    }
                },
                "required": ["space_id", "file_path"]
            }
        ),
        Tool(
            name="get_space_logs",
            description="Get recent logs from a Space for debugging",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_id": {
                        "type": "string",
                        "description": "Space ID in format 'username/space-name'"
                    },
                    "lines": {
                        "type": "integer",
                        "description": "Number of log lines to retrieve (default: 100)",
                        "default": 100
                    }
                },
                "required": ["space_id"]
            }
        ),
        Tool(
            name="get_space_runtime",
            description="Get runtime information including state, hardware, and stage for a Space",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_id": {
                        "type": "string",
                        "description": "Space ID in format 'username/space-name'"
                    }
                },
                "required": ["space_id"]
            }
        ),
        Tool(
            name="wait_for_space_ready",
            description="Wait for a Space to be in RUNNING state, useful for deployment automation",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_id": {
                        "type": "string",
                        "description": "Space ID in format 'username/space-name'"
                    },
                    "timeout": {
                        "type": "integer",
                        "description": "Maximum wait time in seconds (default: 600)",
                        "default": 600
                    },
                    "poll_interval": {
                        "type": "integer",
                        "description": "Time between status checks in seconds (default: 10)",
                        "default": 10
                    }
                },
                "required": ["space_id"]
            }
        ),
        Tool(
            name="check_space_health",
            description="Check if a Space is healthy by making HTTP request to its URL",
            inputSchema={
                "type": "object",
                "properties": {
                    "space_url": {
                        "type": "string",
                        "description": "Full URL of the Space (e.g., https://huggingface.co/spaces/username/space-name)"
                    }
                },
                "required": ["space_url"]
            }
        ),
        Tool(
            name="get_username",
            description="Get the authenticated user's username from Hugging Face",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
    ]
    return tools


# =============================================================================
# MCP Tool Call Handlers
# =============================================================================

@server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Handle tool calls from MCP client."""
    client = get_client()

    try:
        if name == "list_spaces":
            result = await client.list_spaces(
                author=arguments.get("author"),
                search=arguments.get("search"),
                limit=arguments.get("limit", 100)
            )
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "get_space_info":
            result = await client.get_space_info(arguments["space_id"])
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "create_space":
            result = await client.create_space(
                space_id=arguments["space_id"],
                sdk=arguments.get("sdk", "docker"),
                hardware=arguments.get("hardware", "cpu-basic"),
                private=arguments.get("private", False)
            )
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "delete_space":
            result = await client.delete_space(arguments["space_id"])
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "restart_space":
            result = await client.restart_space(arguments["space_id"])
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "update_file":
            result = await client.update_file(
                space_id=arguments["space_id"],
                file_path=arguments["file_path"],
                content=arguments["content"],
                commit_message=arguments.get("commit_message", "Update file")
            )
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "get_file":
            result = await client.get_file(
                space_id=arguments["space_id"],
                file_path=arguments["file_path"]
            )
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "get_space_logs":
            result = await client.get_space_logs(
                space_id=arguments["space_id"],
                lines=arguments.get("lines", 100)
            )
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "get_space_runtime":
            result = await client.get_space_runtime(arguments["space_id"])
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "wait_for_space_ready":
            result = await client.wait_for_space_ready(
                space_id=arguments["space_id"],
                timeout=arguments.get("timeout", 600),
                poll_interval=arguments.get("poll_interval", 10)
            )
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "check_space_health":
            result = await client.check_space_health(arguments["space_url"])
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        elif name == "get_username":
            # Get user info from Hugging Face
            result = await client._request_with_retry("GET", "/whoami-v2")
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2, default=str)
            )]

        else:
            return [TextContent(
                type="text",
                text=f"Unknown tool: {name}"
            )]

    except Exception as e:
        logger.exception(f"Error calling tool {name}: {e}")
        return [TextContent(
            type="text",
            text=json.dumps({
                "error": str(e),
                "type": type(e).__name__
            }, indent=2)
        )]


# =============================================================================
# Main Entry Point
# =============================================================================

async def main():
    """Main entry point for the MCP server."""
    # Check for HF_TOKEN
    if not os.getenv("HF_TOKEN"):
        logger.warning("HF_TOKEN environment variable not set")

    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="huggingface-spaces",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={}
                )
            )
        )


if __name__ == "__main__":
    asyncio.run(main())
