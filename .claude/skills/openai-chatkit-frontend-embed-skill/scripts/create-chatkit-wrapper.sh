#!/usr/bin/env bash
#
# ChatKit Wrapper Component Generator
# Generates React wrapper components for ChatKit UI
#
# Usage: ./create-chatkit-wrapper.sh <WrapperName>
#
# Author: Evolution of Todo Project
# License: MIT
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

if [ -z "$1" ]; then
    print_error "Wrapper name is required"
    echo "Usage: $0 <WrapperName>"
    exit 1
fi

WRAPPER_NAME=$1
WRAPPER_PASCAL=$(echo "$WRAPPER_NAME" | sed 's/\b\(.\)/\u\1/g' | sed 's/-//g')

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR/.."
ASSETS_DIR="$BASE_DIR/assets"
OUTPUT_FILE="$ASSETS_DIR/${WRAPPER_PASCAL}Wrapper.tsx"

mkdir -p "$ASSETS_DIR"

cat > "$OUTPUT_FILE" << 'WRAPPER_EOF'
"use client"

import { useState, useEffect } from "react"
import { ChatKit } from "@openai/chatkit"

interface WRAPPER_PASCALProps {
  className?: string
  onError?: (error: Error) => void
  onMessageSent?: (message: any) => void
  onMessageReceived?: (message: any) => void
}

/**
 * WRAPPER_PASCAL - A wrapper component for ChatKit UI
 *
 * This component provides a pre-configured ChatKit instance with:
 * - Authentication handling
 * - Error boundaries
 * - Event callbacks
 * - Custom styling options
 */
export function WRAPPER_PASCAL({
  className,
  onError,
  onMessageSent,
  onMessageReceived,
}: WRAPPER_PASCALProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem("auth_token")
    if (token) {
      setAuthToken(token)
      setIsAuthenticated(true)
    }
  }, [])

  // Authenticated fetch function
  const authenticatedFetch = async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      throw new Error("No authentication token found")
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
        "X-Domain-Key": process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || "",
      },
    })
  }

  if (!isAuthenticated) {
    return (
      <div className={className}>
        <p>Please log in to access the chat.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <ChatKit
        config={{
          api: {
            url: process.env.NEXT_PUBLIC_CHATKIT_URL || "/chatkit/api",
            fetch: authenticatedFetch,
          },
          theme: {
            mode: "auto",
            accentColor: "#6366f1",
          },
        }}
        onError={onError}
        onMessageSent={onMessageSent}
        onMessageReceived={onMessageReceived}
      />
    </div>
  )
}

// Usage example:
// import { WRAPPER_PASCAL } from './WRAPPER_PASCALWrapper'
//
// function App() {
//   return (
//     <WRAPPER_PASCAL
//       onError={(error) => console.error(error)}
//       onMessageSent={(msg) => console.log("Sent:", msg)}
//       onMessageReceived={(msg) => console.log("Received:", msg)}
//     />
//   )
// }
WRAPPER_EOF

# Replace placeholder with actual wrapper name
sed -i "s/WRAPPER_PASCAL/${WRAPPER_PASCAL}/g" "$OUTPUT_FILE"

print_success "ChatKit wrapper component created: $OUTPUT_FILE"
print_info "Next steps:"
echo "  1. Customize authentication logic"
echo "  2. Add error handling"
echo "  3. Configure theme options"
echo "  4. Import and use in your app"
