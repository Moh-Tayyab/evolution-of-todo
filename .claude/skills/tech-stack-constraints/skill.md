---
name: tech-stack-constraints-expert
description: >
  Expert-level technology constraints management with migration strategies,
  deprecation planning, version policies, dependency auditing,
  architectural guidelines, and compatibility enforcement.
---

# Tech Stack Constraints Expert Skill

You are a **Technology Governance principal engineer** specializing in technology management and architectural governance.

## Core Responsibilities

### 1.1 Technology Governance Framework

```markdown
# Technology Governance Principles

## 1. Approval Process
- All new technologies must go through RFC (Request for Comments)
- Evaluation criteria: security, maintainability, ecosystem support, licensing
- Decision threshold: 2/3 approval from Architecture Review Board

## 2. Technology Tiers
- **Tier 1 (Approved)**: Production-ready, fully supported
- **Tier 2 (Eval)**: Under evaluation for specific use cases
- **Tier 3 (Sunset)**: Deprecated, migration required by [date]

## 3. Version Policies
- Major version upgrades: Quarterly review, RFC required
- Minor/patch versions: Automatic within major version
- Breaking changes: Migration guide required, 6-month notice
```

```python
# tech_stack/governance.py
from enum import Enum
from dataclasses import dataclass

class TechTier(Enum):
    APPROVED = "approved"  # Production-ready
    EVAL = "eval"  # Under evaluation
    SUNSET = "sunset"  # Deprecated

@dataclass
class Technology:
    """Technology definition with constraints."""
    name: str
    category: str  # "frontend", "backend", "database", "infrastructure"
    tier: TechTier
    min_version: str
    max_version: str
    approved_date: str | None = None
    sunset_date: str | None = None
    migration_required: bool = False
    approved_for: list[str] = None  # ["web-app", "api", "ml"]
    notes: str = ""

class TechnologyGovernance:
    """Technology governance enforcement."""

    # Approved technology catalog
    APPROVED_TECH = {
        # Frontend
        Technology(
            name="Next.js",
            category="frontend",
            tier=TechTier.APPROVED,
            min_version="15.0.0",
            max_version="15.x",
            approved_for=["web-app"],
        ),
        Technology(
            name="React",
            category="frontend",
            tier=TechTier.APPROVED,
            min_version="18.0.0",
            max_version="18.x",
            approved_for=["web-app"],
        ),
        # Backend
        Technology(
            name="FastAPI",
            category="backend",
            tier=TechTier.APPROVED,
            min_version="0.100.0",
            max_version="0.x",
            approved_for=["api", "microservice"],
        ),
        # Database
        Technology(
            name="PostgreSQL",
            category="database",
            tier=TechTier.APPROVED,
            min_version="15.0",
            max_version="15.x",
            approved_for=["relational", "transactional"],
        ),
        Technology(
            name="Neon",
            category="database",
            tier=TechTier.APPROVED,
            min_version="1.0.0",
            max_version="1.x",
            approved_for=["serverless", "edge"],
        ),
        # ORM
        Technology(
            name="Drizzle ORM",
            category="orm",
            tier=TechTier.APPROVED,
            min_version="0.28.0",
            max_version="0.x",
            approved_for=["postgresql", "typescript"],
        ),
    }

    # Sunset technologies
    SUNSET_TECH = {
        Technology(
            name="jQuery",
            category="frontend",
            tier=TechTier.SUNSET,
            sunset_date="2023-12-31",
            migration_required=True,
            notes="Migrate to vanilla JS or React",
        ),
        Technology(
            name="MongoDB",
            category="database",
            tier=TechTier.SUNSET,
            sunset_date="2024-06-30",
            migration_required=True,
            approved_for=["legacy-only"],
        ),
    }

    @classmethod
    def is_approved(cls, tech_name: str, version: str) -> bool:
        """Check if technology is approved."""
        tech = cls.APPROVED_TECH.get(tech_name)
        if not tech:
            return False

        return cls._version_within_range(
            version,
            tech.min_version,
            tech.max_version
        )

    @classmethod
    def get_version_requirement(cls, tech_name: str) -> dict[str, str]:
        """Get version requirements for technology."""
        tech = cls.APPROVED_TECH.get(tech_name)
        if not tech:
            raise ValueError(f"Technology {tech_name} not approved")

        return {
            "min_version": tech.min_version,
            "max_version": tech.max_version,
            "recommended": f"{tech.min_version}+",
        }

    @staticmethod
    def _version_within_range(version: str, min_ver: str, max_ver: str) -> bool:
        """Check if version is within allowed range."""
        from packaging import version as pkg_version
        v = pkg_version.parse(version)
        min_v = pkg_version.parse(min_ver)
        max_v = pkg_version.parse(max_ver.replace(".x", "999"))

        return min_v <= v <= max_v
```

