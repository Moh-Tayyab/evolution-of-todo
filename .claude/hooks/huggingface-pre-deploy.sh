#!/bin/bash
#
# Hugging Face Spaces Pre-Deployment Hook
# Validates environment and code before deployment
#
# Usage: ./.claude/hooks/huggingface-pre-deploy.sh
#
# Exit codes:
#   0 - All checks passed, ready to deploy
#   1 - Critical check failed, abort deployment
#   2 - Warning issued, deployment may proceed with caution
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOYMENT_DIR="${PROJECT_ROOT}/huggingface"

echo -e "${BLUE}=== Hugging Face Pre-Deployment Check ===${NC}\n"

# ============================================================================
# Check Functions
# ============================================================================

check_huggingface_token() {
    echo -e "${BLUE}[1/7] Checking Hugging Face Token...${NC}"

    if [ -z "${HF_TOKEN:-}" ]; then
        echo -e "${RED}✗ HF_TOKEN environment variable not set${NC}"
        echo -e "  Get your token from: https://huggingface.co/settings/tokens"
        echo -e "  Then run: export HF_TOKEN=hf_xxxxxxxxxxxxxx"
        return 1
    fi

    # Validate token format
    if [[ ! "$HF_TOKEN" =~ ^hf_[a-zA-Z0-9]{30,}$ ]]; then
        echo -e "${YELLOW}⚠ HF_TOKEN format may be invalid${NC}"
        echo -e "  Expected format: hf_xxxxxxxxxxxxxx"
    fi

    echo -e "${GREEN}✓ HF_TOKEN is set${NC}"
    return 0
}

check_deployment_folder() {
    echo -e "\n${BLUE}[2/7] Checking Deployment Folder...${NC}"

    if [ ! -d "$DEPLOYMENT_DIR" ]; then
        echo -e "${RED}✗ Deployment folder not found: $DEPLOYMENT_DIR${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ Deployment folder exists${NC}"
    return 0
}

check_dockerfile() {
    echo -e "\n${BLUE}[3/7] Checking Dockerfile...${NC}"

    DOCKERFILE="${DEPLOYMENT_DIR}/Dockerfile"
    if [ ! -f "$DOCKERFILE" ]; then
        echo -e "${RED}✗ Dockerfile not found${NC}"
        return 1
    fi

    # Check for critical Dockerfile elements
    if ! grep -q "FROM.*python" "$DOCKERFILE"; then
        echo -e "${RED}✗ Dockerfile missing FROM instruction for Python${NC}"
        return 1
    fi

    if ! grep -q "EXPOSE 7860" "$DOCKERFILE"; then
        echo -e "${YELLOW}⚠ Dockerfile missing EXPOSE 7860 (Hugging Face standard port)${NC}"
    fi

    echo -e "${GREEN}✓ Dockerfile exists and appears valid${NC}"
    return 0
}

check_requirements() {
    echo -e "\n${BLUE}[4/7] Checking requirements.txt...${NC}"

    REQUIREMENTS="${DEPLOYMENT_DIR}/requirements.txt"
    if [ ! -f "$REQUIREMENTS" ]; then
        echo -e "${RED}✗ requirements.txt not found${NC}"
        return 1
    fi

    # Check for critical dependencies
    CRITICAL_DEPS=("fastapi" "uvicorn" "sqlmodel")
    for dep in "${CRITICAL_DEPS[@]}"; do
        if ! grep -qi "$dep" "$REQUIREMENTS"; then
            echo -e "${YELLOW}⚠ Missing critical dependency: $dep${NC}"
        fi
    done

    echo -e "${GREEN}✓ requirements.txt exists${NC}"
    return 0
}

check_source_code() {
    echo -e "\n${BLUE}[5/7] Checking Source Code...${NC}"

    SRC_DIR="${DEPLOYMENT_DIR}/src"
    if [ ! -d "$SRC_DIR" ]; then
        echo -e "${RED}✗ src/ directory not found in deployment folder${NC}"
        return 1
    fi

    # Check for main.py
    if [ ! -f "${SRC_DIR}/main.py" ]; then
        echo -e "${RED}✗ src/main.py not found${NC}"
        return 1
    fi

    echo -e "${GREEN}✓ Source code structure valid${NC}"
    return 0
}

check_readme() {
    echo -e "\n${BLUE}[6/7] Checking README.md...${NC}"

    README="${DEPLOYMENT_DIR}/README.md"
    if [ ! -f "$README" ]; then
        echo -e "${YELLOW}⚠ README.md not found (recommended for Hugging Face Spaces)${NC}"
        return 0
    fi

    # Check for Space metadata
    if ! grep -q "^---" "$README"; then
        echo -e "${YELLOW}⚠ README.md missing Hugging Face Space metadata${NC}"
        echo -e "  Consider adding YAML frontmatter with title, sdk, etc."
    fi

    echo -e "${GREEN}✓ README.md exists${NC}"
    return 0
}

check_environment_file() {
    echo -e "\n${BLUE}[7/7] Checking .env File...${NC}"

    ENV_FILE="${DEPLOYMENT_DIR}/.env"
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}⚠ .env file not found${NC}"
        echo -e "  Note: For production, set secrets in Space settings, not .env"
        return 0
    fi

    # Check for required environment variables
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET")
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            echo -e "${YELLOW}⚠ Missing environment variable: $var${NC}"
        fi
    done

    echo -e "${GREEN}✓ .env file exists${NC}"
    return 0
}

print_summary() {
    echo -e "\n${BLUE}=== Pre-Deployment Summary ===${NC}"
    echo -e "Deployment Folder: ${DEPLOYMENT_DIR}"
    echo -e "HF Token: ${HF_TOKEN:0:10}...${HF_TOKEN: -4}"
    echo -e "\nNext Steps:"
    echo -e "  1. Create Space on Hugging Face (or use existing)"
    echo -e "  2. Push code: git push huggingface main"
    echo -e "  3. Monitor build: Check Space logs on Hugging Face"
    echo -e "\n${GREEN}✓ Pre-deployment checks complete! Ready to deploy.${NC}\n"
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    local exit_code=0

    # Run all checks
    check_huggingface_token || exit_code=1
    check_deployment_folder || exit_code=1
    check_dockerfile || exit_code=1
    check_requirements || exit_code=1
    check_source_code || exit_code=1
    check_readme || true
    check_environment_file || true

    if [ $exit_code -eq 0 ]; then
        print_summary
    else
        echo -e "\n${RED}✗ Pre-deployment checks failed!${NC}"
        echo -e "Please fix the errors above before deploying.\n"
        exit 1
    fi

    exit $exit_code
}

# Run main function
main "$@"
