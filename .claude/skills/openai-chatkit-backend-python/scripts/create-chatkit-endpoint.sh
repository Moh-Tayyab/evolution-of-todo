#!/usr/bin/env bash
#
# ChatKit Endpoint Generator
# Generates ChatKit API endpoint templates for FastAPI backends
#
# Usage: ./create-chatkit-endpoint.sh <endpoint-name>
#
# Author: Evolution of Todo Project
# License: MIT
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

if [ -z "$1" ]; then
    print_error "Endpoint name is required"
    echo "Usage: $0 <endpoint-name>"
    exit 1
fi

ENDPOINT_NAME=$1
ENDPOINT_SNAKE=$(echo "$ENDPOINT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR/.."
ASSETS_DIR="$BASE_DIR/assets"
OUTPUT_FILE="$ASSETS_DIR/${ENDPOINT_SNAKE}_endpoint.py"

mkdir -p "$ASSETS_DIR"

cat > "$OUTPUT_FILE" << 'ENDPOINT_EOF'
"""
ChatKit API Endpoint: ENDPOINT_NAME

Generated template for ChatKit-compatible API endpoint.

Author: Evolution of Todo Project
License: MIT
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import AsyncGenerator, Optional
import json
import os

router = APIRouter()

# Request/Response Models
class ChatKitRequest(BaseModel):
    session_id: str
    messages: list[dict]
    context: Optional[dict] = None

# Authentication Dependency
async def verify_auth(request: Request) -> dict:
    """Verify JWT token and extract user context."""
    auth_header = request.headers.get("Authorization")
    domain_key = request.headers.get("X-Domain-Key")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")

    # Validate domain key
    expected_domain_key = os.getenv("CHATKIT_DOMAIN_KEY")
    if domain_key != expected_domain_key:
        raise HTTPException(status_code=403, detail="Invalid domain key")

    return {
        "user_id": "user-123",  # From JWT validation
        "session_id": request.headers.get("X-Session-ID", ""),
    }

# Chat Endpoint
@router.post("/chatkit/api")
async def chatkit_chat(
    request: ChatKitRequest,
    user_context: dict = Depends(verify_auth),
):
    """
    ChatKit-compatible chat endpoint with SSE streaming.
    """

    async def generate_response() -> AsyncGenerator[str, None]:
        """Stream response chunks in ChatKit format."""
        try:
            # Send start event
            yield f"data: {json.dumps({'type': 'response.start', 'data': {}})}\n\n"

            # TODO: Implement your agent logic here
            # This is where you'd integrate with OpenAI Agents SDK

            # Example response streaming
            response_text = "Hello! This is a response from the assistant."

            for word in response_text.split():
                chunk = {
                    "type": "response.delta",
                    "data": {"content": word + " ", "done": False}
                }
                yield f"data: {json.dumps(chunk)}\n\n"

            # Send completion event
            yield f"data: {json.dumps({'type': 'response.done', 'data': {}})}\n\n"

        except Exception as e:
            error_chunk = {
                "type": "error",
                "data": {"message": str(e), "code": "internal_error"}
            }
            yield f"data: {json.dumps(error_chunk)}\n\n"

    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# Upload Endpoint
@router.post("/chatkit/api/upload")
async def chatkit_upload(
    request: Request,
    user_context: dict = Depends(verify_auth),
):
    """Handle file uploads from ChatKit."""
    # TODO: Implement file upload logic
    return {
        "type": "upload.done",
        "data": {
            "file_id": "file-123",
            "url": "/uploads/file-123"
        }
    }

# Health Check
@router.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "chatkit-backend"}
ENDPOINT_EOF

# Replace placeholder with actual endpoint name
sed -i "s/ENDPOINT_NAME/${ENDPOINT_NAME}/g" "$OUTPUT_FILE"

print_success "ChatKit endpoint template created: $OUTPUT_FILE"
print_info "Next steps:"
echo "  1. Integrate with OpenAI Agents SDK"
echo "  2. Implement authentication logic"
echo "  3. Add file upload handling"
echo "  4. Test with ChatKit UI"