### 1.2 Dependency Management Strategy

```json
// package.json with strict version policies
{
  "engines": {
    "node": ">=18.0.0 <21.0.0",
    "pnpm": ">=8.0.0 <10.0.0"
  },
  "dependencies": {
    "next": "15.0.0",  // Exact version for framework
    "react": "^18.0.0",  // Allow minor updates
    "react-dom": "^18.0.0",
    "typescript": "~5.3.0",  // Allow patch updates only
    "@tanstack/react-query": "^5.0.0",
    "drizzle-orm": "^0.30.0",
    "@neondatabase/serverless": "^0.9.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "overrides": {
    // Pin indirect dependencies
    "some-indirect-dep": "1.2.3"
  },
  "pnpm": {
    "overrides": {
      // Enforce specific versions globally
      "react": "18.2.0",
      "react-dom": "18.2.0"
    }
  }
}
```

```python
# pyproject.toml with version constraints
[project]
name = "todo-api"
requires-python = ">=3.11 <3.13"
version = "1.0.0"

[project.dependencies]
fastapi = ">=0.100.0 <0.200.0"
sqlalchemy = ">=2.0.0 <3.0.0"
drizzle-orm = ">=0.28.0 <1.0.0"
pydantic = ">=2.0.0 <3.0.0"
uvicorn = {extras = ["standard"], version = ">=0.23.0 <1.0.0"}

[project.optional-dependencies]
redis = ">=5.0.0 <6.0.0"  # Caching
celery = ">=5.3.0 <6.0.0"  # Background tasks

[project.group.dev.dependencies]
pytest = ">=7.4.0 <8.0.0"
ruff = ">=0.1.0 <1.0.0"
mypy = ">=1.6.0 <2.0.0"

[tool.poetry.dependencies]
# Lock exact versions for critical deps
drizzle-orm = {version = "0.30.0", markers = "core"}
```

### 1.3 Migration Planning & Execution

```python
# tech_stack/migration.py
from dataclasses import dataclass
from datetime import date
from typing import Optional

@dataclass
class MigrationPlan:
    """Technology migration plan."""
    source_tech: Technology
    target_tech: Technology
    breaking_changes: list[str]
    migration_steps: list[str]
    rollout_date: date
    deadline: date
    resources: list[str]  # Links to docs, guides

class MigrationFramework:
    """Framework for technology migrations."""

    # Migration templates
    TEMPLATES = {
        "major_version_upgrade": """
        ## Migration: {source} v{from_ver} → {target} v{to_ver}

        ### Timeline
        - Phase 1 (Week 1-2): Add new dependency side-by-side
        - Phase 2 (Week 3-4): Migrate existing code
        - Phase 3 (Week 5): Remove old dependency
        - Phase 4 (Week 6): Cleanup and monitoring

        ### Breaking Changes
        {changes}

        ### Migration Guide
        {steps}

        ### Rollback Plan
        If issues occur:
        1. Revert feature flags
        2. Roll back deployment
        3. Investigate and retry
        """,
    "deprecation_removal": """
        ## Deprecation Notice: {tech}

        ### Status: Sunset by {date}

        ### Migration Required
        {tech} is deprecated and will be removed on {date}.
        Please migrate to {alternative}.

        ### Migration Steps
        {steps}
        """,
    }

    @classmethod
    def create_migration_plan(
        cls,
        source_tech: str,
        source_ver: str,
        target_tech: str,
        target_ver: str
    ) -> MigrationPlan:
        """Create migration plan for technology upgrade."""
        # Get breaking changes from changelog
        breaking_changes = cls._get_breaking_changes(
            source_tech, source_ver, target_tech, target_ver
        )

        # Generate migration steps
        steps = cls._generate_migration_steps(
            source_tech, source_ver, target_tech, target_ver
        )

        # Calculate timeline
        from datetime import date, timedelta
        today = date.today()
        rollout_date = today + timedelta(weeks=2)
        deadline = today + timedelta(weeks=12)

        return MigrationPlan(
            source_tech=Technology(source_tech, ...),
            target_tech=Technology(target_tech, ...),
            breaking_changes=breaking_changes,
            migration_steps=steps,
            rollout_date=rollout_date,
            deadline=deadline,
            resources=[...],
        )

    @staticmethod
    def _get_breaking_changes(
        source: str,
        from_ver: str,
        target: str,
        to_ver: str
    ) -> list[str]:
        """Get breaking changes from version comparison."""
        # Would fetch from changelog/migration guide
        # Example for Next.js 14 → 15:
        return [
            "Dynamic route syntax changed",
            "App router is now default",
            "fetch API no longer supports relative URLs",
        ]

    @staticmethod
    def _generate_migration_steps(
        source: str,
        from_ver: str,
        target: str,
        to_ver: str
    ) -> list[str]:
        """Generate step-by-step migration guide."""
        return [
            f"1. Update {source} to {to_ver}",
            f"2. Review breaking changes documentation",
            f"3. Update code affected by breaking changes",
            f"4. Run tests and fix failures",
            f"5. Enable feature flags for new features",
            f"6. Deploy to staging for validation",
            f"7. Deploy to production with monitoring",
        ]
```

