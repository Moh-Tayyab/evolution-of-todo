#!/usr/bin/env bash
#
# Aceternity UI Component Generator
# This script generates a new component template with best practices
#
# Usage: ./create-component.sh <ComponentName> [type]
#   type: button | card | input | modal | effect (default: component)
#
# Author: Evolution of Todo Project
# License: MIT
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if component name is provided
if [ -z "$1" ]; then
    print_error "Component name is required"
    echo "Usage: $0 <ComponentName> [type]"
    exit 1
fi

COMPONENT_NAME=$1
COMPONENT_TYPE=${2:-component}
COMPONENT_PASCAL=$(echo "$COMPONENT_NAME" | sed 's/\b\(.\)/\u\1/g' | sed 's/-//g')

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR/.."
ASSETS_DIR="$BASE_DIR/assets"
OUTPUT_FILE="$ASSETS_DIR/${COMPONENT_PASCAL}.tsx"

# Check if component already exists
if [ -f "$OUTPUT_FILE" ]; then
    print_error "Component already exists: $OUTPUT_FILE"
    exit 1
fi

# Create assets directory if it doesn't exist
mkdir -p "$ASSETS_DIR"

# Generate component template
cat > "$OUTPUT_FILE" << COMPONENT_EOF
"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ${COMPONENT_PASCAL}Props {
    className?: string
    children?: React.ReactNode
}

export function ${COMPONENT_PASCAL}({ className, children }: ${COMPONENT_PASCAL}Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "relative overflow-hidden",
                className
            )}
        >
            {children}
        </motion.div>
    )
}
COMPONENT_EOF

chmod +x "$OUTPUT_FILE"
print_success "Component template created: $OUTPUT_FILE"
print_info "Component type: $COMPONENT_TYPE"
print_info "Next steps:"
echo "  1. Customize the component for your needs"
echo "  2. Add to your component library"
echo "  3. Export from index.ts"
