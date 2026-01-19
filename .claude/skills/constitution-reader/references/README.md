# Constitution Reader References

Documentation and resources for validating project compliance with Spec-Driven Development principles and constitutional requirements.

## Official Resources

### Spec-Driven Development
- **SDD Principles**: https://spec-driven.dev/
- **Specification Templates**: https://spec-driven.dev/templates/
- **Best Practices**: https://spec-driven.dev/guides/

## Core Principles

### Spec-Driven Development
1. **All work starts from specifications** - No code without specs
2. **Test-first approach** - Write tests before implementation
3. **Documentation** - Document all decisions and changes
4. **Traceability** - Link code to spec requirements
5. **Review process** - All specs must be reviewed

### Constitution Elements

#### Project Constitution
```markdown
# Project Constitution

## Core Principles

1. **Spec-Driven Development** - All work begins with specifications
2. **Test-First** - Write tests before implementation
3. **Documentation** - Document all decisions
4. **Code Quality** - Follow established standards

## Code Standards

- **TypeScript** for type safety
- **Prettier** for formatting (2 spaces)
- **ESLint** for linting
- **Test coverage** ≥ 80%

## Development Workflow

1. Create/update spec.md
2. Create/update plan.md (if needed)
3. Create/update tasks.md
4. Implement and test
5. Create PHR record
```

## Spec Traceability

### Code Annotations
```typescript
// @spec:FR-001 User Registration
// @spec:NFR-003 Response Time < 200ms
export async function registerUser(data: UserRegistration) {
  // Implementation
}

// @spec:FR-002 User Login
// @spec:NFR-002 Secure Authentication
export async function loginUser(credentials: LoginCredentials) {
  // Implementation
}
```

### Test Traceability
```typescript
describe('User Registration', () => {
  // @spec:FR-001
  it('should register a new user', async () => {
    const result = await registerUser(validUserData);
    expect(result.success).toBe(true);
  });

  // @spec:FR-001, @spec:NFR-003
  it('should complete within 200ms', async () => {
    const start = Date.now();
    await registerUser(validUserData);
    expect(Date.now() - start).toBeLessThan(200);
  });
});
```

## Verification Process

### Automated Checks
```bash
#!/bin/bash
# verify-constitution.sh

echo "Checking spec traceability..."

# Check for @spec comments
if ! git grep -q "@spec" src/; then
  echo "❌ No spec annotations found in source code"
  exit 1
fi

# Check test coverage
coverage=$(npm run test:coverage -- --silent)
if (( $(echo "$coverage < 80" | bc -l) )); then
  echo "❌ Test coverage below 80%"
  exit 1
fi

echo "✅ All checks passed"
```

### Manual Review Checklist
```markdown
## Constitution Compliance Review

### Specification
- [ ] Spec exists for the feature
- [ ] All requirements are documented
- [ ] Acceptance criteria are defined
- [ ] NFRs are specified

### Implementation
- [ ] Code is annotated with @spec comments
- [ ] Tests exist for all requirements
- [ ] Test coverage ≥ 80%
- [ ] Code follows style guidelines

### Documentation
- [ ] PHR was created
- [ ] ADR was created (if applicable)
- [ ] Changes are documented

### Verification
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Code review completed
```

## Architecture Decision Records

### When to Create ADR

Create an ADR when:
- Impact: Long-term consequences
- Alternatives: Multiple viable options
- Scope: Cross-cutting and influences system design

### ADR Template
```markdown
# [Title]

## Status
Accepted / Proposed / Deprecated / Superseded

## Context
What is the issue motivating this decision?

## Decision
What change are we making?

## Alternatives Considered
### Option 1: [Description]
- Pros: ...
- Cons: ...

### Option 2: [Description]
- Pros: ...
- Cons: ...

## Rationale
Why did we choose this option?

## Consequences
What becomes easier or harder?

## References
Links to related docs
```

## Prompt History Records (PHR)

### When to Create PHR

Create PHR for:
- Implementation work
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

