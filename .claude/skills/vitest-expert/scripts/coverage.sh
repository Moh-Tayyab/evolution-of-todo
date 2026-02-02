#!/bin/bash
# Vitest Coverage Checker
# Ensures test coverage meets minimum threshold

COVERAGE_THRESHOLD=${1:-80}

echo "Running Vitest with coverage (threshold: ${COVERAGE_THRESHOLD}%)..."
npx vitest run --coverage

# Check if coverage meets threshold
COVERAGE_RESULT=$(npx vitest run --coverage 2>&1 | grep -oP 'All files \| \K\d+' || echo "0")

if [ "$COVERAGE_RESULT" -lt "$COVERAGE_THRESHOLD" ]; then
  echo "❌ Coverage ${COVERAGE_RESULT}% is below threshold ${COVERAGE_THRESHOLD}%"
  exit 1
else
  echo "✅ Coverage ${COVERAGE_RESULT}% meets threshold ${COVERAGE_THRESHOLD}%"
  exit 0
fi
