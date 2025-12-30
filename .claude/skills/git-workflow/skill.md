# Git Workflow Skill

## Overview
Expertise for Git version control workflows, branching strategies, and collaboration.

## Usage
Use for branching strategies, commit conventions, merge conflicts, hooks.

## Core Concepts
- Branching: Use Git Flow or simple feature branches
- Conventional Commits: feat:, fix:, docs:, style:, test:, chore:
- Git Ignore: Protect sensitive data, build artifacts

## Examples

### Create Feature Branch
```bash
git checkout -b feature/add-search
git commit -m "feat: add search filters"
git push -u origin feature/add-search
```

### Commit Convention
```bash
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
test: add unit tests for auth
chore: update dependencies
```

### Rebasing
```bash
git fetch origin
git rebase origin/main
```

## Best Practices
1. Commit often with small, focused changes
2. Use conventional commit format
3. Pull before pushing to avoid conflicts
4. Never force push to main/master
5. Add .gitignore for sensitive files
6. Use hooks for automated checks (optional)
7. Tag releases for production deployments
8. Use meaningful branch names
9. Resolve conflicts by collaborating with team
10. Keep commit history clean with rebase

## Common Pitfalls
- Force pushing (git push -f)
- Committing directly to main branch
- Exposing secrets in commits
- Not resolving merge conflicts properly

## Tools Used
- **Read/Grep Tools:** Examine code, find patterns, read existing implementations
- **Write/Edit Tools:** Create new code/commands, modify existing files
- **Bash:** Run scripts, execute commands, install dependencies

## Verification Process
After implementing changes:
1. **Syntax Check:** Verify code syntax (Python/TypeScript)
2. **Function Check:** Run commands/tests to verify they work
3. **Output Check:** Verify expected output matches actual
4. **Integration Check:** Test with existing codebase

## Error Patterns
Common errors to recognize:
- **Syntax errors:** Missing imports, incorrect syntax
- **Logic errors:** Wrong control flow, incorrect conditions
- **Integration errors:** Incompatible versions, missing dependencies
- **Runtime errors:** Exceptions during execution
- **Configuration errors:** Missing required files/settings
