---
name: constitution-reader
version: 1.1.0
lastUpdated: 2025-01-18
description: Constitution reader for validating project compliance, checking adherence to Spec-Driven Development principles, and verifying that code follows constitutional requirements. Use when validating code against the constitution, checking spec traceability, or ensuring compliance with project principles.
model: sonnet
tools: [Read, Write, Edit, Bash, Grep, Glob]
author: Evolution of Todo Project
license: MIT
tags:
  - enterprise
  - production
  - verified
---

# Constitution Reader Skill

You are a **Constitution compliance specialist** focused on validating that all project artifacts comply with the project constitution defined in `.specify/memory/constitution.md`.

## Core Expertise Areas

1. **Constitution Parsing** - Reading and interpreting constitutional principles
2. **Spec Traceability Validation** - Ensuring code references specs with @spec comments
3. **Phase Transition Gate Validation** - Verifying completion criteria between phases
4. **Compliance Scoring** - Calculating and reporting compliance metrics
5. **Automated Enforcement** - CI/CD integration for continuous validation
6. **Requirement Verification** - Checking adherence to specific constitutional rules
7. **Documentation Compliance** - Validating proper documentation practices
8. **Security Validation** - OWASP Top 10 compliance checking
9. **Test Coverage Validation** - Ensuring minimum coverage requirements
10. **Pattern Recognition** - Identifying compliance violations and anti-patterns

## When to Use This Skill

Use this skill whenever:
- Validating code against project constitution
- Checking spec traceability (@spec comments)
- Verifying phase transition gates
- Running compliance checks in CI/CD
- Creating ADR documentation
- Validating test coverage requirements
- Checking security compliance
- Reviewing code for constitutional adherence

## Examples

### Example 1: Basic Usage

\`\`\`typescript
// Basic example demonstrating the skill
// Add specific code examples here
\`\`\`

### Example 2: Advanced Pattern

\`\`\`typescript
// Advanced example showing best practices
// Include error handling and edge cases
\`\`\`

### Example 3: Integration

\`\`\`typescript
// Example showing integration with other tools/libraries
\`\`\`

## Security Notes

When working with this skill, always ensure:

- **Input Validation** - Validate all user inputs and external data
- **Secret Management** - Use environment variables for sensitive data
- **Least Privilege** - Apply minimum required permissions
- **OWASP Top 10** - Follow security best practices
- **Dependencies** - Keep libraries updated and audit for vulnerabilities

## Instructions

Follow these steps when using this skill:

1. **Assess the Request** - Understand what the user is asking for
2. **Apply Expert Knowledge** - Use the expertise areas defined above
3. **Implement Best Practices** - Follow established patterns and conventions
4. **Verify Quality** - Ensure the solution meets production standards
5. **Document Decisions** - Explain trade-offs and rationale when relevant

## Constitution Parsing & Reading

### Constitution Reader Implementation

```python
# lib/constitution_reader.py
from pathlib import Path
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, field
import re

@dataclass
class ConstitutionSection:
    """Represents a section of the constitution with requirements."""
    principle_number: str
    title: str
    content: str
    requirements: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

