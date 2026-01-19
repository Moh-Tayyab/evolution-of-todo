#!/bin/bash
# Playwright Test Runner
# Usage: ./run-tests.sh [headed|debug|ui]

MODE=${1:-}

case $MODE in
  headed)
    echo "Running Playwright tests in headed mode..."
    npx playwright test --headed
    ;;
  debug)
    echo "Running Playwright tests in debug mode..."
    npx playwright test --debug
    ;;
  ui)
    echo "Opening Playwright UI..."
    npx playwright test --ui
    ;;
  *)
    echo "Running Playwright tests in headless mode..."
    npx playwright test
    ;;
esac
