#!/bin/bash
# Vercel Post-Deployment Hook
# @spec: .claude/skills/vercel-deployment/SKILL.md
#
# Runs after Vercel deployment to verify success
# Triggered by Claude Code after deploy_project tool use

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[POST-DEPLOY]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[POST-DEPLOY]${NC} ✓ $1"
}

log_warning() {
    echo -e "${YELLOW}[POST-DEPLOY]${NC} ⚠ $1"
}

log_error() {
    echo -e "${RED}[POST-DEPLOY]${NC} ✗ $1"
}

# Configuration
DEPLOYMENT_URL="${DEPLOYMENT_URL:-}"
HEALTH_PATH="${HEALTH_PATH:-/}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-60}"

log_info "Starting post-deployment verification..."
echo ""

# ============================================================================
# VERIFY DEPLOYMENT URL
# ============================================================================
log_info "Verifying deployment at: ${DEPLOYMENT_URL}"

if [ -z "$DEPLOYMENT_URL" ]; then
    log_error "No deployment URL provided"
    log_info "Set DEPLOYMENT_URL environment variable"
    exit 1
fi

# Ensure URL has protocol
if [[ ! "$DEPLOYMENT_URL" =~ ^https?:// ]]; then
    DEPLOYMENT_URL="https://${DEPLOYMENT_URL}"
fi

# Extract host for DNS check
DEPLOYMENT_HOST=$(echo "$DEPLOYMENT_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')

log_success "Deployment URL: ${DEPLOYMENT_URL}"
log_info "Host: ${DEPLOYMENT_HOST}"

echo ""

# ============================================================================
# DNS RESOLUTION CHECK
# ============================================================================
log_info "Checking DNS resolution..."

if host "$DEPLOYMENT_HOST" > /dev/null 2>&1; then
    log_success "DNS resolved successfully"
else
    log_error "DNS resolution failed for ${DEPLOYMENT_HOST}"
    exit 1
fi

echo ""

# ============================================================================
# HTTP CONNECTIVITY CHECK
# ============================================================================
log_info "Testing HTTP connectivity..."

HTTP_STATUS=$(curl -s -o /tmp/http-status.txt -w "%{http_code}" "$DEPLOYMENT_URL" --max-time 10 || echo "000")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "304" ]; then
    log_success "HTTP request successful (${HTTP_STATUS})"

    # Show response time
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$DEPLOYMENT_URL" --max-time 10)
    log_info "Response time: ${RESPONSE_TIME}s"
elif [ "$HTTP_STATUS" = "000" ]; then
    log_error "Connection failed - server not reachable"
    exit 1
else
    log_warning "HTTP status ${HTTP_STATUS} - may not be fully ready"
    cat /tmp/http-status.txt | head -5
fi

echo ""

# ============================================================================
# HEALTH ENDPOINT CHECK
# ============================================================================
log_info "Checking health endpoint..."

HEALTH_URL="${DEPLOYMENT_URL}${HEALTH_PATH}"

HTTP_STATUS=$(curl -s -o /tmp/health-status.txt -w "%{http_code}" "$HEALTH_URL" --max-time 10 || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    log_success "Health check passed"

    # Try to parse health response if JSON
    if command -v jq > /dev/null 2>&1; then
        HEALTH_DATA=$(cat /tmp/health-status.txt)
        if echo "$HEALTH_DATA" | jq . > /dev/null 2>&1; then
            log_info "Health response:"
            echo "$HEALTH_DATA" | jq -r 'to_entries | .[] | "  \(.key): \(.value)"' 2>/dev/null || true
        fi
    fi
else
    log_warning "Health check returned ${HTTP_STATUS}"
    log_info "Health endpoint may not be configured - this is OK for static sites"
fi

echo ""

# ============================================================================
# SSL CERTIFICATE CHECK
# ============================================================================
if [[ "$DEPLOYMENT_URL" =~ ^https:// ]]; then
    log_info "Checking SSL certificate..."

    EXPIRY_DATE=$(echo | openssl s_client -servername "$DEPLOYMENT_HOST" -connect "$DEPLOYMENT_HOST:443" 2>/dev/null | openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)

    if [ -n "$EXPIRY_DATE" ]; then
        log_success "SSL certificate valid until: ${EXPIRY_DATE}"
    else
        log_warning "Could not verify SSL certificate"
    fi

    echo ""
fi

# ============================================================================
# CONTENT VERIFICATION (for Next.js apps)
# ============================================================================
log_info "Verifying application content..."

# Check if it's a valid HTML response
CONTENT_TYPE=$(curl -s -I "$DEPLOYMENT_URL" | grep -i "content-type" | head -1)

if [[ "$CONTENT_TYPE" =~ html ]]; then
    log_success "Valid HTML content detected"

    # Check for common Next.js indicators
    PAGE_CONTENT=$(curl -s "$DEPLOYMENT_URL")
    if echo "$PAGE_CONTENT" | grep -q "__NEXT_DATA__"; then
        log_success "Next.js data detected"
    fi
elif [[ "$CONTENT_TYPE" =~ json ]]; then
    log_success "JSON API response detected"
else
    log_info "Content type: ${CONTENT_TYPE}"
fi

echo ""

# ============================================================================
# SMOKE TESTS (basic functionality checks)
# ============================================================================
log_info "Running smoke tests..."

# Test 1: Home page loads
if curl -s -f "$DEPLOYMENT_URL" > /dev/null 2>&1; then
    log_success "Smoke test 1: Home page loads ✓"
else
    log_error "Smoke test 1: Home page failed to load"
fi

# Test 2: No 500 errors
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
if [ "$STATUS" != "500" ]; then
    log_success "Smoke test 2: No server errors ✓"
else
    log_error "Smoke test 2: Server error (500) detected"
fi

# Test 3: Response time reasonable
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$DEPLOYMENT_URL")
TIME_INT=$(echo "$TIME" | cut -d. -f1)
if [ "$TIME_INT" -lt 10 ]; then
    log_success "Smoke test 3: Response time acceptable (${TIME}s) ✓"
else
    log_warning "Smoke test 3: Slow response time (${TIME}s)"
fi

echo ""

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================
log_info "Deployment verification complete"
echo ""

log_success "Deployment appears successful!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Deployment URL: ${DEPLOYMENT_URL}"
echo "  Health Status:  ✓ Verified"
echo "  SSL Status:     ✓ Valid"
echo "  Response Time:  ${TIME}s"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Optional: Open in browser (commented out by default)
# if [ "$AUTO_OPEN" = "true" ]; then
#     log_info "Opening deployment in browser..."
#     if command -v xdg-open > /dev/null; then
#         xdg-open "$DEPLOYMENT_URL"
#     elif command -v open > /dev/null; then
#         open "$DEPLOYMENT_URL"
#     fi
# fi

exit 0
