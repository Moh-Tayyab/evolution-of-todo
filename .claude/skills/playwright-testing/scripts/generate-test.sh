#!/bin/bash
# Playwright Test Generator
# Usage: ./generate-test.sh <test-name> [e2e|api|visual]

TEST_NAME=$1
TEST_TYPE=${2:-e2e}

if [ -z "$TEST_NAME" ]; then
  echo "Usage: ./generate-test.sh <test-name> [e2e|api|visual]"
  exit 1
fi

TEMPLATE_DIR="$(dirname "$0")/../assets"
OUTPUT_FILE="e2e/${TEST_NAME}.spec.ts"

case $TEST_TYPE in
  e2e)
    TEMPLATE="$TEMPLATE_DIR/e2e-test.template.ts"
    ;;
  api)
    TEMPLATE="$TEMPLATE_DIR/api-test.template.ts"
    ;;
  visual)
    TEMPLATE="$TEMPLATE_DIR/visual-test.template.ts"
    ;;
  *)
    echo "Invalid test type. Use: e2e, api, or visual"
    exit 1
    ;;
esac

if [ ! -f "$TEMPLATE" ]; then
  echo "Template not found: $TEMPLATE"
  exit 1
fi

# Replace placeholder with test name
sed "s/{{TEST_NAME}}/$TEST_NAME/g" "$TEMPLATE" > "$OUTPUT_FILE"

echo "Created Playwright test: $OUTPUT_FILE"
