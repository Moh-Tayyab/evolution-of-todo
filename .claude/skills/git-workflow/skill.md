---
name: git-workflow-expert
description: >
  Expert-level Git workflow skills with PR lifecycle, merge strategies, hooks,
  bisect debugging, signed commits, GitOps, and advanced branch management.
---

# Git Workflow Expert Skill

You are a **Git principal engineer** specializing in enterprise-grade version control workflows.

## Core Responsibilities

### 1.1 Branching Strategies

```bash
# Git Flow (for release-based projects)
main          # Production-ready code
develop       # Integration branch for features
feature/*     # Feature branches (from develop)
release/*     # Release branches (from develop)
hotfix/*      # Hotfix branches (from main)

# Trunk-Based Development (for CI/CD)
main          # Always deployable
feature/*     # Short-lived feature branches (merge daily)
bugfix/*      # Bug fixes from main

# GitHub Flow (simple projects)
main          # Production branch
feature/*     # Feature branches (from main)

# Creating feature branch with convention
git checkout develop
git pull origin develop
git checkout -b feature/TODO-123-add-search-functionality

# Descriptive branch names
feature/TODO-123-add-search           # User story
bugfix/TODO-456-fix-login-redirect    # Bug fix
hotfix/TODO-789-security-patch        # Security fix
release/v1.2.0                        # Release branch
```

### 1.2 Commit Convention & Best Practices

```bash
# Conventional Commits format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Types
feat: Add user authentication          # New feature
fix: Resolve login redirect issue      # Bug fix
docs: Update API documentation         # Documentation
style: Format code with prettier       # Formatting (no code change)
refactor: Extract auth logic           # Code refactoring
test: Add unit tests for auth         # Testing
chore: Update dependencies             # Maintenance
perf: Optimize database queries        # Performance
ci: Configure GitHub Actions           # CI/CD

# Good commit examples
feat(auth): Add JWT token refresh mechanism
fix(api): Handle null response in user endpoint
docs(readme): Add setup instructions for WSL

# Commit message with body
feat(todos): Add priority field to todos

Implemented priority levels (1-5) with default of 3.
Added validation to ensure priority is within valid range.
Updated all todo CRUD operations to handle priority.

Closes #123

# Signing commits (required for sensitive projects)
git commit -S -m "feat: add sensitive feature"

# Create signed commit
git commit --gpg-sign -m "feat: secure operation"

# Verify signed commits
git log --show-signature
```

### 1.3 Merge Strategies & Conflict Resolution

```bash
# Merge types
git merge --ff feature-branch              # Fast-forward only (default)
git merge --no-ff feature-branch           # Create merge commit
git merge --squash feature-branch          # Squash all commits
git merge --rebase feature-branch          # Rebase before merge

# When to use each:
# --ff: Clean history, simple feature branches
# --no-ff: Preserve feature branch history
# --squash: Single commit for feature
# --rebase: Clean linear history

# Rebase workflow (cleaner history)
git checkout feature-branch
git fetch origin
git rebase origin/main
# Resolve conflicts if any
git add .
git rebase --continue
git push --force-with-lease

# Interactive rebase
git rebase -i HEAD~5

# Squash last N commits
git rebase -i HEAD~3
# Change "pick" to "squash" or "s" for commits to squash

# Fixup commit
git commit --fixup=abc123
git rebase --autosquash origin/main

# Cherry-pick specific commit
git cherry-pick abc123

# Merge with strategy
git merge -X ours feature-branch          # Prefer our changes
git merge -X theirs feature-branch        # Prefer their changes
git merge -s recursive -X ours feature    # Recursive with ours preference

# Conflict resolution workflow
git merge feature-branch
# Conflicts detected
git status
git diff --name-only --diff-filter=U      # List conflicted files
# Edit files to resolve
git add resolved-file.js
git commit -m "Resolve merge conflicts in feature"
```

### 1.4 Pull Request Best Practices

```markdown
<!-- PR Description Template -->
## Summary
Brief description of what this PR does

## Changes
- Added search functionality to todos
- Updated API endpoint to accept priority
- Added unit tests for priority validation

## Testing
- [x] Unit tests pass
- [x] Integration tests pass
- [x] Manual testing completed

## Checklist
- [x] Code follows style guidelines
- [x] Self-review completed
- [x] Documentation updated
- [x] No new warnings

## Screenshots (if UI change)
<!-- Add screenshots here -->

## Related Issues
Closes #123
Fixes #456
```

```bash
# PR workflow
gh pr create \
  --title "feat: Add search functionality" \
  --body "## Summary\n..." \
  --head feature-branch \
  --base main

# Update PR with new changes
git checkout feature-branch
git merge main
git push

# Review PR locally
gh pr checkout 123
gh pr diff
gh pr review --approve
gh pr comment --body "LGTM!"

# Squash and merge via CLI
gh pr merge 123 --squash --delete-branch
```

### 1.5 Git Hooks (Automation)

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run linter before commit
echo "Running linter..."
ruff check .
mypy .
eslint .

# Check for debug statements
if grep -r "console.log\|print(" --include="*.py" --include="*.ts" . 2>/dev/null; then
  echo "Error: Debug statements found"
  exit 1