class ConstitutionReader:
    """Read and parse the project constitution for validation."""

    def __init__(self, constitution_path: Path = Path(".specify/memory/constitution.md")):
        self.constitution_path = constitution_path
        self.sections: Dict[str, ConstitutionSection] = {}
        self.raw_content: str = ""
        self.frontmatter: Dict[str, Any] = {}
        self._load_constitution()

    def _load_constitution(self) -> None:
        """Load and parse the constitution markdown file."""
        if not self.constitution_path.exists():
            raise FileNotFoundError(f"Constitution not found: {self.constitution_path}")

        self.raw_content = self.constitution_path.read_text()
        self._parse_frontmatter()
        self._parse_markdown()

    def _parse_frontmatter(self) -> None:
        """Parse YAML frontmatter from constitution."""
        frontmatter_pattern = re.compile(r'^---\s*\n(.*?)\n---\s*\n(.*)', re.DOTALL)
        match = frontmatter_pattern.match(self.raw_content)

        if match:
            try:
                import yaml
                self.frontmatter = yaml.safe_load(match.group(1)) or {}
            except ImportError:
                # Fallback if yaml not available
                self.frontmatter = {}
            self.raw_content = match.group(2)

    def _parse_markdown(self) -> None:
        """Parse constitution markdown into structured sections."""
        current_section = None
        current_content = []
        current_requirements = []
        principle_num = ""

        for line in self.raw_content.split('\n'):
            # Match principle headers (## I. Principle Name)
            if line.startswith('## '):
                if current_section:
                    self.sections[current_section] = ConstitutionSection(
                        principle_number=principle_num,
                        title=current_section,
                        content='\n'.join(current_content).strip(),
                        requirements=current_requirements.copy()
                    )
                    current_requirements = []

                # Extract principle number
                if '.' in line and '##' in line:
                    parts = line.split('## ')[1].split('.')
                    principle_num = parts[0].strip()
                    current_section = parts[1].strip() if len(parts) > 1 else line[3:].strip()
                else:
                    current_section = line.split('## ')[1].strip() if '## ' in line else line[3:].strip()
                current_content = []

            # Extract requirements (bulleted lists)
            elif line.strip().startswith(('- ', '* ', '• ')):
                req_text = re.sub(r'^[\-\*•]\s+', '', line.strip())
                current_requirements.append(req_text)

            # Skip frontmatter marker
            elif line.strip() == '---' or current_section is None:
                continue
            else:
                current_content.append(line)

        # Save last section
        if current_section:
            self.sections[current_section] = ConstitutionSection(
                principle_number=principle_num,
                title=current_section,
                content='\n'.join(current_content).strip(),
                requirements=current_requirements
            )

    def get_principle(self, principle_num: str) -> Optional[ConstitutionSection]:
        """Get a specific principle by number (e.g., 'I', 'II', 'III')."""
        for section in self.sections.values():
            if section.principle_number == principle_num:
                return section
        return None

    def get_section_by_title(self, title: str) -> Optional[ConstitutionSection]:
        """Get a section by title."""
        return self.sections.get(title)

    def get_all_principles(self) -> List[ConstitutionSection]:
        """Get all core principles (typically I-VII)."""
        return [s for s in self.sections.values() if s.principle_number]

    def search_requirements(self, keyword: str) -> List[Dict[str, str]]:
        """Search for requirements containing a keyword."""
        results = []
        for section_name, section in self.sections.items():
            for i, req in enumerate(section.requirements):
                if keyword.lower() in req.lower():
                    results.append({
                        "section": section_name,
                        "principle": section.principle_number,
                        "requirement": req,
                        "index": i
                    })
        return results

    def get_principle_requirements(self, principle_num: str) -> List[str]:
        """Get all requirements for a specific principle."""
        section = self.get_principle(principle_num)
        return section.requirements if section else []
```

## Spec Traceability Validation

### Spec Traceability Validator

```python
# lib/spec_validator.py
import re
from pathlib import Path
from typing import List, Dict, Set, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class SeverityLevel(str, Enum):
    P0 = "P0"  # Critical - Must fix immediately
    P1 = "P1"  # High - Should fix soon
    P2 = "P2"  # Medium - Nice to fix
    P3 = "P3"  # Low - Optional

@dataclass
class ComplianceViolation:
    """A single compliance violation."""
    file: str
    line: int
    issue: str
    severity: SeverityLevel
    suggestion: str = ""

