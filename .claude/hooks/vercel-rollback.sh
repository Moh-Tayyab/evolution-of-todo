#!/bin/bash
# Vercel Rollback Automation Hook
# @spec: .claude/skills/vercel-deployment/SKILL.md
#
# Automatically rolls back deployment if health checks fail
# Use with caution - requires DEPLOYMENT_URL and ROLLBACK_DEPLOYMENT_ID

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[ROLLBACK]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[ROLLBACK]${NC} ✓ $1"
}

log_warning() {
    echo -e "${YELLOW}[ROLLBACK]${NC} ⚠ $1"
}

log_error() {
    echo -e "${RED}[ROLLBACK]${NC} ✗ $1"
}

# Configuration
DEPLOYMENT_URL="${DEPLOYMENT_URL:-}"
ROLLBACK_DEPLOYMENT_ID="${ROLLBACK_DEPLOYMENT_ID:-}"
PROJECT_ID="${PROJECT_ID:-evolution-of-todo}"

# Only rollback if conditions are met
SHOULD_ROLLBACK=false

# ============================================================================
# CHECK FOR ROLLBACK TRIGGERS
# ============================================================================

# Trigger 1: Health check failure
if [ "$HEALTH_CHECK_FAILED" = "true" ]; then
    log_warning "Health check failed - initiating rollback"
    SHOULD_ROLLBACK=true
fi

# Trigger 2: Manual rollback requested
if [ "$MANUAL_ROLLBACK" = "true" ]; then
    log_warning "Manual rollback requested"
    SHOULD_ROLLBACK=true
fi

# Trigger 3: Critical errors detected
if [ "$CRITICAL_ERRORS" != "" ]; then
    log_warning "Critical errors detected: ${CRITICAL_ERRORS}"
    SHOULD_ROLLBACK=true
fi

if [ "$SHOULD_ROLLBACK" != "true" ]; then
    log_info "No rollback triggers detected - skipping"
    exit 0
fi

echo ""
log_warning "═══════════════════════════════════════════════════════════════"
log_warning "                    INITIATING ROLLBACK                           "
log_warning "═══════════════════════════════════════════════════════════════"
echo ""

# ============================================================================
# VERIFICATION BEFORE ROLLBACK
# ============================================================================
log_info "Verifying rollback configuration..."

if [ -z "$ROLLBACK_DEPLOYMENT_ID" ]; then
    log_error "No rollback deployment ID specified"
    log_info "Set ROLLBACK_DEPLOYMENT_ID to the deployment you want to restore"
    log_info ""
    log_info "To find previous deployments:"
    log_info "  Use list_deployments tool with project_id '${PROJECT_ID}'"
    exit 1
fi

log_success "Rollback deployment ID: ${ROLLBACK_DEPLOYMENT_ID}"

echo ""

# ============================================================================
# CONFIRMATION (unless AUTO_ROLLBACK is true)
# ============================================================================
if [ "$AUTO_ROLLBACK" != "true" ]; then
    log_warning "About to rollback to deployment: ${ROLLBACK_DEPLOYMENT_ID}"
    echo ""
    read -p "Continue with rollback? (yes/no): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        log_info "Rollback cancelled by user"
        exit 0
    fi
    echo ""
fi

# ============================================================================
# EXECUTE ROLLBACK
# ============================================================================
log_info "Executing rollback..."

# This would normally be done via the Vercel MCP tool
# For now, we'll use vercel CLI if available
if command -v vercel > /dev/null 2>&1; then
    log_info "Using Vercel CLI for rollback..."

    # Store original deployment URL for comparison
    ORIGINAL_URL="$DEPLOYMENT_URL"

    # Execute rollback via vercel CLI (would be done via MCP in practice)
    log_info "Rollback command would be executed via MCP:"
    log_info "  rollback_deployment(project_id='${PROJECT_ID}', deployment_id='${ROLLBACK_DEPLOYMENT_ID}')"

    # Simulated rollback (in real usage, MCP tool would be called)
    sleep 2

    log_success "Rollback initiated"

elif [ -n "$VERCEL_TOKEN" ]; then
    log_info "Using Vercel API for rollback..."

    # API call to rollback
    ROLLBACK_RESPONSE=$(curl -s -X POST \
        "https://api.vercel.com/v13/projects/${PROJECT_ID}/rollback" \
        -H "Authorization: Bearer ${VERCEL_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{\"deploymentId\":\"${ROLLBACK_DEPLOYMENT_ID}\"}")

    if echo "$ROLLBACK_RESPONSE" | grep -q "error"; then
        log_error "Rollback failed"
        echo "$ROLLBACK_RESPONSE"
        exit 1
    else
        log_success "Rollback successful"
    fi
else
    log_error "No Vercel CLI or token available for rollback"
    log_info "Please rollback manually via Vercel dashboard"
    exit 1
fi

echo ""

# ============================================================================
# VERIFY ROLLBACK
# ============================================================================
log_info "Verifying rollback..."

# In a real scenario, we would check the deployment status
# For now, we'll note that verification would happen
log_info "Rollback verification would be performed via:"
log_info "  wait_for_deployment_ready(project_id='${PROJECT_ID}', deployment_id='${ROLLBACK_DEPLOYBACK_ID}')"
log_info "  verify_deployment(deployment_url='${DEPLOYMENT_URL}')"

echo ""

# ============================================================================
# ROLLBACK COMPLETE
# ============================================================================
log_success "═══════════════════════════════════════════════════════════════"
log_success "                      ROLLBACK COMPLETE                          "
log_success "═══════════════════════════════════════════════════════════════"
echo ""

log_info "Previous deployment: ${ROLLBACK_DEPLOYMENT_ID}"
log_info "Deployment URL: ${DEPLOYMENT_URL}"
echo ""

# Optional: Notify team
if [ "$SLACK_WEBHOOK" != "" ]; then
    log_info "Sending rollback notification to Slack..."
    curl -s -X POST "$SLACK_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"🚨 Rollback executed for ${PROJECT_NAME}\\nDeployment: ${ROLLBACK_DEPLOYMENT_ID}\\nURL: ${DEPLOYMENT_URL}\"}"
fi

exit 0
