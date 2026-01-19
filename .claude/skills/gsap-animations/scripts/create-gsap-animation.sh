#!/usr/bin/env bash
#
# GSAP Animation Component Generator
# This script generates a new GSAP animation component template
#
# Usage: ./create-gsap-animation.sh <ComponentName> [type]
#   type: timeline | scroll | hover | stagger (default: basic)
#
# Author: Evolution of Todo Project
# License: MIT
#

set -e

# Colors for output
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
    print_error "Component name is required"
    echo "Usage: $0 <ComponentName> [type]"
    exit 1
fi

COMPONENT_NAME=$1
ANIMATION_TYPE=${2:-basic}
COMPONENT_PASCAL=$(echo "$COMPONENT_NAME" | sed 's/\b\(.\)/\u\1/g' | sed 's/-//g')

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR/.."
ASSETS_DIR="$BASE_DIR/assets"
OUTPUT_FILE="$ASSETS_DIR/${COMPONENT_PASCAL}.tsx"

mkdir -p "$ASSETS_DIR"

# Generate component based on type
case "$ANIMATION_TYPE" in
    timeline)
        cat > "$OUTPUT_FILE" << 'TIMELINE_EOF'
"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"

interface Props {
    children?: React.ReactNode
    className?: string
}

export function COMPONENT_PASCAL({ children, className }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1, yoyo: true })

            tl.to(".box", { x: 100, duration: 1, ease: "power2.out" })
              .to(".box", { rotation: 360, duration: 1 })
              .to(".box", { scale: 1.5, duration: 0.5 })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className={className}>
            <div className="box">Animated Box</div>
        </div>
    )
}
TIMELINE_EOF
        ;;
    scroll)
        cat > "$OUTPUT_FILE" << 'SCROLL_EOF'
"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface Props {
    children?: React.ReactNode
    className?: string
}

export function COMPONENT_PASCAL({ children, className }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".scroll-element", {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    scrub: 1,
                },
                y: 100,
                opacity: 0,
                duration: 1,
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className={className}>
            <div className="scroll-element">Scroll to animate</div>
        </div>
    )
}
SCROLL_EOF
        ;;
    *)
        cat > "$OUTPUT_FILE" << 'BASIC_EOF'
"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"

interface Props {
    children?: React.ReactNode
    className?: string
}

export function COMPONENT_PASCAL({ children, className }: Props) {
    const boxRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        gsap.to(boxRef.current, {
            x: 100,
            rotation: 360,
            duration: 2,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
        })
    }, [])

    return (
        <div ref={boxRef} className={className}>
            {children || "Animated Content"}
        </div>
    )
}
BASIC_EOF
        ;;
esac

# Replace placeholder with actual component name
sed -i "s/COMPONENT_PASCAL/${COMPONENT_PASCAL}/g" "$OUTPUT_FILE"

chmod +x "$OUTPUT_FILE"
print_success "GSAP animation component created: $OUTPUT_FILE"
print_info "Animation type: $ANIMATION_TYPE"
