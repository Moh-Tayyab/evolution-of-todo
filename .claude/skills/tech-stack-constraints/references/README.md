# Tech Stack Constraints References

Documentation and resources for managing technology stack constraints, dependencies, and architectural decisions.

## Official Resources

### Decision Records
- **ADR Tools**: https://adr.github.io/
- **MADR Template**: https://github.com/adr/madr
- **ThoughtWorks Tech Radar**: https://www.thoughtworks.com/radar

## Architecture Decision Records (ADR)

### Template
```markdown
# [Title]

## Status
Accepted / Proposed / Deprecated / Superseded

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?
```

### Example
```markdown
# Use PostgreSQL as Primary Database

## Status
Accepted

## Context
We need a relational database that supports:
- ACID transactions
- Complex queries
- JSON data types
- Full-text search

## Decision
Use PostgreSQL as our primary database.

## Consequences
### Positive
- Mature, stable database
- Excellent PostgreSQL support
- Advanced features (JSON, full-text)
- Strong ACID guarantees

### Negative
- Requires separate storage for large files
- Vertical scaling limitations
- More complex than NoSQL alternatives
```

## Technology Selection Criteria

### Evaluation Framework
1. **Business Fit**
   - Cost (licensing, infrastructure)
   - Time to market
   - Team expertise

2. **Technical Fit**
   - Performance requirements
   - Scalability needs
   - Integration capabilities
   - Security features

3. **Operational Fit**
   - Monitoring capabilities
   - Debugging tools
   - Community support
   - Documentation quality

## Dependency Management

### Semantic Versioning
```
MAJOR.MINOR.PATCH

1.0.0 → 2.0.0  : Breaking changes
1.0.0 → 1.1.0  : New features, backward compatible
1.0.0 → 1.0.1  : Bug fixes, backward compatible
```

### Dependency Constraints
```json
{
  "dependencies": {
    "package": "^1.2.3"     // >=1.2.3, <2.0.0
    "package": "~1.2.3"     // >=1.2.3, <1.3.0
    "package": "1.2.3"      // Exactly 1.2.3
    "package": "*"          // Latest (dangerous)
    "package": "file:..."   // Local package
  }
}
```

## Version Policies

### LTS vs Latest
- **LTS (Long Term Support)**: Production, stability-focused
- **Latest**: Development, new features

### Update Strategy
```
# Example schedule
- Review dependencies monthly
- Update patch versions weekly (automated)
- Update minor versions monthly (manual review)
- Update major versions quarterly (careful review)
```

## Technology Constraints

### Language Constraints
```
Backend: Python 3.13+
Frontend: TypeScript 5.0+
Mobile: Kotlin 1.9+ / Swift 5.9+
```

### Framework Constraints
```
Web: Next.js 14+
API: FastAPI 0.100+
Testing: Pytest 7.0+ / Jest 29+
```

### Database Constraints
```
Primary: PostgreSQL 15+
Cache: Redis 7+
Search: Elasticsearch 8+
```

## Migration Strategies

### Incremental Migration
```
1. Add new system alongside old
2. Migrate data gradually
3. Route traffic to new system
4. Monitor and verify
5. Decommission old system
```

### Strangler Pattern
```typescript
// Route traffic based on feature flag
if (featureFlags.useNewSystem) {
  return newSystemHandler(request);
} else {
  return oldSystemHandler(request);
}
```

## Deprecation Process

### Deprecation Timeline
```
1. Announce deprecation (6 months ahead)
2. Mark as deprecated in code/docs
3. Add warnings for users
4. Provide migration guide
5. Remove in next major version
```

### Deprecation Notice
```python
@deprecated("Use new_function() instead", version="2.0.0", removal="3.0.0")
def old_function():
    """This function is deprecated and will be removed in version 3.0.0."""
    warnings.warn("Use new_function() instead", DeprecationWarning)
```

## Constraint Enforcement

### Pre-commit Hooks
```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: check-python-version
        name: Check Python version constraint
        entry: python3.13
        language: system
```

### CI/CD Validation
```yaml
# Check dependencies in CI
test:
  script:
    - pip install pip-audit
    - pip-audit --strict
```

### Dependency Scanning
```bash
# npm audit
npm audit --audit-level=moderate

# pip audit
pip-audit

# Dependabot
# Enable in GitHub repository settings
```

## Documentation Requirements

### Architecture Documentation
- System diagrams
- Data flow diagrams
- API documentation
- Database schemas
- Deployment architecture

### Decision Documentation
- ADRs for major decisions
- Migration guides
- Deprecation notices
- Version compatibility matrix

## Technology Radar

### Adopt
- Technologies ready for production use
- Proven in similar projects
- Strong community support

### Trial
- Technologies worth exploring
- Low-risk projects
- Evaluation period: 3-6 months

### Assess
- Technologies worth monitoring
- Research and evaluate
- Not ready for production

### Hold
- Technologies to avoid
- Being phased out
- Better alternatives exist

## Best Practices

### Version Pinning
```python
# requirements.txt
package==1.2.3    # Exact version
package~=1.2.0    # Compatible release
package>=1.2.0    # Minimum version
```

### Lock Files
- Use `package-lock.json` (npm)
- Use `poetry.lock` (Python)
- Use `go.sum` (Go)
- Commit lock files to version control

### Regular Updates
```bash
# Update check
npm outdated
pip list --outdated

# Update packages
npm update
pip install --upgrade package
```

## Resources

- **Semantic Versioning**: https://semver.org/
- **Keep a Changelog**: https://keepachangelog.com/
- **ADR GitHub**: https://github.com/adr/madr
- **ThoughtWorks Radar**: https://www.thoughtworks.com/radar