### 1.4 Dependency Security Auditing

```bash
#!/bin/bash
# scripts/audit-dependencies.sh

# Frontend audit
echo "=== Auditing Node.js dependencies ==="
pnpm audit --audit-level=high

# Python audit
echo "=== Auditing Python dependencies ==="
pip-audit

# License compliance check
echo "=== Checking license compliance ==="
pnpm licenses check

# Outdated dependencies
echo "=== Checking for outdated dependencies ==="
pnpm outdated --long

# Dependency size check
echo "=== Checking bundle size impact ==="
pnpm build --stats
```

```python
# tech_stack/security.py
import subprocess
from typing import list, dict

class DependencyAuditor:
    """Audit dependencies for security issues."""

    @staticmethod
    def audit_node_deps() -> dict[str, any]:
        """Audit Node.js dependencies."""
        result = subprocess.run(
            ["pnpm", "audit", "--json"],
            capture_output=True,
            text=True,
        )

        audit_results = json.loads(result.stdout)
        return {
            "total_vulnerabilities": len(audit_results.get("vulnerabilities", [])),
            "high_severity": sum(
                1 for v in audit_results.get("vulnerabilities", [])
                if v.get("severity") == "high"
            ),
            "recommendations": audit_results.get("recommendations", []),
        }

    @staticmethod
    def audit_python_deps() -> dict[str, any]:
        """Audit Python dependencies."""
        result = subprocess.run(
            ["pip-audit", "--format", "json"],
            capture_output=True,
            text=True,
        )

        audit_results = json.loads(result.stdout)
        return {
            "total_vulnerabilities": len(audit_results.get("vulnerabilities", [])),
            "critical_severity": sum(
                1 for v in audit_results.get("vulnerabilities", [])
                if v.get("severity") == "critical"
            ),
        }

    @staticmethod
    def check_licenses() -> list[str]:
        """Check for non-compliant licenses."""
        ALLOWED_LICENSES = ["MIT", "Apache-2.0", "BSD-3-Clause", "ISC"]

        # Get all dependency licenses
        result = subprocess.run(
            ["pnpm", "licenses", "list", "--json"],
            capture_output=True,
            text=True,
        )

        licenses = json.loads(result.stdout)
        issues = [
            f"{dep}: {license}"
            for dep, license in licenses.items()
            if license not in ALLOWED_LICENSES
        ]

        return issues
```

### 1.5 Architecture Constraints Enforcement

```markdown
# Architecture Guidelines

## Code Organization
- **Frontend**: `apps/web/` - Next.js application
- **Backend**: `apps/api/` - FastAPI application
- **Shared**: `packages/shared/` - Shared utilities
- **Infrastructure**: `infra/` - Kubernetes/Helm charts

## Architectural Patterns
- **Monorepo**: Using pnpm workspaces
- **Frontend**: Server-side rendering (SSR) with App Router
- **Backend**: Service layer pattern with dependency injection
- **Database**: Repository pattern with Drizzle ORM
- **API**: RESTful with OpenAPI documentation

## Performance Requirements
- **Frontend**: First Contentful Paint (FCP) < 1.5s
- **Backend**: p95 latency < 500ms
- **Database**: Query timeout < 2s, connection pool < 20
- **Bundle**: JS bundle size < 200KB gzipped

## Security Requirements
- **Frontend**: Content Security Policy (CSP) headers
- **Backend**: OWASP Top 10 compliance
- **Auth**: JWT with refresh tokens, HTTPS only
- **Data**: Encryption at rest and in transit
```

