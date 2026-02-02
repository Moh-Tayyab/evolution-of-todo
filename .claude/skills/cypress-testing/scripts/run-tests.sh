#!/bin/bash
# Cypress Test Runner
# Usage: ./run-tests.sh [open|headed|chrome|firefox]

MODE=${1:-}

case $MODE in
  open)
    echo "Opening Cypress Test Runner..."
    npx cypress open
    ;;
  headed)
    echo "Running Cypress tests in headed mode..."
    npx cypress run --headed
    ;;
  chrome)
    echo "Running Cypress tests in Chrome..."
    npx cypress run --browser chrome
    ;;
  firefox)
    echo "Running Cypress tests in Firefox..."
    npx cypress run --browser firefox
    ;;
  *)
    echo "Running Cypress tests in headless mode..."
    npx cypress run
    ;;
esac
