#!/bin/bash
# Spec-Driven Development Project Initializer
# Creates SDD project structure

set -e

PROJECT_NAME=${1:-my-project}
FEATURE_NAME=${2:-my-feature}

echo "Initializing Spec-Driven Development project..."

# Create directory structure
mkdir -p "specs/$FEATURE_NAME"
mkdir -p "history/prompts/$FEATURE_NAME"
mkdir -p "history/adr"
mkdir -p ".specify/memory"
mkdir -p ".specify/templates"

# Create constitution
cat > ".specify/memory/constitution.md" << EOF
# $PROJECT_NAME Constitution

## Principles
1. **Spec-Driven Development** - All work starts with a spec
2. **Test-First** - Tests are written before implementation
3. **Documentation** - All decisions are documented
4. **Traceability** - Code references requirements with @spec tags
5. **Quality** - Code must meet coverage and quality standards

## Process
1. Create spec.md for requirements
2. Create plan.md for architecture
3. Create tasks.md for implementation
4. Implement with @spec tags
5. Create PHR for every interaction
6. Create ADR for significant decisions
EOF

# Create spec template
cat > ".specify/templates/spec-template.md" << EOF
# Feature: $FEATURE_NAME

## Overview
[Brief description]

## Requirements

### Functional Requirements (FR)
- FR-001: [Description]
- FR-002: [Description]

### Non-Functional Requirements (NFR)
- NFR-001: [Performance/Security/Reliability] - [Metric]
- NFR-002: [Performance/Security/Reliability] - [Metric]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Dependencies
- [Internal dependencies]
- [External dependencies]

## Out of Scope
- [What's not included]

## Risks
1. [Risk] - [Mitigation]
EOF

# Create spec.md
cat > "specs/$FEATURE_NAME/spec.md" << EOF
# Feature: $FEATURE_NAME

## Overview
[TODO: Add feature overview]

## Requirements

### Functional Requirements (FR)
[TODO: Define functional requirements]

### Non-Functional Requirements (NFR)
[TODO: Define non-functional requirements]

## Acceptance Criteria
[TODO: Define acceptance criteria]

## Dependencies
[TODO: List dependencies]

## Out of Scope
[TODO: Define what's out of scope]

## Risks
[TODO: Identify risks and mitigations]
EOF

# Create plan.md
cat > "specs/$FEATURE_NAME/plan.md" << EOF
# Architecture Plan: $FEATURE_NAME

## Overview
[TODO: Add architecture overview]

## Technology Choices
[TODO: Document technology decisions]

## Architecture Diagram
[TODO: Add architecture diagram]

## API Contracts
[TODO: Define API contracts]

## Data Model
[TODO: Define data model]

## Implementation Phases
[TODO: Define implementation phases]

## Security Considerations
[TODO: Document security considerations]

## Migration Strategy
[TODO: Define migration strategy]
EOF

# Create tasks.md
cat > "specs/$FEATURE_NAME/tasks.md" << EOF
# Implementation Tasks

## Task 1: [Task Title]

**Priority:** High
**Complexity:** Medium
**Estimate:** X hours

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

**Implementation Notes:**
\`\`\`
// @spec:FR-001
// Implementation approach
\`\`\`

**Related Requirements:**
- FR-001

**Verification:**
\`\`\`bash
# Verification command
\`\`\`

---

## Definition of Done
- [ ] All acceptance criteria pass
- [ ] All tests pass
- [ ] Code coverage ≥ 80%
- [ ] Documentation complete
- [ ] PHR created
EOF

echo "✅ SDD project initialized for $PROJECT_NAME/$FEATURE_NAME"