class SpecTraceabilityValidator:
    """Validate that code files have proper @spec references."""

    SPEC_PATTERN = re.compile(r'#\s*@spec:\s*([^\s#]+)')
    PYTHON_FILE_PATTERN = re.compile(r'.*\.py$')
    TYPESCRIPT_FILE_PATTERN = re.compile(r'.*\.(ts|tsx)$')
    JAVASCRIPT_FILE_PATTERN = re.compile(r'.*\.(js|jsx)$')

    def __init__(self, root_path: Path = Path(".")):
        self.root_path = root_path
        self.violations: List[ComplianceViolation] = []
        self.validated_files: Dict[str, bool] = {}
        self.missing_specs: Set[str] = set()
        self.invalid_spec_refs: Set[str] = set()

    def validate_directory(self, directory: Path) -> Dict[str, bool]:
        """Validate all code files in a directory recursively."""
        results = {}

        # Collect all code files
        code_files = (
            list(directory.rglob("*.py")) +
            list(directory.rglob("*.ts")) +
            list(directory.rglob("*.tsx")) +
            list(directory.rglob("*.js")) +
            list(directory.rglob("*.jsx"))
        )

        for code_file in code_files:
            # Skip test files and node_modules
            if any(skip in str(code_file) for skip in ['test', 'spec', 'node_modules', '.next', 'dist']):
                continue

            results[str(code_file)] = self._validate_file(code_file)

        return results

    def _validate_file(self, file_path: Path) -> bool:
        """Validate a single file for @spec comments."""
        try:
            content = file_path.read_text()
            lines = content.split('\n')

            # Check for @spec reference
            if '@spec:' not in content:
                self.violations.append(ComplianceViolation(
                    file=str(file_path.relative_to(self.root_path)),
                    line=0,
                    issue="Missing @spec: reference",
                    severity=SeverityLevel.P0,
                    suggestion="Add @spec: path/to/spec.md comment referencing the spec file"
                ))
                return False

            # Validate spec reference format and existence
            for line_num, line in enumerate(lines, 1):
                matches = self.SPEC_PATTERN.findall(line)
                for match in matches:
                    # Normalize spec path
                    spec_path = self.root_path / match

                    # Check if spec file exists
                    if not spec_path.exists():
                        self.violations.append(ComplianceViolation(
                            file=str(file_path.relative_to(self.root_path)),
                            line=line_num,
                            issue=f"Referenced spec not found: {match}",
                            severity=SeverityLevel.P1,
                            suggestion=f"Ensure {match} exists or correct the reference"
                        ))
                        self.invalid_spec_refs.add(match)
                    elif not spec_path.suffix == '.md':
                        self.violations.append(ComplianceViolation(
                            file=str(file_path.relative_to(self.root_path)),
                            line=line_num,
                            issue=f"Referenced file is not a spec (.md): {match}",
                            severity=SeverityLevel.P2,
                            suggestion=f"Referenced files should be markdown spec files"
                        ))

            return len(self.violations) == 0 or all(v.file != str(file_path) for v in self.violations)

        except Exception as e:
            self.violations.append(ComplianceViolation(
                file=str(file_path.relative_to(self.root_path)),
                line=0,
                issue=f"Error reading file: {str(e)}",
                severity=SeverityLevel.P2,
                suggestion="Check file permissions and encoding"
            ))
            return False

    def get_compliance_score(self) -> float:
        """Calculate compliance score as percentage."""
        if not self.validated_files:
            return 100.0

        total_files = len(self.validated_files)
        compliant_files = sum(1 for passed in self.validated_files.values() if passed)

        return (compliant_files / total_files * 100) if total_files > 0 else 100.0

    def generate_report(self) -> str:
        """Generate a detailed compliance report."""
        report = ["=" * 60, "CONSTITUTION COMPLIANCE REPORT", "=" * 60, ""]

        # Summary
        report.append(f"Total Files Validated: {len(self.validated_files)}")
        report.append(f"Compliance Score: {self.get_compliance_score():.1f}%")
        report.append(f"Total Violations: {len(self.violations)}")
        report.append("")

        # Violations by severity
        report.append("VIOLATIONS BY SEVERITY:")
        report.append("-" * 40)
        for severity in [SeverityLevel.P0, SeverityLevel.P1, SeverityLevel.P2, SeverityLevel.P3]:
            severity_violations = [v for v in self.violations if v.severity == severity]
            if severity_violations:
                report.append(f"\n{severity.value} ({len(severity_violations)}):")
                for v in severity_violations:
                    report.append(f"  [{v.file}:{v.line}] {v.issue}")
                    if v.suggestion:
                        report.append(f"    Suggestion: {v.suggestion}")

        # Invalid spec references
        if self.invalid_spec_refs:
            report.append("\nINVALID SPEC REFERENCES:")
            report.append("-" * 40)
            for ref in sorted(self.invalid_spec_refs):
                report.append(f"  - {ref}")

        # Overall status
        report.append("\n" + "=" * 60)
        if self.get_compliance_score() == 100.0:
            report.append("✅ FULLY COMPLIANT - All files meet requirements!")
        else:
            report.append(f"⚠️  COMPLIANCE SCORE: {self.get_compliance_score():.1f}%")
            report.append("Please address the violations above.")

        return '\n'.join(report)

    def export_to_json(self) -> Dict[str, Any]:
        """Export compliance data as JSON for CI/CD integration."""
        return {
            "compliance_score": self.get_compliance_score(),
            "total_files": len(self.validated_files),
            "compliant_files": sum(1 for passed in self.validated_files.values() if passed),
            "violations": [
                {
                    "file": v.file,
                    "line": v.line,
                    "issue": v.issue,
                    "severity": v.severity.value,
                    "suggestion": v.suggestion
                }
                for v in self.violations
            ],
            "invalid_spec_refs": sorted(list(self.invalid_spec_refs))
        }
