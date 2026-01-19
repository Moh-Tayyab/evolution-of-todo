#!/usr/bin/env bash
#
# GSAP Animation Validation Script
# Validates GSAP components for best practices
#
# Usage: ./validate-gsap.sh [component-path]
#
# Author: Evolution of Todo Project
# License: MIT
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ISSUES=0
WARNINGS=0
CHECKS=0

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  GSAP Component Validator${NC}"
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

    print_info "Checking: $file"

    # Check for GSAP import
    if grep -q "from 'gsap'" "$file" || grep -q 'from "gsap"' "$file"; then
        print_success "Imports GSAP"
    else
        print_error "Missing GSAP import"
    fi

    # Check for useLayoutEffect (correct for GSAP)
    if grep -q 'useLayoutEffect' "$file"; then
        print_success "Uses useLayoutEffect (correct)"
    else
        print_warning "Consider using useLayoutEffect instead of useEffect"
    fi

    # Check for context cleanup
    if grep -q 'gsap.context' "$file"; then
        print_success "Uses gsap.context for cleanup"
    else
        print_warning "Missing gsap.context for proper cleanup"
    fi

    # Check for ScrollTrigger registration
    if grep -q 'ScrollTrigger' "$file"; then
        if grep -q 'gsap.registerPlugin(ScrollTrigger)' "$file"; then
            print_success "ScrollTrigger registered"
        else
            print_error "ScrollTrigger used but not registered"
        fi
    fi

    # Check for useRef for container
    if grep -q 'useRef' "$file"; then
        print_success "Uses useRef for DOM reference"
    fi

    echo ""
}

validate_directory() {
    local dir=$1
    print_info "Scanning directory: $dir"
    echo ""

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
}

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
