#!/usr/bin/env bash
#
# Aceternity UI Pattern Validation Script
# Validates component patterns against best practices
#
# Usage: ./validate-patterns.sh [component-path]
#
# Author: Evolution of Todo Project
# License: MIT
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ISSUES=0
WARNINGS=0
CHECKS=0

# Functions
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Aceternity UI Pattern Validator${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((ISSUES++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

check_file() {
    local file=$1
    ((CHECKS++))

    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi

    print_info "Checking: $file"

    # Check for "use client" directive
    if grep -q '"use client"' "$file"; then
        print_success "Has 'use client' directive"
    else
        print_warning "Missing 'use client' directive"
    fi

    # Check for TypeScript interfaces
    if grep -q 'interface.*Props' "$file"; then
        print_success "Defines Props interface"
    fi

    # Check for className prop
    if grep -q 'className' "$file"; then
        print_success "Accepts className prop"
    fi

    # Check for motion component (Framer Motion)
    if grep -q 'from "framer-motion"' "$file" || grep -q "from 'framer-motion'" "$file"; then
        print_success "Uses Framer Motion"
    fi

    # Check for cn utility
    if grep -q 'cn(' "$file"; then
        print_success "Uses cn utility for className merging"
    fi

    echo ""
}

validate_directory() {
    local dir=$1
    print_info "Scanning directory: $dir"
    echo ""

    if [ ! -d "$dir" ]; then
        print_error "Directory not found: $dir"
        exit 1
    fi

    # Find all TSX files
    local files=($(find "$dir" -name "*.tsx" -o -name "*.ts"))

    if [ ${#files[@]} -eq 0 ]; then
        print_warning "No TypeScript files found"
        return
    fi

    print_info "Found ${#files[@]} TypeScript files"
    echo ""

    for file in "${files[@]}"; do
        check_file "$file"
    done
}

print_summary() {
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Validation Summary${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "Checks performed: ${GREEN}$CHECKS${NC}"
    echo -e "Issues found: ${RED}$ISSUES${NC}"
    echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
    echo ""

    if [ $ISSUES -eq 0 ]; then
        print_success "All checks passed!"
        exit 0
    else
        print_error "Validation failed with $ISSUES issue(s)"
        exit 1
    fi
}

# Main execution
print_header

if [ -z "$1" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    ASSETS_DIR="$SCRIPT_DIR/../assets"
    validate_directory "$ASSETS_DIR"
else
    if [ -f "$1" ]; then
        check_file "$1"
    else
        validate_directory "$1"
    fi
fi

print_summary
