#!/bin/bash
# Vercel Pre-Deployment Hook
# @spec: .claude/skills/vercel-deployment/SKILL.md
#
# Runs before Vercel deployment to ensure readiness
# Triggered by Claude Code before deploy_project tool use

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[PRE-DEPLOY]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PRE-DEPLOY]${NC} ✓ $1"
}

log_warning() {
    echo -e "${YELLOW}[PRE-DEPLOY]${NC} ⚠ $1"
}

log_error() {
    echo -e "${RED}[PRE-DEPLOY]${NC} ✗ $1"
}

# Configuration
PROJECT_DIR="${PROJECT_DIR:-frontend}"
PROJECT_NAME="${PROJECT_NAME:-evolution-of-todo}"

log_info "Starting pre-deployment checks for ${PROJECT_NAME}..."
echo ""

# Track failures
FAILURES=0
WARNINGS=0

# ============================================================================
# CHECK 1: Verify we're in a git repository
# ============================================================================
log_info "Checking git repository..."

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Not a git repository"
    FAILURES=$((FAILURES + 1))
else
    log_success "Git repository verified"

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Uncommitted changes detected:"
        git status --short
        WARNINGS=$((WARNINGS + 1))
    else
        log_success "Working directory clean"
    fi
fi

echo ""

# ============================================================================
# CHECK 2: Verify environment variables
# ============================================================================
log_info "Checking environment variables..."

if [ -z "$VERCEL_TOKEN" ]; then
    log_error "VERCEL_TOKEN not set"
    log_info "Set it with: export VERCEL_TOKEN=your_token"
    FAILURES=$((FAILURES + 1))
else
    log_success "VERCEL_TOKEN is configured"
fi

# Check for required env files in frontend
if [ -f "${PROJECT_DIR}/.env.local" ]; then
    log_success "Found .env.local in ${PROJECT_DIR}"
else
    log_warning "No .env.local found in ${PROJECT_DIR}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for production env file
if [ -f "${PROJECT_DIR}/.env.production" ]; then
    log_success "Found .env.production in ${PROJECT_DIR}"
else
    log_warning "No .env.production found - deployment may use default env vars"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================================================
# CHECK 3: Verify package.json exists
# ============================================================================
log_info "Checking package.json..."

if [ -f "${PROJECT_DIR}/package.json" ]; then
    log_success "package.json found"

    # Check for build script
    if grep -q '"build"' "${PROJECT_DIR}/package.json"; then
        log_success "Build script found"
    else
        log_error "No build script in package.json"
        FAILURES=$((FAILURES + 1))
    fi
else
    log_error "package.json not found in ${PROJECT_DIR}"
    FAILURES=$((FAILURES + 1))
fi

echo ""

# ============================================================================
# CHECK 4: Run tests (optional, skip with SKIP_TESTS=true)
# ============================================================================
if [ "$SKIP_TESTS" != "true" ]; then
    log_info "Running tests..."

    cd "$PROJECT_DIR"

    # Check if test script exists
    if grep -q '"test"' package.json; then
        if npm test -- --passWithNoTests > /tmp/pre-deploy-tests.log 2>&1; then
            log_success "Tests passed"
        else
            log_error "Tests failed"
            cat /tmp/pre-deploy-tests.log
            FAILURES=$((FAILURES + 1))
        fi
    else
        log_warning "No test script found - skipping tests"
        WARNINGS=$((WARNINGS + 1))
    fi

    cd - > /dev/null
else
    log_info "Tests skipped (SKIP_TESTS=true)"
fi

echo ""

# ============================================================================
# CHECK 5: Verify build works locally
# ============================================================================
log_info "Testing production build..."

cd "$PROJECT_DIR"

if npm run build > /tmp/pre-deploy-build.log 2>&1; then
    log_success "Production build successful"
else
    log_error "Production build failed"
    tail -20 /tmp/pre-deploy-build.log
    FAILURES=$((FAILURES + 1))
fi

cd - > /dev/null

echo ""

# ============================================================================
# CHECK 6: Check for deployment-blocking issues
# ============================================================================
log_info "Checking for common deployment issues..."

# Check for node_modules in .gitignore
if [ -f .gitignore ] && grep -q "node_modules" .gitignore; then
    log_success "node_modules in .gitignore"
else
    log_warning "node_modules not in .gitignore - deployment may be slow"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for vercel.json
if [ -f "${PROJECT_DIR}/vercel.json" ]; then
    log_success "vercel.json configuration found"
else
    log_warning "No vercel.json - using default configuration"
    WARNINGS=$((WARNINGS + 1))
fi

# Check bundle size estimation
if [ -d "${PROJECT_DIR}/.next" ]; then
    SIZE=$(du -sh "${PROJECT_DIR}/.next" | cut -f1)
    log_info "Build size: ${SIZE}"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================
log_info "Pre-deployment check complete"
echo ""

if [ $FAILURES -gt 0 ]; then
    log_error "FAILED: ${FAILURES} error(s) found"
    echo ""
    log_error "Deployment blocked - fix errors before deploying"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    log_warning "WARNING: ${WARNINGS} warning(s) found"
    echo ""
    log_info "You can proceed with deployment, but consider fixing warnings"
    echo ""
    exit 0
else
    log_success "All checks passed - ready to deploy!"
    echo ""
    exit 0
fi
