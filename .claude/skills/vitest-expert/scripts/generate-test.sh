#!/bin/bash
# Vitest Test Generator
# Usage: ./generate-test.sh <component-name> <type>

COMPONENT_NAME=$1
TEST_TYPE=${2:-unit}

if [ -z "$COMPONENT_NAME" ]; then
  echo "Usage: ./generate-test.sh <component-name> [unit|component|integration]"
  exit 1
fi

TEMPLATE_DIR="$(dirname "$0")/../assets"
OUTPUT_FILE="${COMPONENT_NAME}.test.ts"

case $TEST_TYPE in
  unit)
    TEMPLATE="$TEMPLATE_DIR/unit-test.template.ts"
    ;;
  component)
    TEMPLATE="$TEMPLATE_DIR/component-test.template.ts"
    ;;
  integration)
    TEMPLATE="$TEMPLATE_DIR/integration-test.template.ts"
    ;;
  *)
    echo "Invalid test type. Use: unit, component, or integration"
    exit 1
    ;;
esac

if [ ! -f "$TEMPLATE" ]; then
  echo "Template not found: $TEMPLATE"
  exit 1
fi

# Replace placeholder with component name
sed "s/{{COMPONENT_NAME}}/$COMPONENT_NAME/g" "$TEMPLATE" > "$OUTPUT_FILE"

echo "Created test file: $OUTPUT_FILE"
