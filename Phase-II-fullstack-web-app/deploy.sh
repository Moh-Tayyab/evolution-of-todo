#!/bin/bash
# Todo App Deployment Script
# Deploys frontend to Vercel and backend to Railway
#
# Usage:
#   ./deploy.sh --frontend    Deploy frontend only
#   ./deploy.sh --backend     Deploy backend only
#   ./deploy.sh --all         Deploy both
#   ./deploy.sh --setup       Setup environment files
#   ./deploy.sh --secrets     Generate secrets
#   ./deploy.sh --help        Show help
#
# IMPORTANT: Run 'chmod +x deploy.sh' before first use

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="/home/evolution-of-todo/Phase-II-fullstack-web-app"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Change to project root
cd "$PROJECT_ROOT"

echo "=========================================="
echo "  Todo App Deployment Script"
echo "=========================================="
echo ""

# Function to deploy frontend
deploy_frontend() {
    echo_info "Deploying frontend to Vercel..."
    echo ""

    cd "$FRONTEND_DIR"

    # Check if .env.local.production exists
    if [ ! -f ".env.local.production" ]; then
        echo_warn ".env.local.production not found, using example..."
        if [ -f ".env.local.example" ]; then
            cp ".env.local.example" ".env.local.production"
        fi
    fi

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo_info "Installing dependencies..."
        pnpm install
    else
        echo_info "Dependencies already installed"
    fi

    # Build the frontend
    echo_info "Building frontend for production..."
    pnpm build

    # Deploy to Vercel
    echo_info "Deploying to Vercel..."
    vercel --prod

    echo_info "Frontend deployment complete!"
}

# Function to deploy backend
deploy_backend() {
    echo_info "Deploying backend to Railway..."
    echo ""

    cd "$BACKEND_DIR"

    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        echo_warn ".env.production not found, using example..."
        if [ -f ".env.example" ]; then
            cp ".env.example" ".env.production"
        fi
    fi

    # Deploy to Railway
    echo_info "Deploying to Railway..."
    railway deploy

    echo_info "Backend deployment complete!"
}

# Function to setup environment
setup_env() {
    echo_info "Setting up environment files..."

    cd "$PROJECT_ROOT"

    # Frontend
    if [ -f "$FRONTEND_DIR/.env.local.production" ]; then
        echo_info "Frontend env file exists"
    else
        echo_warn "Create $FRONTEND_DIR/.env.local.production with:"
        echo "  NEXT_PUBLIC_API_URL=https://your-backend.railway.app"
        echo "  BETTER_AUTH_URL=https://your-frontend.vercel.app"
        echo "  NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app"
        echo "  BETTER_AUTH_SECRET=your-32-char-min-secret"
    fi

    # Backend
    if [ -f "$BACKEND_DIR/.env.production" ]; then
        echo_info "Backend env file exists"
    else
        echo_warn "Create $BACKEND_DIR/.env.production with:"
        echo "  DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb"
        echo "  JWT_SECRET=your-32-char-min-secret"
        echo "  BETTER_AUTH_URL=https://your-frontend.vercel.app"
    fi
}

# Function to generate secrets
generate_secrets() {
    echo_info "Generating secure secrets..."

    echo ""
    echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)"
    echo "JWT_SECRET=$(openssl rand -base64 32)"
    echo ""
    echo_info "Copy these to your environment files!"
}

# Main menu
show_menu() {
    echo "Options:"
    echo "  1) Setup environment files"
    echo "  2) Deploy frontend (Vercel)"
    echo "  3) Deploy backend (Railway)"
    echo "  4) Deploy all"
    echo "  5) Generate secrets"
    echo "  6) Exit"
    echo ""
    read -p "Select an option [1-6]: " choice
    echo ""
}

# Script entry point
main() {
    if [ $# -eq 0 ]; then
        # No arguments, show menu
        show_menu
        case $choice in
            1) setup_env ;;
            2) deploy_frontend ;;
            3) deploy_backend ;;
            4) deploy_backend && deploy_frontend ;;
            5) generate_secrets ;;
            6) echo_info "Exiting..." && exit 0 ;;
            *) echo_error "Invalid option" && exit 1 ;;
        esac
    else
        # Command line arguments
        case $1 in
            --frontend) deploy_frontend ;;
            --backend) deploy_backend ;;
            --all) deploy_backend && deploy_frontend ;;
            --setup) setup_env ;;
            --secrets) generate_secrets ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --frontend  Deploy frontend only"
                echo "  --backend   Deploy backend only"
                echo "  --all       Deploy frontend and backend"
                echo "  --setup     Setup environment files"
                echo "  --secrets   Generate secure secrets"
                echo "  --help      Show this help message"
                ;;
            *) echo_error "Unknown option: $1" && exit 1 ;;
        esac
    fi
}

main "$@"
