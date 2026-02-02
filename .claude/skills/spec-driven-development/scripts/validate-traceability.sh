#!/bin/bash
# Traceability Validator
# Checks that code references requirements with @spec tags

set -e

SPEC_FILE=${1:-specs/*/spec.md}
SOURCE_DIR=${2:-src}

echo "Validating traceability..."

# Extract requirements from spec
echo "Extracting requirements from $SPEC_FILE..."
REQUIREMENTS=$(grep -oE 'FR-[0-9]{3}|NFR-[0-9]{3}' "$SPEC_FILE" | sort -u)

if [ -z "$REQUIREMENTS" ]; then
  echo "⚠️  No requirements found in spec file"
  exit 1
fi

echo "Found requirements:"
echo "$REQUIREMENTS"
echo ""

# Check for @spec tags in source
echo "Checking @spec tags in $SOURCE_DIR..."

for REQ in $REQUIREMENTS; do
  if grep -r "@spec:$REQ" "$SOURCE_DIR" > /dev/null 2>&1; then
    echo "✅ $REQ is referenced in code"
  else
    echo "⚠️  $REQ is NOT referenced in code"
  fi
done

echo ""
echo "Traceability validation complete"