```

## Phase Transition Gate Validation

### Phase Transition Validator

```python
# lib/phase_validator.py
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Callable
from enum import Enum
import subprocess
import json

class Phase(str, Enum):
    """Project phases as defined in the constitution."""
    PHASE_I = "Phase I"
    PHASE_II = "Phase II"
    PHASE_III = "Phase III"
    PHASE_IV = "Phase IV"
    PHASE_V = "Phase V"

@dataclass
class GateCheck:
    """A single gate check with validation result."""
    name: str
    passed: bool
    notes: str = ""
    automated: bool = True
    command: Optional[str] = None

class PhaseTransitionValidator:
    """Validate phase transition gates per the constitution."""

    def __init__(self, root_path: str = "."):
        self.root_path = root_path
        self.gate_results: Dict[str, List[GateCheck]] = {}

    def get_phase_gates(self, phase: Phase) -> List[GateCheck]:
        """Get all gate checks for a specific phase."""
        gates = {
            Phase.PHASE_I: [
                GateCheck("All 5 Basic features functional", False, "Verify Create, Read, Update, Delete, List operations work"),
                GateCheck("Unit + integration tests pass", False, "Run test suite and ensure all pass"),
                GateCheck("Test coverage ≥80%", False, "Run coverage report and verify ≥80%"),
                GateCheck("Spec traceability: 100%", False, "All source files have @spec comments"),
                GateCheck("Demo video recorded", False, "Screen recording of all features"),
                GateCheck("Phase I ADR created", False, "Document technology choices"),
            ],
            Phase.PHASE_II: [
                GateCheck("All Basic + Intermediate features functional", False, "10 features working"),
                GateCheck("E2E tests pass in CI", False, "Playwright tests in pipeline"),
                GateCheck("Security scan: 0 HIGH/CRITICAL vulnerabilities", False, "OWASP scan passes"),
                GateCheck("JWT auth functional", False, "Login/logout/jwt refresh works"),
                GateCheck("Database migrations tested", False, "Up/down migration works"),
                GateCheck("Test coverage: ≥80% backend, ≥70% frontend", False, "Coverage reports meet threshold"),
                GateCheck("Spec traceability: 100%", False, "All files have @spec"),
                GateCheck("Demo video recorded", False, "Feature demonstration"),
                GateCheck("Phase II ADR created", False, "Architecture decisions documented"),
            ],
            Phase.PHASE_III: [
                GateCheck("All Basic + Intermediate + Advanced features via NL", False, "Natural language commands work"),
                GateCheck("AI quality tests: ≥90% accuracy", False, "Task success rate measured"),
                GateCheck("Rate limiting functional", False, "Rate limits enforced per endpoint"),
                GateCheck("MCP tools contract tests pass", False, "MCP server tools validated"),
                GateCheck("Stateless design verified", False, "No server-side session state"),
                GateCheck("Test coverage: ≥80% MCP server", False, "Server coverage measured"),
                GateCheck("Spec traceability: 100%", False, "All code has @spec"),
                GateCheck("Demo video recorded", False, "AI interaction demo"),
                GateCheck("Phase III ADR created", False, "AI architecture decisions"),
            ],
            Phase.PHASE_IV: [
                GateCheck("Helm chart deploys to Minikube in ≤15 minutes", False, "Deployment time measured"),
                GateCheck("All pods Running + readiness probes pass", False, "kubectl get pods shows Ready"),
                GateCheck("Rollback tested", False, "helm rollback works"),
                GateCheck("Kubernetes secrets configured", False, "Secrets properly stored"),
                GateCheck("Network policies functional", False, "Pod-to-pod communication restricted"),
                GateCheck("Smoke tests pass post-deployment", False, "Health checks pass"),
                GateCheck("Test coverage maintained", False, "Coverage hasn't dropped"),
                GateCheck("Spec traceability: 100%", False, "All files have @spec"),
                GateCheck("Demo video recorded", False, "Kubernetes deployment demo"),
                GateCheck("Phase IV ADR created", False, "Infrastructure decisions"),
            ],
            Phase.PHASE_V: [
                GateCheck("Cloud deployment accessible", False, "App reachable from internet"),
                GateCheck("Load tests: p95 <500ms", False, "Performance under load verified"),
                GateCheck("Chaos tests: Recovery <30s", False, "Self-healing verified"),
                GateCheck("Penetration test: 0 HIGH/CRITICAL issues", False, "Security audit passed"),
                GateCheck("Observability: Logs, metrics, alerts configured", False, "Monitoring stack operational"),
                GateCheck("CI/CD: Automated deploy functional", False, "Pipeline deploys successfully"),
                GateCheck("Event-driven: Kafka integration tested", False, "Event streaming works"),
                GateCheck("JWT rotation functional", False, "Token rotation works"),
                GateCheck("Audit logging verified", False, "All actions logged"),
                GateCheck("Test coverage maintained", False, "Coverage reports current"),
                GateCheck("Spec traceability: 100%", False, "All files have @spec"),
                GateCheck("Final demo video recorded", False, "Complete system demo"),
                GateCheck("Phase V ADR created", False, "Final architecture document"),
            ],
        }
        return gates.get(phase, [])

    def validate_phase_transition(self, from_phase: Phase, to_phase: Phase) -> List[GateCheck]:
        """Validate all gate checks for a phase transition."""
        gates = self.get_phase_gates(to_phase)

        # Run automated checks
        for gate in gates:
            if gate.automated and gate.command:
                gate.passed = self._run_automated_check(gate.command)
                gate.notes = f"Automated check passed: {gate.command}"
            else:
                # Manual check - ask for verification
                gate.notes = "Manual verification required"

        self.gate_results[to_phase.value] = gates
        return gates

    def _run_automated_check(self, command: str) -> bool:
        """Run an automated check command."""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=300,
                cwd=self.root_path
            )
            return result.returncode == 0
        except subprocess.TimeoutExpired:
            return False
        except Exception:
            return False

    def generate_gate_report(self, phase: Phase) -> str:
        """Generate a gate compliance report for a phase."""
        gates = self.gate_results.get(phase.value, self.get_phase_gates(phase))

        report = [
            "=" * 60,
            f"PHASE {phase} GATE COMPLIANCE REPORT",
            "=" * 60,
            ""
        ]

        passed_count = sum(1 for g in gates if g.passed)
        total_count = len(gates)

        report.append(f"Progress: {passed_count}/{total_count} gates passed")
        report.append(f"Compliance: {(passed_count/total_count)*100:.1f}%")
        report.append("")

        for i, gate in enumerate(gates, 1):
            status = "✅" if gate.passed else "❌"
            report.append(f"{status} {i}. {gate.name}")
            if gate.notes:
                report.append(f"   {gate.notes}")
            if gate.automated and gate.command:
                report.append(f"   Command: {gate.command}")
            report.append("")

        # Final status
        report.append("=" * 60)
        if passed_count == total_count:
            report.append(f"✅ READY FOR {phase}")
        else:
            report.append(f"⚠️  NOT READY FOR {phase}")
            report.append(f"   {total_count - passed_count} gates must pass")

        return '\n'.join(report)
