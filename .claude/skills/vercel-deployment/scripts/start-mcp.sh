#!/bin/bash
# Vercel MCP Server Startup Script
# @spec: .claude/skills/vercel-deployment/SKILL.md
#
# Starts the Vercel MCP server with proper environment and dependencies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    log_error "VERCEL_TOKEN environment variable is not set"
    log_info "Get your token from: https://vercel.com/account/tokens"
    log_info "Then set it with: export VERCEL_TOKEN=your_token_here"
    exit 1
fi

log_success "VERCEL_TOKEN is configured"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    log_error "Python 3 is required but not installed"
    exit 1
fi

log_success "Python 3 is available: $(python3 --version)"

# Check dependencies
log_info "Checking Python dependencies..."

MISSING_DEPS=()

# Check fastmcp
if ! python3 -c "import fastmcp" 2>/dev/null; then
    MISSING_DEPS+=("fastmcp")
fi

# Check httpx
if ! python3 -c "import httpx" 2>/dev/null; then
    MISSING_DEPS+=("httpx")
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    log_warning "Missing dependencies: ${MISSING_DEPS[*]}"
    log_info "Installing missing dependencies..."
    pip install -q "${MISSING_DEPS[@]}"
    log_success "Dependencies installed"
fi

log_success "All dependencies are installed"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_SERVER="$SCRIPT_DIR/../mcp-server.py"

# Check if MCP server file exists
if [ ! -f "$MCP_SERVER" ]; then
    log_error "MCP server file not found: $MCP_SERVER"
    exit 1
fi

log_success "MCP server file found"
log_info "Starting Vercel MCP server..."
log_info "Server path: $MCP_SERVER"
echo ""

# Start the MCP server
python3 "$MCP_SERVER"