### 1.6 Deprecation Planning

```python
# tech_stack/deprecation.py
from dataclasses import dataclass
from enum import Enum
from datetime import date, timedelta

class DeprecationPhase(Enum):
    ANNOUNCE = "announce"  # Initial announcement
    WARN = "warn"  # Warnings in logs/docs
    ERROR = "error"  # Error-level deprecation
    REMOVE = "remove"  # Removal phase

@dataclass
class DeprecationPlan:
    """Deprecation plan for technology/feature."""
    item: str  # Technology or feature name
    phase: DeprecationPhase
    announce_date: date
    warn_date: date
    error_date: date
    removal_date: date
    migration_guide: str  # URL or doc path
    contact: str  # Email or Slack channel

class DeprecationManager:
    """Manage technology deprecation lifecycle."""

    @staticmethod
    def create_deprecation_plan(
        item: str,
        removal_months: int = 6
    ) -> DeprecationPlan:
        """Create deprecation timeline."""
        from datetime import date

        today = date.today()
        return DeprecationPlan(
            item=item,
            phase=DeprecationPhase.ANNOUNCE,
            announce_date=today,
            warn_date=today + timedelta(weeks=4),
            error_date=today + timedelta(weeks=8),
            removal_date=today + timedelta(weeks=removal_months * 4),
            migration_guide=f"/docs/migrations/{item.replace(' ', '-').lower()}",
            contact="architecture-team@company.com",
        )

    @staticmethod
    def generate_deprecation_warning(plan: DeprecationPlan) -> str:
        """Generate deprecation warning message."""
        from datetime import date

        today = date.today()
        if today < plan.warn_date:
            phase = "DEPRECATED"
            level = "warning"
        elif today < plan.error_date:
            phase = "CRITICAL"
            level = "error"
        else:
            phase = "REMOVE PENDING"
            level = "critical"

        return f"""
        [{level}] {phase}: {plan.item}

        This {plan.item} will be removed on {plan.removal_date}.
        Please migrate to an alternative.

        Migration guide: {plan.migration_guide}
        Questions: {plan.contact}
        """
```

### 1.7 Version Pinning Strategy

```json
// package-lock.json pinning strategy
{
  "lockfileVersion": 3,
  "dependencies": {
    "next": {
      "version": "15.0.0",
      "resolved": "https://registry.npmjs.org/next/-/next-15.0.0.tgz",
      "integrity": "sha512-...",  // Subresource integrity
      "license": "MIT"
    }
  }
}
```

```python
# requirements.txt pinning strategy
# Production requirements (pinned versions)
fastapi==0.104.1  # Exact version for production
sqlalchemy==2.0.23
drizzle-orm==0.30.1
pydantic==2.5.2

# Development requirements (version ranges)
pytest-cov>=4.1.0,<5.0.0
ruff>=0.1.9,<0.2.0
mypy>=1.7.0,<2.0.0
```

---

## When to Use This Skill

- Validating technology choices against governance
- Managing dependency versions and upgrades
- Planning technology migrations
- Auditing dependencies for security
- Enforcing architectural constraints
- Creating deprecation timelines
- Pinning dependency versions
- Ensuring license compliance

---

## Anti-Patterns to Avoid

**Never:**
- Skip technology governance approval
- Use unapproved libraries in production
- Allow unbounded version ranges (^)
- Skip security audits before deployment
- Ignore deprecation warnings
- Direct `npm install` (use pnpm)
- Skip migration planning for breaking changes
- Use deprecated technologies
- Ignore licensing constraints

**Always:**
- Follow RFC process for new technologies
- Use exact versions for critical deps
- Pin dependencies in lock files
- Run security audits regularly
- Document breaking changes
- Create migration plans early
- Monitor deprecation notices
- Enforce architectural patterns
- Review dependency licenses
- Update dependencies via PRs

---

## Tools Used

- **Read/Grep:** Examine package files
- **Write/Edit:** Update configs, plans
- **Bash:** pnpm, pip, audit tools
- **Context7 MCP:** Node.js, Python docs

---

## Verification Process

1. **Governance:** Check tech against approved list
2. **Versions:** Verify version constraints met
3. **Security:** Run `pnpm audit` and `pip-audit`
4. **Licenses:** Check compliance with allowed licenses
5. **Migrations:** Validate migration plan steps
6. **Deprecation:** Confirm deprecation timeline documented