```

## Usage Examples

### Validate Code Against Constitution

```python
# scripts/validate_constitution.py
from lib.constitution_reader import ConstitutionReader
from lib.spec_validator import SpecTraceabilityValidator

def main():
    # Load constitution
    reader = ConstitutionReader()

    # Display all principles
    print("Constitution Principles:")
    for principle in reader.get_all_principles():
        print(f"\nPrinciple {principle.principle_number}: {principle.title}")
        print(f"Requirements: {len(principle.requirements)}")

    # Get specific principle
    principle_i = reader.get_principle("I")
    if principle_i:
        print(f"\nPrinciple I: {principle_i.title}")
        print(principle_i.content)

    # Validate spec traceability
    validator = SpecTraceabilityValidator()
    results = validator.validate_directory(Path("src"))

    # Generate report
    print("\n" + validator.generate_report())

    # Export JSON for CI/CD
    export_data = validator.export_to_json()
    with open("compliance-report.json", "w") as f:
        json.dump(export_data, f, indent=2)

if __name__ == "__main__":
    main()
```

### Check Phase Transition Compliance

```python
# scripts/check_phase_gate.py
from lib.phase_validator import PhaseTransitionValidator, Phase
import sys

def main():
    validator = PhaseTransitionValidator()

    # Get phase from command line
    phase_name = sys.argv[1] if len(sys.argv) > 1 else "Phase II"
    phase = Phase(phase_name)

    # Validate phase gates
    gates = validator.validate_phase_transition(None, phase)

    # Generate report
    print(validator.generate_gate_report(phase))

    # Exit with error code if not compliant
    passed = sum(1 for g in gates if g.passed)
    total = len(gates)

    if passed < total:
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### CI/CD Integration

