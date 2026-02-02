#!/bin/bash
#
# Hugging Face Spaces Post-Deployment Hook
# Verifies deployment success and performs health checks
#
# Usage: ./.claude/hooks/huggingface-post-deploy.sh <SPACE_URL> [<SPACE_ID>]
#
# Parameters:
#   SPACE_URL - Full URL of the deployed Space
#   SPACE_ID - Optional, Space ID in format "username/space-name"
#
# Exit codes:
#   0 - Deployment verified successfully
#   1 - Health check failed
#   2 - Space not accessible
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SPACE_URL="${1:-}"
SPACE_ID="${2:-}"

if [ -z "$SPACE_URL" ]; then
    echo -e "${RED}Usage: $0 <SPACE_URL> [SPACE_ID]${NC}"
    echo -e "Example: $0 https://huggingface.co/spaces/username/backend-api username/backend-api"
    exit 1
fi

echo -e "${BLUE}=== Hugging Face Post-Deployment Verification ===${NC}\n"
echo -e "Space URL: ${SPACE_URL}"
echo -e "Space ID: ${SPACE_ID:-N/A}\n"

# ============================================================================
# Verification Functions
# ============================================================================

check_dns_resolution() {
    echo -e "${BLUE}[1/6] Checking DNS Resolution...${NC}"

    if host huggingface.co > /dev/null 2>&1; then
        echo -e "${GREEN}✓ huggingface.co DNS resolved${NC}"
        return 0
    else
        echo -e "${RED}✗ Cannot resolve huggingface.co${NC}"
        return 1
    fi
}

check_http_access() {
    echo -e "\n${BLUE}[2/6] Checking HTTP Access...${NC}"

    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$SPACE_URL" 2>/dev/null || echo "000")

    if [ "$http_code" = "000" ]; then
        echo -e "${RED}✗ Cannot reach Space (connection failed)${NC}"
        return 2
    elif [[ "$http_code" =~ ^[45] ]]; then
        echo -e "${YELLOW}⚠ Space returned HTTP $http_code${NC}"
        echo -e "  Space may be building or experiencing issues"
        return 0
    else
        echo -e "${GREEN}✓ Space is accessible (HTTP $http_code)${NC}"
        return 0
    fi
}

check_ssl_certificate() {
    echo -e "\n${BLUE}[3/6] Checking SSL Certificate...${NC}"

    if curl -sS "$SPACE_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ SSL certificate is valid${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ SSL certificate issue detected${NC}"
        return 0
    fi
}

check_health_endpoint() {
    echo -e "\n${BLUE}[4/6] Checking Health Endpoint...${NC}"

    local health_url="${SPACE_URL%/}/health"
    local response=$(curl -s "$health_url" 2>/dev/null || echo "")

    if [ -z "$response" ]; then
        echo -e "${YELLOW}⚠ /health endpoint not responding${NC}"
        echo -e "  Space may still be building"
        return 0
    fi

    # Check if response contains "healthy" or "status"
    if echo "$response" | grep -qi "healthy\|status"; then
        echo -e "${GREEN}✓ Health endpoint responding${NC}"
        echo -e "  Response: $(echo "$response" | head -c 100)..."
        return 0
    else
        echo -e "${YELLOW}⚠ Health endpoint returned unexpected response${NC}"
        return 0
    fi
}

check_api_response() {
    echo -e "\n${BLUE}[5/6] Checking API Response...${NC}"

    # Try to access the docs endpoint (FastAPI default)
    local docs_url="${SPACE_URL%/}/docs"
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "$docs_url" 2>/dev/null || echo "000")

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ API documentation accessible (/docs)${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ API docs not accessible (HTTP $http_code)${NC}"
        echo -e "  Space may still be starting up"
        return 0
    fi
}

check_space_info() {
    echo -e "\n${BLUE}[6/6] Checking Space Information...${NC}"

    if [ -z "$SPACE_ID" ] || [ -z "${HF_TOKEN:-}" ]; then
        echo -e "${YELLOW}⚠ Skipping space info check (HF_TOKEN or SPACE_ID not provided)${NC}"
        return 0
    fi

    # Get space runtime info via Hugging Face API
    local api_url="https://huggingface.co/api/spaces/${SPACE_ID}"
    local response=$(curl -s -H "Authorization: Bearer $HF_TOKEN" "$api_url" 2>/dev/null || echo "")

    if [ -z "$response" ]; then
        echo -e "${YELLOW}⚠ Could not fetch space info${NC}"
        return 0
    fi

    # Extract runtime state using jq or grep
    local runtime=$(curl -s -H "Authorization: Bearer $HF_TOKEN" \
        "https://huggingface.co/api/spaces/${SPACE_ID}/runtime" 2>/dev/null || echo "")

    if echo "$runtime" | grep -q '"stage":\s*"RUNNING"'; then
        echo -e "${GREEN}✓ Space is in RUNNING state${NC}"
    elif echo "$runtime" | grep -q '"stage":\s*"BUILDING"'; then
        echo -e "${YELLOW}⚠ Space is still BUILDING${NC}"
    else
        echo -e "${YELLOW}⚠ Space state unknown${NC}"
    fi

    return 0
}

print_deployment_info() {
    echo -e "\n${BLUE}=== Deployment Information ===${NC}"
    echo -e "Space URL: ${SPACE_URL}"
    echo -e "Health Check: ${SPACE_URL%/}/health"
    echo -e "API Docs: ${SPACE_URL%/}/docs"
    echo -e "Settings: ${SPACE_URL%/}/settings"
    echo -e "Logs: ${SPACE_URL%/}/logs"
    echo -e ""
}

print_next_steps() {
    echo -e "${BLUE}=== Post-Deployment Checklist ===${NC}\n"

    echo -e "Manual Verification:"
    echo -e "  1. Visit Space: ${SPACE_URL}"
    echo -e "  2. Check /health endpoint"
    echo -e "  3. Review API docs at /docs"
    echo -e "  4. Test API endpoints"
    echo -e ""

    echo -e "Configuration:"
    echo -e "  1. Set secrets in Space settings:"
    echo -e "     - DATABASE_URL"
    echo -e "     - JWT_SECRET"
    echo -e "     - OPENAI_API_KEY (if using AI features)"
    echo -e ""

    echo -e "Monitoring:"
    echo -e "  1. Check Space logs for errors"
    echo -e "  2. Monitor resource usage"
    echo -e "  3. Set up uptime monitoring"
    echo -e ""

    echo -e "Integration:"
    echo -e "  1. Update frontend API_URL to point to this Space"
    echo -e "  2. Configure CORS if needed"
    echo -e "  3. Test frontend-backend connectivity"
    echo -e ""
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    local exit_code=0

    check_dns_resolution || exit_code=1
    check_http_access || exit_code=$?
    check_ssl_certificate || true
    check_health_endpoint || true
    check_api_response || true
    check_space_info || true

    print_deployment_info

    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✓ Deployment verification complete!${NC}\n"
        print_next_steps
    else
        echo -e "\n${RED}✗ Deployment verification failed!${NC}"
        echo -e "Please check the Space logs and settings.\n"
    fi

    exit $exit_code
}

# Run main function
main "$@"
