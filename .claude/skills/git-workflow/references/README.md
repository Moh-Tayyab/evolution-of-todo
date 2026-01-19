# Git Workflow References

Official documentation and resources for Git workflows, branching strategies, and collaboration.

## Official Resources

### Git Documentation
- **Official Site**: https://git-scm.com/
- **Reference**: https://git-scm.com/doc
- **Pro Git Book**: https://git-scm.com/book/en/v2
- **GitHub Docs**: https://docs.github.com/
- **GitLab Docs**: https://docs.gitlab.com/

## Branching Strategies

### Git Flow
```
main (production)
  ├── develop (integration)
  ├── feature/* (new features)
  ├── release/* (release preparation)
  └── hotfix/* (production fixes)
```

### GitHub Flow
```
main (production)
  └── feature/* (short-lived branches)
```

### Trunk-Based Development
```
main (trunk)
  ├── feature flags
  └── short-lived branches (< 1 day)
```

## Common Workflows

### Feature Branch Workflow
```bash
# Create feature branch
git checkout -b feature/add-login

# Make changes
git add .
git commit -m "feat: add login form"

# Push to remote
git push -u origin feature/add-login

# Create pull request
# After review and merge:
git checkout main
git pull
git branch -d feature/add-login
```

### Hotfix Workflow
```bash
# Create hotfix from main
git checkout -b hotfix/critical-bug

# Fix and commit
git add .
git commit -m "fix: resolve critical bug"

# Push and create PR
git push -u origin hotfix/critical-bug

# Merge to main and back to develop
git checkout main
git merge hotfix/critical-bug
git checkout develop
git merge hotfix/critical-bug
```

## Commit Conventions

### Conventional Commits
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

### Examples
```bash
git commit -m "feat(auth): add JWT token refresh"
git commit -m "fix(api): resolve race condition in user creation"
git commit -m "docs: update API documentation"
git commit -m "refactor(db): extract query logic to repository"
```

## Pull Request Guidelines

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### PR Best Practices
- Keep PRs small and focused
- Include clear descriptions
- Add tests for new code
- Update documentation
- Request appropriate reviewers
- Address all review comments

## Code Review

### Review Checklist
- [ ] Code is readable and maintainable
- [ ] Follows project conventions
- [ ] Has appropriate tests
- [ ] No security vulnerabilities
- [ ] Performance considered
- [ ] Error handling present
- [ ] Documentation updated

### Giving Feedback
- Be constructive and specific
- Explain the reasoning
- Suggest improvements
- Acknowledge good code
- Use examples for clarity

## Rebase vs Merge

### Rebase (Clean History)
```bash
git checkout feature-branch
git rebase main
# Resolve conflicts if any
git push origin feature-branch --force
```

### Merge (Preserve History)
```bash
git checkout main
git merge feature-branch
# Resolve conflicts if any
git push origin main
```

### When to Use
- **Rebase**: Feature branches, local cleanup
- **Merge**: Long-running branches, public branches

## Interactive Rebase

```bash
# Rebase last 5 commits
git rebase -i HEAD~5

# Commands:
# pick = use commit
# reword = edit commit message
# edit = amend commit
# squash = merge with previous
# drop = remove commit
```

## Conflict Resolution

```bash
# During merge/rebase, when conflicts occur:
git status
# Edit conflicted files
git add <resolved-files>
git rebase --continue  # or git commit for merge

# Or abort:
git rebase --abort  # or git merge --abort
```

## Git Hooks

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run linter
npm run lint

# Run tests
npm test

# Check for TODOs
if git diff --cached | grep "TODO"; then
  echo "Please resolve TODOs before committing"
  exit 1
fi
```

### Pre-push Hook
```bash
#!/bin/bash
# .git/hooks/pre-push

# Run full test suite
npm run test:all

# Check coverage
npm run test:coverage
```

## Useful Commands

### History
```bash
git log --oneline --graph --all
git log -p -2  # Last 2 commits with diffs
git log --author="John"
git log --since="2 weeks ago"
```

### Branches
```bash
git branch -a  # All branches
git branch -r  # Remote branches
git branch -d feature  # Delete merged branch
git branch -D feature  # Force delete
```

### Stashing
```bash
git stash push -m "work in progress"
git stash list
git stash pop
git stash drop
```

### Tagging
```bash
git tag v1.0.0
git push origin v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
```

## Troubleshooting

### Undo Last Commit
```bash
git reset --soft HEAD~1  # Keep changes
git reset --hard HEAD~1  # Discard changes
```

### Undo Published Commit
```bash
git revert abc123  # Create new commit that undoes
```

### Recover Lost Commit
```bash
git reflog
git checkout abc123  # Or git reset --hard abc123
```

### Large File Issues
```bash
git rm --cached large-file
echo "large-file" >> .gitignore
git commit -m "Remove large file"
```

## Best Practices

- Commit frequently with meaningful messages
- Pull before push
- Never rewrite published history
- Use `.gitignore` appropriately
- Keep sensitive data out of repo
- Review changes before committing
- Use feature branches
- Keep main branch stable
- Tag releases
- Document breaking changes

## CI/CD Integration

### GitHub Actions
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
```

## Resources

- **Git Interactive Tutorial**: https://learngitbranching.js.org/
- **GitHub Skills**: https://skills.github.com/
- **Git Cheatsheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Git SCM Docs**: https://git-scm.com/docs