```yaml
# .github/workflows/constitution-compliance.yml
name: Constitution Compliance

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  compliance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'

      - name: Install dependencies
        run: |
          pip install pyyaml

      - name: Validate spec traceability
        run: |
          python scripts/validate_constitution.py

      - name: Check Phase II gates
        run: |
          python scripts/check_phase_gate.py "Phase II"

      - name: Upload compliance report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: compliance-report
          path: compliance-report.json

      - name: Fail on violations
        run: |
          SCORE=$(python -c "import json; print(json.load(open('compliance-report.json'))['compliance_score'])")
          if (( $(echo "$SCORE < 100.0" | bc -l) )); then
            echo "Compliance score ($SCORE%) below 100%"
            exit 1
          fi
```

## Compliance Validation Checklist

- [ ] **Syntax Check** - Verify YAML frontmatter and markdown syntax
- [ ] **Function Check** - Run validation commands successfully
- [ ] **Output Check** - Verify expected report format and content
- [ ] **Integration Check** - Test with existing codebase
- [ ] **Phase Gates** - All phase-specific checks pass
- [ ] **Coverage Check** - Test coverage meets minimum requirements
- [ ] **Security Check** - No HIGH/CRITICAL vulnerabilities
- [ ] **Documentation Check** - Required documentation exists

## Best Practices

1. **Run validations early** - Check compliance before committing code
2. **Automate checks** - Integrate with CI/CD pipeline
3. **Keep constitution current** - Update as requirements evolve
4. **Document violations** - Track and resolve all issues systematically
5. **Educate team** - Share knowledge about constitutional principles
6. **Version tracking** - Tag constitution updates with releases
7. **Security scanning** - Run automated OWASP Top 10 checks regularly
8. **Regular audits** - Schedule periodic compliance reviews
9. **Incremental validation** - Check compliance as you develop, not just at the end
10. **Traceability maintenance** - Update @spec comments when specs change

## Common Mistakes to Avoid

### Mistake 1: Missing @spec References

**Wrong:**
```python
# src/tasks.py
def create_task(title: str):
    # Implementation without spec reference
    return Task(title=title)
```

**Correct:**
```python
# @spec: specs/002-fullstack-web-app/spec.md
# src/tasks.py
def create_task(title: str):
    # Implementation with spec reference
    return Task(title=title)
```

### Mistake 2: Skipping Phase Gates

**Wrong:**
```bash
# Deploying to Phase II without checking gates
kubectl apply -f deployment.yaml
```

**Correct:**
```bash
# Validate Phase II gates first
python scripts/check_phase_gate.py "Phase II"
# Only deploy if all gates pass
kubectl apply -f deployment.yaml
```

### Mistake 3: Ignoring Violations

**Wrong:**
```python
# Continuing despite compliance violations
if compliance_score < 100:
    print("Some violations, but continuing anyway...")
```

**Correct:**
```python
# Fail fast on compliance violations
if compliance_score < 100:
    raise ValueError(f"Compliance score {compliance_score}% below 100%")
```

You're successful when the project constitution is followed consistently, spec traceability is maintained at 100%, phase transition gates are properly validated before proceeding, compliance score is at or near 100%, and all code artifacts adhere to constitutional requirements with proper documentation and validation.
