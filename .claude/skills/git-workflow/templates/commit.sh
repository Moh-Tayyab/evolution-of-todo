#!/bin/bash
# Git commit workflow

# Check for changes
if [[ -z $(git status --porcelain) ]]; then
  echo "No changes to commit"
  exit 0
fi

# Stage all changes
git add .

# Prompt for commit message
echo "Enter commit message (press Enter for conventional commit wizard):"
read -r COMMIT_MESSAGE

if [[ -z "$COMMIT_MESSAGE" ]]; then
  # Conventional commit wizard
  echo "Select commit type:"
  echo "1) feat:     A new feature"
  echo "2) fix:      A bug fix"
  echo "3) docs:     Documentation only changes"
  echo "4) style:     Changes that don't affect code meaning"
  echo "5) refactor:  Code refactoring"
  echo "6) test:     Adding or updating tests"
  echo "7) chore:     Maintenance tasks"
  read -p "Enter choice (1-7): " CHOICE

  case $CHOICE in
    1) TYPE="feat" ;;
    2) TYPE="fix" ;;
    3) TYPE="docs" ;;
    4) TYPE="style" ;;
    5) TYPE="refactor" ;;
    6) TYPE="test" ;;
    7) TYPE="chore" ;;
    *) TYPE="chore" ;;
  esac

  read -p "Enter scope (optional): " SCOPE
  read -p "Enter description: " DESCRIPTION

  if [[ -n "$SCOPE" ]]; then
    COMMIT_MESSAGE="$TYPE($SCOPE): $DESCRIPTION"
  else
    COMMIT_MESSAGE="$TYPE: $DESCRIPTION"
  fi
fi

# Commit with message
git commit -m "$COMMIT_MESSAGE"

echo "✓ Committed: $COMMIT_MESSAGE"
