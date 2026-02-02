#!/bin/bash
# Playwright Test Runner
# @spec: 002-fullstack-web-app/plan.md - E2E Testing Infrastructure
#
# Usage: ./run-tests.sh [headed|debug|ui|visual|report]

set -e  # Exit on error

MODE=${1:-}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Ensure we're in the frontend directory
cd "$FRONTEND_DIR"

echo "🎭 Playwright Test Runner"
echo "📁 Working directory: $FRONTEND_DIR"
echo ""

case $MODE in
  headed)
    echo "▶️  Running Playwright tests in headed mode..."
    pnpm exec playwright test --headed
    ;;
  debug)
    echo "🐛 Running Playwright tests in debug mode..."
    pnpm exec playwright test --debug
    ;;
  ui)
    echo "🖥️  Opening Playwright UI mode..."
    pnpm exec playwright test --ui
    ;;
  visual)
    echo "📸 Running visual regression tests..."
    pnpm exec playwright test --update-snapshots
    ;;
  report)
    echo "📊 Opening Playwright HTML report..."
    pnpm exec playwright show-report
    ;;
  *)
    echo "▶️  Running Playwright tests in headless mode..."
    pnpm exec playwright test
    ;;
esac

echo ""
echo "✅ Test run complete!"
echo ""
echo "📊 View results:"
echo "   HTML Report:   pnpm exec playwright show-report"
echo "   Test Results:  ./test-results/"
echo "   Playwright Report: ./playwright-report/"
