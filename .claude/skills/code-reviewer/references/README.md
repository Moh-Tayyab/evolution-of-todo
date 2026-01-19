# Code Reviewer References

Official documentation and resources for conducting comprehensive code reviews.

## Official Resources

### OWASP Top 10
- **OWASP Website**: https://owasp.org
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **ASVS**: https://owasp.org/www-project-application-security-verification-standard/
- **Cheat Sheet Series**: https://cheatsheetseries.owasp.org/

### Static Analysis Tools
- **SonarQube**: https://www.sonarqube.org/
- **ESLint**: https://eslint.org/
- **Pylint**: https://pylint.org/
- **Ruff**: https://docs.astral.sh/ruff/
- **Semgrep**: https://semgrep.dev/

## Security Review Checklist

### Injection Vulnerabilities
- [ ] SQL Injection - Use parameterized queries/ORM
- [ ] XSS - Sanitize user input, use CSP
- [ ] Command Injection - Avoid shell commands with user input
- [ ] LDAP Injection - Validate and sanitize input
- [ ] NoSQL Injection - Use safe query builders

### Authentication & Authorization
- [ ] Password hashing (bcrypt/argon2)
- [ ] Session management security
- [ ] Proper authentication on protected endpoints
- [ ] Authorization checks for all resources
- [ ] JWT token validation
- [ ] Multi-factor authentication for sensitive ops

### Data Protection
- [ ] Encryption at rest
- [ ] Encryption in transit (TLS)
- [ ] Sensitive data in logs (redaction)
- [ ] Proper key management
- [ ] PII handling compliance (GDPR, CCPA)

### API Security
- [ ] Rate limiting
- [ ] Input validation
- [ ] Output encoding
- [ ] CORS configuration
- [ ] API versioning
- [ ] Authentication on all endpoints

## Code Quality Metrics

### Maintainability
- **Cyclomatic Complexity**: < 10 per function
- **Function Length**: < 50 lines
- **File Length**: < 500 lines
- **Parameter Count**: < 5 parameters
- **Nesting Depth**: < 4 levels

### Test Coverage
- **Unit Tests**: > 80% coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: User workflows covered
- **Mutation Testing**: Quality of tests verified

### Performance
- **Database Queries**: N+1 queries eliminated
- **Caching**: Expensive operations cached
- **Memory Leaks**: Proper resource cleanup
- **Async Operations**: Non-blocking I/O

## Language-Specific Guidelines

### TypeScript/JavaScript
- **Linting**: ESLint with TypeScript rules
- **Type Safety**: No `any` types without justification
- **Null Checks**: Strict null checking enabled
- **Imports**: Organized and tree-shakeable
- **Error Handling**: Try-catch with specific error types

### Python
- **Style**: PEP 8 compliance (use Ruff/Black)
- **Type Hints**: All functions annotated
- **Docstrings**: Google/NumPy style
- **Imports**: Organized (stdlib, third-party, local)
- **Error Handling**: Specific exceptions, not bare except

### Go
- **Errors**: Always check and handle errors
- **Goroutines**: Proper WaitGroup usage
- **Context**: Use context for cancellation
- **Interfaces**: Small, focused interfaces
- **Comments**: Exported functions documented

## Review Process

### Pre-Review Checklist
- [ ] Code compiles/runs without errors
- [ ] Tests pass locally
- [ ] Linter passes
- [ ] Self-review completed
- [ ] Changes are focused and logical
- [ ] Commit messages are clear

### Review Categories
1. **Correctness**: Does it work as intended?
2. **Design**: Is it well-architected?
3. **Security**: Are there vulnerabilities?
4. **Performance**: Is it efficient?
5. **Testing**: Is it adequately tested?
6. **Documentation**: Is it documented?
7. **Style**: Does it follow conventions?

### Post-Review
- [ ] All comments addressed
- [ ] Changes verified
- [ ] Tests still pass
- [ ] Documentation updated
- [ ] Approved and merged

## Tools Integration

### GitHub Actions
```yaml
name: Code Review

on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run ESLint
        run: npm run lint
      - name: Run Tests
        run: npm test
      - name: Security Scan
        uses: snyk/security-scan@v1.0.0
```

### Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/mirrors-eslint
    hooks:
      - id: eslint
  - repo: https://github.com/psf/black
    hooks:
      - id: black
  - repo: https://github.com/astral-sh/ruff-pre-commit
    hooks:
      - id: ruff
```

## Best Practices

### Giving Feedback
- Be constructive and specific
- Explain the "why" not just "what"
- Suggest improvements, don't just criticize
- Acknowledge good code
- Use examples for clarification

### Receiving Feedback
- Ask clarifying questions
- Discuss trade-offs openly
- Accept valid criticism gracefully
- Explain your reasoning when disagreeing
- Learn from the review

### Review Etiquette
- Respond promptly to reviews
- Keep PRs small and focused
- Update PR description with changes
- Mark conversations as resolved
- Say thank you to reviewers

## Resources

- **Google Engineering Practices**: https://google.github.io/eng-practices/
- **Clean Code**: Book by Robert C. Martin
- **Refactoring**: Book by Martin Fowler
- **Pragmatic Programmer**: Book by David Thomas
