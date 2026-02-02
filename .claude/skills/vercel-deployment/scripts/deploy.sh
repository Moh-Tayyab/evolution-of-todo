#!/bin/bash
# Vercel Deployment Script
# @spec: .claude/skills/vercel-deployment/SKILL.md
#
# Usage:
#   ./scripts/deploy.sh              # Deploy to preview
#   ./scripts/deploy.sh prod         # Deploy to production
#   ./scripts/deploy.sh prebuilt     # Deploy prebuilt artifacts
#   ./scripts/deploy.sh rollback     # Rollback to previous deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="${PROJECT_DIR:-frontend}"
PROJECT_NAME="${PROJECT_NAME:-evolution-of-todo}"
ENVIRONMENT="${1:-preview}"

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

check_vercel_cli() {
    log_info "Checking Vercel CLI installation..."
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI not found. Installing..."
        npm install --global vercel@latest
        log_success "Vercel CLI installed successfully"
    else
        log_success "Vercel CLI is already installed"
    fi
}

check_auth() {
    log_info "Checking Vercel authentication..."
    if ! vercel whoami &> /dev/null; then
        log_warning "Not authenticated with Vercel"
        log_info "Running: vercel login"
        vercel login
    else
        log_success "Already authenticated with Vercel"
    fi
}

deploy_production() {
    log_info "Deploying to PRODUCTION..."
    cd "$PROJECT_DIR"

    # Check for vercel.json
    if [ ! -f "vercel.json" ]; then
        log_warning "No vercel.json found, using default configuration"
    fi

    # Deploy to production
    vercel --prod --name "$PROJECT_NAME"

    log_success "Production deployment completed!"
}

deploy_preview() {
    log_info "Deploying to PREVIEW..."
    cd "$PROJECT_DIR"

    vercel --name "$PROJECT_NAME"

    log_success "Preview deployment completed!"
}

deploy_prebuilt() {
    log_info "Building project locally..."
    cd "$PROJECT_DIR"

    # Build the project
    vercel build

    log_success "Build completed. Deploying prebuilt artifacts..."

    # Deploy prebuilt artifacts
    vercel deploy --prebuilt

    log_success "Prebuilt deployment completed!"
}

rollback_deployment() {
    log_info "Fetching recent deployments..."

    # Get recent deployments
    deployments=$(vercel ls --no-json 2>&1 | head -10)

    if [ -z "$deployments" ]; then
        log_error "No deployments found"
        exit 1
    fi

    echo "$deployments"
    echo ""

    # Ask for deployment URL to rollback to
    read -p "Enter deployment URL to rollback to: " deployment_url

    if [ -z "$deployment_url" ]; then
        log_error "Deployment URL is required"
        exit 1
    fi

    log_info "Rolling back to $deployment_url..."
    vercel rollback "$deployment_url"

    log_success "Rollback completed!"
}

list_deployments() {
    log_info "Fetching deployment list..."
    vercel ls
}

show_env() {
    log_info "Fetching environment variables..."
    cd "$PROJECT_DIR"
    vercel env ls
}

setup_env() {
    log_info "Setting up environment variables..."
    cd "$PROJECT_DIR"

    if [ -f ".env.example" ]; then
        log_info "Found .env.example"
        cat .env.example
    else
        log_warning "No .env.example found"
    fi

    echo ""
    log_info "To add environment variables, use:"
    echo "  vercel env add KEY_NAME value [production|preview|development]"
}

# Main script logic
case "${ENVIRONMENT}" in
    prod|production)
        check_vercel_cli
        check_auth
        deploy_production
        ;;
    prebuilt)
        check_vercel_cli
        check_auth
        deploy_prebuilt
        ;;
    rollback)
        check_vercel_cli
        check_auth
        rollback_deployment
        ;;
    list)
        check_vercel_cli
        list_deployments
        ;;
    env)
        show_env
        ;;
    setup-env)
        setup_env
        ;;
    *)
        echo "Vercel Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (preview)       Deploy to preview environment (default)"
        echo "  prod|production  Deploy to production environment"
        echo "  prebuilt         Build locally and deploy prebuilt artifacts"
        echo "  rollback         Rollback to previous deployment"
        echo "  list             List recent deployments"
        echo "  env              Show environment variables"
        echo "  setup-env        Show environment setup instructions"
        echo ""
        echo "Examples:"
        echo "  $0                # Deploy to preview"
        echo "  $0 prod          # Deploy to production"
        echo "  $0 prebuilt      # Build and deploy prebuilt"
        echo "  $0 rollback      # Interactive rollback"
        echo ""
        exit 0
        ;;
esac
