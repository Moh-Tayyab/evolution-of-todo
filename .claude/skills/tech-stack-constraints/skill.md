# Tech Stack Constraints Skill

## Overview
Expertise for managing technology constraints and architectural decisions.

## Usage
Use for validating technology choices, managing dependencies, enforcing guidelines.

## Core Concepts
- Technology Constraints: Approved versions, libraries, frameworks
- Dependency Management: Pinning, version ranges, security updates
- Architectural Guidelines: What to use/not use
- Compatibility: Ensuring libraries work together

## Examples

### Type Safety
```json
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "^19.0.0",
    "drizzle-orm": "^0.30.0"
  }
}
```

### Dependency Pinning
```json
{
  "dependencies": {
    "next": "15.0.0",           // Exact version
    "react": "^19.0.0",            // Compatible minor versions
    "typescript": "~5.3.0",           // Patch updates only
    "tailwindcss": "3.4.0"          // Exact
    "lucide-react": "latest"          // Always latest
  }
}
```

### Architecture Enforcement
```markdown
## Tech Stack

### Frontend
- Framework: Next.js 15+
- UI: shadcn/ui
- Styling: Tailwind CSS
- Language: TypeScript
- State: React Query
- Testing: Playwright

### Backend
- Framework: FastAPI
- Database: PostgreSQL with Drizzle ORM
- Platform: Neon PostgreSQL
- Language: Python 3.11+
- Testing: Pytest

### Infrastructure
- Container: Docker
- Orchestration: Kubernetes
- CI/CD: GitHub Actions

## Constraints

### Approved Libraries
✅ Allowed:
- shadcn/ui (required for UI components)
- Tailwind CSS (required for styling)
- Drizzle ORM (required for database)
- Framer Motion (required for animations)

❌ Not Allowed:
- Other UI libraries (use shadcn/ui instead)
- Other CSS frameworks (use Tailwind CSS)
- Other ORMs (use Drizzle ORM)
- Other animation libs (use Framer Motion)

### Version Requirements
- Node.js: >= 18.0.0
- Python: >= 3.11
- Next.js: 15.0.0 or higher
- FastAPI: 0.100.0 or higher

```

## Best Practices
1. Document all approved technologies and versions
2. Use semantic versioning for packages
3. Pin critical dependencies
4. Regular security audits (npm audit, pip-audit)
5. Update dependencies via PRs, not direct modifications
6. Review new dependencies for compatibility
7. Use lock files (package-lock.json, pnpm-lock.yaml)
8. Test in CI/CD before merging
9. Document architectural decisions in ADRs
10. Monitor for deprecation notices

## Common Pitfalls
- Using unapproved libraries
- Ignoring version requirements
- Direct npm installs (use pnpm)
- Missing type safety
- Not updating regularly
- Breaking changes without migration plan
- Unnecessary dependencies
- Not following semantic versioning

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