### PHR Template
```yaml
---
ID: 0001
TITLE: Feature implementation summary
STAGE: implementation
DATE_ISO: 2024-01-19
SURFACE: agent
MODEL: sonnet
FEATURE: user-authentication
BRANCH: feature/auth
USER: username
COMMAND: /sp.implement
LABELS:
  - authentication
  - security
LINKS:
  SPEC: specs/user-authentication/spec.md
  TICKET: "#123"
  ADR: history/adr/001-jwt-authentication.md
  PR: "#456"
FILES_YAML:
  - src/auth/jwt.ts
  - src/auth/middleware.ts
TESTS_YAML:
  - src/auth/__tests__/test_jwt.py
PROMPT_TEXT: |
  Implement JWT authentication for the user system
RESPONSE_TEXT: |
  Implemented JWT authentication with refresh tokens
OUTCOME: success
EVALUATION: All tests passing, ready for review
---
```

## Compliance Audit

### Spec Traceability Audit
```bash
#!/bin/bash
# audit-spec-traceability.sh

echo "=== Spec Traceability Audit ==="

# Find all spec references
echo "Finding @spec annotations..."
git grep -n "@spec" src/ | while read line; do
  file=$(echo "$line" | cut -d: -f1)
  lineno=$(echo "$line" | cut -d: -f2)
  spec=$(echo "$line" | grep -o "@spec:[A-Z0-9-]*" | cut -d: -f2)
  echo "  $file:$lineno → $spec"
done

# Check for orphaned code (no @spec)
echo ""
echo "Checking for code without @spec..."
for file in src/**/*.ts; do
  if ! grep -q "@spec" "$file"; then
    echo "  ⚠️  $file has no spec annotations"
  fi
done
```

### Test Coverage Audit
```bash
#!/bin/bash
# audit-test-coverage.sh

echo "=== Test Coverage Audit ==="

# Run coverage
npm run test:coverage -- --silent --output=json > coverage.json

# Check coverage by file
echo "Checking per-file coverage..."
node -e "
const coverage = require('./coverage.json');
Object.entries(coverage).forEach(([file, data]) => {
  const pct = data.coverage.pct;
  if (pct < 80) {
    console.log(\`  ❌ \${file}: \${pct}%\`);
  } else {
    console.log(\`  ✅ \${file}: \${pct}%\`);
  }
});
"
```

## Quality Gates

### Pre-Commit Checks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: check-spec-annotations
        name: Check for @spec annotations
        entry: scripts/check-spec-annotations.sh
        language: script

      - id: check-test-coverage
        name: Check test coverage ≥ 80%
        entry: npm run test:coverage
        language: node

      - id: check-docs
        name: Check documentation exists
        entry: scripts/check-docs.sh
        language: script
```

### CI/CD Pipeline
```yaml
# .github/workflows/constitution-checks.yml
name: Constitution Checks

on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check spec annotations
        run: ./scripts/audit-spec-traceability.sh

      - name: Run tests
        run: npm test

      - name: Check coverage
        run: npm run test:coverage

      - name: Verify documentation
        run: ./scripts/verify-phr.sh
```

## Best Practices

### Documentation
- Always create PHR after work
- Create ADR for architectural decisions
- Keep constitution updated
- Document trade-offs

### Code Quality
- Add @spec comments to all code
- Maintain test coverage ≥ 80%
- Follow style guidelines
- Write self-documenting code

### Review Process
- All specs must be reviewed
- All code must be reviewed
- Check spec traceability
- Verify test coverage

## Tools

### Verification Scripts
- `audit-spec-traceability.sh` - Check @spec annotations
- `audit-test-coverage.sh` - Verify test coverage
- `verify-phr.sh` - Validate PHR records
- `check-constitution.sh` - Full compliance audit

### Git Hooks
- Pre-commit: Check @spec annotations
- Pre-commit: Run tests
- Pre-push: Check coverage
- Pre-merge: Full audit

## Resources

- **Spec-Driven Development**: https://spec-driven.dev/
- **Architecture Decision Records**: https://adr.github.io/
- **Test-Driven Development**: https://martinfowler.com/bliki/TestDrivenDevelopment.html
