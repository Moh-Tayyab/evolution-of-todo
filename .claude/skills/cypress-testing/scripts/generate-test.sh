#!/bin/bash
# Cypress Test Generator
# Usage: ./generate-test.sh <test-name> [e2e|component|integration]

TEST_NAME=$1
TEST_TYPE=${2:-e2e}

if [ -z "$TEST_NAME" ]; then
  echo "Usage: ./generate-test.sh <test-name> [e2e|component|integration]"
  exit 1
fi

TEMPLATE_DIR="$(dirname "$0")/../assets"

case $TEST_TYPE in
  e2e)
    OUTPUT_FILE="e2e/${TEST_NAME}.cy.ts"
    TEMPLATE="$TEMPLATE_DIR/e2e-test.template.ts"
    ;;
  component)
    OUTPUT_FILE="component/${TEST_NAME}.cy.ts"
    TEMPLATE="$TEMPLATE_DIR/component-test.template.ts"
    ;;
  integration)
    OUTPUT_FILE="integration/${TEST_NAME}.cy.ts"
    TEMPLATE="$TEMPLATE_DIR/integration-test.template.ts"
    ;;
  *)
    echo "Invalid test type. Use: e2e, component, or integration"
    exit 1
    ;;
esac

if [ ! -f "$TEMPLATE" ]; then
  echo "Template not found: $TEMPLATE"
  exit 1
fi

# Replace placeholder with test name
sed "s/{{TEST_NAME}}/$TEST_NAME/g" "$TEMPLATE" > "$OUTPUT_FILE"

echo "Created Cypress test: $OUTPUT_FILE"
