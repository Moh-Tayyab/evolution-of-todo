#!/usr/bin/env bash
#
# Cross-Platform Skill Creator
# Generates skill templates compatible with both Claude Code and Gemini
#
# Usage: ./create-cross-platform-skill.sh <skill-name>
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
    print_error "Skill name is required"
    echo "Usage: $0 <skill-name>"
    exit 1
fi

SKILL_NAME=$1
SKILL_KEBAB=$(echo "$SKILL_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
SKILL_TITLE=$(echo "$SKILL_NAME" | sed 's/\b\(.\)/\u\1/g')

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR/.."
OUTPUT_DIR="$BASE_DIR/../${SKILL_KEBAB}"
SKILL_FILE="$OUTPUT_DIR/SKILL.md"

# Create directory structure
mkdir -p "$OUTPUT_DIR"/{assets,scripts,references}

print_info "Creating cross-platform skill: $SKILL_TITLE"

# Create SKILL.md
cat > "$SKILL_FILE" << SKILL_EOF
---
name: $SKILL_KEBAB
version: 1.0.0
lastUpdated: $(date +%Y-%m-%d)
description: |
  Cross-platform skill compatible with both Claude Code and Gemini systems.
  Expert-level guidance for $SKILL_NAME related tasks.
model: sonnet
tools: [Read, Write, Edit, Bash, Grep, Glob]
author: Evolution of Todo Project
license: MIT
tags:
  - cross-platform
  - production
  - claude-code
  - gemini
---

# $SKILL_TITLE Skill

You are a **$SKILL_NAME specialist** with expertise in providing guidance that works seamlessly across both Claude Code and Gemini AI systems.

## When to Use This Skill

Use this skill when working on:
- **$SKILL_NAME tasks** - Primary skill area
- **Cross-platform patterns** - Solutions compatible with both platforms
- **Best practices** - Industry-standard approaches

## Examples

### Example 1: Basic Usage
\`\`\`typescript
// Cross-platform compatible example
const example = "Works on both Claude Code and Gemini";
\`\`\`

### Example 2: Advanced Pattern
\`\`\`typescript
// Advanced example with error handling
try {
  // Implementation
} catch (error) {
  // Handle error appropriately
}
\`\`\`

## Security Notes

When working with this skill, always ensure:
- **Input Validation** - Validate all user inputs
- **Secret Management** - Use environment variables
- **OWASP Top 10** - Follow security best practices

## Instructions

1. **Assess the Request** - Understand requirements
2. **Apply Expert Knowledge** - Use specialized expertise
3. **Implement Best Practices** - Follow established patterns
4. **Verify Cross-Platform Compatibility** - Ensure works on both systems

## Scope Boundaries

### You Handle
- Core $SKILL_NAME functionality
- Cross-platform compatible solutions
- Best practices and patterns

### You Don't Handle
- Platform-specific features (use platform-specific skills)
- Infrastructure concerns (use infrastructure skills)

## Cross-Platform Compatibility

This skill is designed to work identically on:
- **Claude Code**: Invoke via \`/$SKILL_KEBAB\` command
- **Gemini**: Invoke via \`@$SKILL_KEBAB\` mention

Both systems interpret this skill's instructions consistently.
SKILL_EOF

# Create references README
cat > "$OUTPUT_DIR/references/README.md" << REFS_EOF
# $SKILL_TITLE References

Official documentation and resources for $SKILL_NAME.

## Documentation Links

Add official documentation links here.

## Community Resources

Add community links, forums, and tutorials here.
REFS_EOF

# Create assets placeholder
cat > "$OUTPUT_DIR/assets/template.md" << ASSETS_EOF
# $SKILL_TITLE Assets

Templates and examples for $SKILL_NAME.

Add component templates, configuration files, and examples here.
ASSETS_EOF

# Create executable example script
cat > "$OUTPUT_DIR/scripts/example.sh" << 'SCRIPT_EOF'
#!/usr/bin/env bash
#
# Example script for this skill
#
set -e

echo "This is an example script"
SCRIPT_EOF
chmod +x "$OUTPUT_DIR/scripts/example.sh"

print_success "Created cross-platform skill structure:"
echo "  - $SKILL_FILE"
echo "  - $OUTPUT_DIR/references/"
echo "  - $OUTPUT_DIR/assets/"
echo "  - $OUTPUT_DIR/scripts/"
print_info "Next steps:"
echo "  1. Customize SKILL.md with specific expertise"
echo "  2. Add references to references/README.md"
echo "  3. Create templates in assets/"
echo "  4. Add automation scripts to scripts/"