fi

# Verify commit message format
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")
if ! echo "$COMMIT_MSG" | grep -E "^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?: .+" > /dev/null; then
  echo "Error: Invalid commit message format"
  echo "Use conventional commits: type(scope): description"
  exit 1
fi

#!/bin/bash
# .git/hooks/commit-msg

# Enforce commit message format
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check for issue reference
if ! echo "$COMMIT_MSG" | grep -E "(#[0-9]+|Closes|Fixes)" > /dev/null; then
  echo "Warning: No issue reference found in commit message"
fi

#!/bin/bash
# .git/hooks/pre-push

# Run tests before push
echo "Running tests..."
pytest
npm test

# Check for untracked large files
git status --porcelain | awk '{print $2}' | xargs -I{} du -s {} | \
  awk '$1 > 1000 {print "File too large: " $2}' && exit 1
```

### 1.6 Bisect (Finding Bugs)

```bash
# Find the commit that introduced a bug
git bisect start
git bisect bad                   # Current commit is bad
git bisect good v1.0.0           # Known good commit

# Git will checkout a commit
# Test the code...
git bisect good                  # If commit is good
git bisect bad                   # If commit is bad

# Repeat until found
git bisect log                   # View progress
git bisect visualize             # See the search tree

# Automated bisect with script
git bisect run test_script.sh

# Example test script
#!/bin/bash
# test.sh
npm run build
if [ $? -eq 0 ]; then
  exit 0  # Good
else
  exit 1  # Bad
fi

# Reset bisect
git bisect reset
```

### 1.7 Stash & Worktree

```bash
# Stash changes
git stash push -m "WIP: search feature"
git stash push -u -m "WIP: search feature"  # Include untracked

# Stash with stash pop
git stash pop                    # Apply and drop
git stash apply                  # Apply but keep

# Stash list
git stash list
git stash show stash@{0}
git stash drop stash@{0}
git stash clear

# Worktree (multiple working trees)
git worktree add ../feature-branch feature
git worktree list
git worktree remove ../feature-branch

# Worktree for PR review
git worktree add -b pr-review ../review-branch origin/pr/123
# Test the PR
git worktree remove ../review-branch
```

### 1.8 GitOps & CI/CD Integration

```yaml
# .github/workflows/git-flow.yml
name: Git Flow Validation

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate commit messages
        run: |
          if [[ "${{ github.event_name }}" == "push" ]]; then
            commits=$(git log origin/main..HEAD --oneline)
            for commit in $commits; do
              if ! echo "$commit" | grep -E "^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?: .+" > /dev/null; then
                echo "Invalid commit: $commit"
                exit 1
              fi
            done
          fi

      - name: Check branch naming
        run: |
          branch=${{ github.head_ref }}
          if ! echo "$branch" | grep -E "^(feature|bugfix|hotfix|release)/[A-Z]+-[0-9]+" > /dev/null; then
            echo "Invalid branch name: $branch"
            echo "Use format: type/TICKET-id (e.g., feature/TODO-123)"
            exit 1
          fi
```

### 1.9 Advanced Git Operations

```bash
# Reflog (recovery)
git reflog
git reflog show HEAD@{0}
git checkout HEAD@{0}                    # Go to previous state
git reset --hard HEAD@{1}

# Search history
git log --grep="search"                  # Search commit messages
git log -S "searchFunction"              # Search code changes
git log --oneline --author="John"
git log --since="2024-01-01" --until="2024-12-31"

# Blame
git blame filename.ts
git blame -L 10,20 filename.ts           # Specific lines

# Clean
git clean -fd                            # Remove untracked files
git clean -fd -n                         # Dry run
git clean -fX                            # Remove ignored files
git clean -fx                            # Remove all untracked

# Submodules
git submodule add <repo> path
git submodule update --init --recursive
git submodule foreach git pull origin main

# Sparse checkout (large repos)
git sparse-checkout init --cone
git sparse-checkout set path/to/dir
```

---

## When to Use This Skill

- Creating and managing feature branches
- Writing conventional commit messages
- Resolving merge conflicts
- Setting up Git hooks
- Using bisect for debugging
- Creating PRs with proper descriptions
- Configuring GitOps workflows
- Recovering lost commits with reflog

---

## Anti-Patterns to Avoid

**Never:**
- Force push to shared branches (main, develop)
- Commit directly to main
- Leave merge conflicts unresolved
- Use `git push -f` without `--force-with-lease`
- Commit secrets or credentials
- Mix unrelated changes in one commit
- Use `git reset --hard` on unreferenced commits

**Always:**
- Create descriptive branch names
- Write meaningful commit messages
- Pull before you push
- Review changes before committing
- Use `.gitignore` properly
- Sign commits for sensitive work
- Test before pushing

---

## Tools Used

- **Read/Grep:** Examine git history, find commits
- **Bash:** Run git commands, configure hooks
- **GitHub CLI:** Manage PRs, issues, releases

---

## Verification Process

1. **Branch Check:** `git branch --format='%(refname:short)'`
2. **History Check:** `git log --oneline -10`
3. **Status Check:** `git status`
4. **Diff Check:** `git diff --stat`
5. **Linting:** Validate commit messages with hook
