#!/bin/bash
# Prompt History Record Creator
# Usage: ./create-phr.sh --title "Title" --stage spec --feature feature-name

set -e

TITLE=""
STAGE=""
FEATURE=""
USER=${USER:-"unknown"}

while [[ $# -gt 0 ]]; do
  case $1 in
    --title)
      TITLE="$2"
      shift 2
      ;;
    --stage)
      STAGE="$2"
      shift 2
      ;;
    --feature)
      FEATURE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [ -z "$TITLE" ] || [ -z "$STAGE" ]; then
  echo "Usage: ./create-phr.sh --title \"Title\" --stage [spec|plan|tasks|red|green|refactor|explainer|misc|general] [--feature feature-name]"
  exit 1
fi

# Determine route
if [ "$STAGE" = "constitution" ]; then
  ROUTE="history/prompts/constitution"
elif [ "$STAGE" = "general" ]; then
  ROUTE="history/prompts/general"
elif [ -n "$FEATURE" ]; then
  ROUTE="history/prompts/$FEATURE"
else
  ROUTE="history/prompts/general"
fi

mkdir -p "$ROUTE"

# Generate ID and slug
ID=$(ls "$ROUTE" 2>/dev/null | grep -oE '^[0-9]+' | sort -n | tail -1)
ID=$((ID + 1))
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
DATE=$(date +%Y-%m-%d)

FILE="$ROUTE/${ID}-${SLUG}.${STAGE}.prompt.md"

# Create PHR
cat > "$FILE" << EOF
---
ID: ${ID}
TITLE: ${TITLE}
STAGE: ${STAGE}
DATE_ISO: ${DATE}
SURFACE: agent
MODEL: claude-opus-4-5
FEATURE: ${FEATURE:-"none"}
BRANCH: $(git branch --show-current 2>/dev/null || echo "unknown")
USER: ${USER}
COMMAND: none
LABELS:
  - sdd
LINKS:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
FILES_YAML:
TESTS_YAML:
OUTCOME: success
EVALUATION: professional
---

# ${TITLE}

## User Prompt
[TODO: Add full user prompt]

## Assistant Response
[TODO: Add key assistant response]

## Context
[TODO: Add context]

## Artifacts
[TODO: List artifacts created]

## Outcome
[TODO: Describe outcome]
EOF

echo "✅ Created PHR: $FILE"
