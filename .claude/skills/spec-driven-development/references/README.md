# Spec-Driven Development References

Official documentation and resources for Spec-Driven Development (SDD), a methodology where all development work begins with well-defined specifications.

## Official Resources

### Spec-Driven Development Documentation
- **Spec-Driven.dev**: https://spec-driven.dev/
- **C4 Model**: https://c4model.com/
- **Writing Good Requirements**: https://www.softwaretestingfundamentals.com/requirements/
- **ADR Tools**: https://adr.github.io/

## Core Concepts

### What is Spec-Driven Development?

Spec-Driven Development (SDD) is a methodology where:
1. All work starts with a **specification** (spec.md)
2. Architecture is documented in a **plan** (plan.md)
3. Work is broken into **testable tasks** (tasks.md)
4. Every code change references its requirements
5. Architectural decisions are recorded (ADR)

### The SDD Workflow

```
User Request
     ↓
spec.md (Requirements)
     ↓
plan.md (Architecture)
     ↓
tasks.md (Implementation)
     ↓
Code with @spec tags
     ↓
PHR (Prompt History Record)
```

## Specification Structure

### spec.md Template

```markdown
# Feature: [Feature Name]

## Overview
Brief description of the feature and its purpose

## Requirements

### Functional Requirements (FR)
- FR-001: [Description] - [Priority]
- FR-002: [Description] - [Priority]

### Non-Functional Requirements (NFR)
- NFR-001: [Performance/Security/Reliability] - [Metric]
- NFR-002: [Performance/Security/Reliability] - [Metric]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Dependencies
- [Internal dependency 1]
- [External dependency 2]

## Out of Scope
- [Feature not included]
- [Edge case not handled]

## Risks
1. [Risk 1] - [Mitigation]
2. [Risk 2] - [Mitigation]
```

### Requirements Categories

**Functional Requirements (FR):**
What the system must do
- User actions and system responses
- Business rules and workflows
- Data inputs and outputs
- Integrations with other systems

**Non-Functional Requirements (NFR):**
How the system must perform
- Performance (latency, throughput)
- Security (auth, encryption, audit)
- Reliability (uptime, error handling)
- Scalability (concurrent users, data growth)
- Maintainability (code quality, documentation)

### Example Requirements

```markdown
### Functional Requirements
- FR-001: Users must be able to register with email and password
- FR-002: Users must be able to login with email and password
- FR-003: Users must receive email verification on registration
- FR-004: Users must be able to reset password via email link
- FR-005: Users must be able to logout and invalidate session

### Non-Functional Requirements
- NFR-001: Login response time < 200ms (p95)
- NFR-002: Support 10,000 concurrent users
- NFR-003: All passwords must be hashed with bcrypt (cost factor >= 12)
- NFR-004: Session timeout after 30 minutes of inactivity
- NFR-005: Rate limit failed login attempts to 5 per 15 minutes
```

## Architecture Planning

### plan.md Template

```markdown
# Architecture Plan: [Feature Name]

## Overview
Brief summary of the architecture approach

## Technology Choices

### [Component Name]
**Options Considered:**
1. **Option 1** - Chosen
   - Pros: [Advantage 1], [Advantage 2]
   - Cons: [Disadvantage 1]
2. **Option 2** - Rejected
   - Reason: [Why rejected]

**Rationale:** [Justification for choice]

### [Another Component]
[Same structure]

## Architecture Diagram
```
[ASCII or Mermaid diagram]
```

## API Contracts

### [Endpoint Name]
**Request:**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

**Response (200):**
```json
{
  "data": {},
  "meta": {}
}
```

**Error Responses:**
- 400: [Description]
- 401: [Description]
- 500: [Description]

## Data Model
```sql
-- Table structure
CREATE TABLE table_name (
  id UUID PRIMARY KEY,
  field VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Phases
1. **Phase 1**: [Description] - [Time estimate]
2. **Phase 2**: [Description] - [Time estimate]

## Security Considerations
- [Security consideration 1]
- [Security consideration 2]

## Migration Strategy
- [How to migrate from current state]
- [Rollback plan]
```

## Task Breakdown

### tasks.md Template

```markdown
# Implementation Tasks

## Task 1: [Task Title]

**Priority:** High/Medium/Low
**Complexity:** Low/Medium/High
**Estimate:** X hours

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

**Implementation Notes:**
```typescript
// @spec:FR-001, @spec:NFR-003
// Implementation approach
```

**Related Requirements:**
- FR-001
- NFR-003

**Verification:**
```bash
# How to verify completion
command to run
```

---

[Repeat for each task]

## Definition of Done
This feature is complete when:
- [ ] All acceptance criteria pass
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code coverage ≥ 80%
- [ ] Security scan passes
- [ ] Documentation is complete
- [ ] PHR is created
```

## Traceability

### Code Annotations

```typescript
/**
 * User registration handler
 * @spec FR-001: Users must be able to register with email and password
 * @spec NFR-003: All passwords must be hashed with bcrypt
 */
export async function registerUser(data: UserRegistration) {
  // Implementation
  const hashedPassword = await bcrypt.hash(data.password, 12);
  // ...
}
```

### Test Mapping

```typescript
describe('User Registration', () => {
  /**
   * @spec FR-001
   * @spec NFR-003
   */
  it('should hash password with bcrypt', async () => {
    const user = await registerUser({
      email: 'test@example.com',
      password: 'plaintext'
    });

    expect(user.passwordHash).not.toBe('plaintext');
    expect(bcrypt.compare('plaintext', user.passwordHash)).toBe(true);
  });
});
```

## Architecture Decision Records (ADR)

### ADR Template

```markdown
# [Number]: [Decision Title]

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
[What is the issue that we're seeing that is motivating this decision or change?]

## Decision
[What is the change that we're proposing and/or doing?]

## Consequences
[What becomes easier or more difficult to do because of this change?]

## Alternatives Considered
- [Alternative 1] - [Why rejected]
- [Alternative 2] - [Why rejected]
```

### Example ADR

```markdown
# 001: Use PostgreSQL as Primary Database

## Status
Accepted

## Context
We need a relational database for our application that supports:
- ACID transactions
- Complex queries
- JSON data types
- Full-text search

## Decision
Use PostgreSQL as the primary database with Neon Serverless for hosting.

## Consequences
**Positive:**
- Strong data consistency with ACID compliance
- Powerful query capabilities
- Excellent JSON support with jsonb
- Built-in full-text search
- Large ecosystem and tooling

**Negative:**
- Vertical scaling limitations
- More complex setup than NoSQL alternatives
- Requires migration for SQL expertise

## Alternatives Considered
- **MySQL** - Rejected due to weaker JSON support
- **MongoDB** - Rejected due to lack of ACID guarantees
- **DynamoDB** - Rejected due to cost and query limitations
```

## Best Practices

### Specification Writing

1. **Be Specific and Unambiguous**
   - Bad: "The system should be fast"
   - Good: "API response time < 200ms at p95"

2. **Define Measurable Criteria**
   - Bad: "Support many users"
   - Good: "Support 10,000 concurrent users"

3. **Include Edge Cases**
   - What happens on failure?
   - What happens with invalid input?
   - What happens at capacity limits?

4. **Consider Accessibility**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support

5. **Plan for Internationalization**
   - Unicode support
   - Date/time formats
   - Number formatting
   - RTL languages

### Planning

1. **Document Trade-offs**
   - Why this approach?
   - What are we giving up?
   - What risks are we accepting?

2. **Provide Rationale**
   - Don't just state the decision
   - Explain the reasoning
   - Include data or benchmarks

3. **Consider Migration**
   - How do we get from A to B?
   - Can we roll back?
   - What's the rollout strategy?

4. **Include Compliance**
   - Security requirements
   - Privacy requirements (GDPR, CCPA)
   - Industry regulations

### Task Breakdown

1. **Make Tasks Independent**
   - Minimize dependencies
   - Allow parallel execution
   - Clear start/end conditions

2. **Estimate Conservatively**
   - Include testing time
   - Include buffer for unknowns
   - Consider complexity

3. **Define Clear Acceptance**
   - Binary pass/fail criteria
   - Automated verification
   - Manual checklist items

4. **Link to Requirements**
   - Every task maps to requirements
   - Every requirement has tasks
   - Traceability is maintained

## Prompt History Records (PHR)

### PHR Template

```yaml
---
ID: 001
TITLE: [Descriptive title]
STAGE: [spec|plan|tasks|red|green|refactor|explainer|misc|general]
DATE_ISO: 2025-01-19
SURFACE: agent
MODEL: claude-opus-4-5
FEATURE: [feature-name or "none"]
BRANCH: [branch-name]
USER: [user-identifier]
COMMAND: [/command or "none"]
LABELS:
  - [topic1]
  - [topic2]
LINKS:
  SPEC: [URL or "null"]
  TICKET: [URL or "null"]
  ADR: [URL or "null"]
  PR: [URL or "null"]
FILES_YAML:
  - [path/to/file1]
  - [path/to/file2]
TESTS_YAML:
  - [test name or command]
OUTCOME: [success/failure/partial]
EVALUATION: [quality assessment]
---

# [Title]

## User Prompt
[Full user input verbatim]

## Assistant Response
[Key assistant output]

## Context
[Additional context as needed]

## Artifacts
[List of files created/modified]

## Outcome
[Result of the interaction]
```

## Tools and Automation

### Spec-Driven Development Tools

```bash
# SpecKit Plus (example CLI tool)
specify init                    # Initialize SDD project
specify spec create             # Create new spec
specify plan create             # Create architecture plan
specify tasks generate          # Generate tasks from spec
specify adr create              # Create ADR
specify phr create              # Create PHR
specify validate                # Validate traceability
specify coverage                # Check requirements coverage
```

### Verification Commands

```bash
# Check spec coverage
grep -r "@spec" src/ | wc -l

# Verify all requirements have tasks
grep "FR-" spec.md | wc -l
grep "FR-" tasks.md | wc -l

# Generate traceability matrix
specify matrix > traceability.md

# Validate ADR format
specify validate-adr --dir history/adr/
```

## Quality Metrics

### Specification Quality Checklist

- [ ] All requirements are uniquely identifiable
- [ ] Requirements are testable and measurable
- [ ] NFRs have specific metrics
- [ ] Edge cases are documented
- [ ] Dependencies are listed
- [ ] Security considerations included
- [ ] Accessibility requirements defined
- [ ] Compliance requirements noted

### Architecture Quality Checklist

- [ ] Technology choices have rationale
- [ ] Trade-offs are documented
- [ ] Security threats analyzed
- [ ] Migration strategy defined
- [ ] Rollback plan exists
- [ ] Performance requirements met
- [ ] Scalability considered
- [ ] Monitoring defined

### Task Quality Checklist

- [ ] Tasks map to requirements
- [ ] Acceptance criteria are testable
- [ ] Estimates are reasonable
- [ ] Dependencies identified
- [ ] Verification steps defined
- [ ] Code annotation pattern shown
- [ ] Priority and complexity assigned

## Resources

- **Spec-Driven Development**: https://spec-driven.dev/
- **C4 Model**: https://c4model.com/
- **Writing Good Requirements**: https://www.softwaretestingfundamentals.com/requirements/
- **ADR Tools**: https://adr.github.io/
- **Three Amigos Technique**: https://www.agilealliance.org/glossary/three-amigos/
- **User Story Mapping**: https://www.amazon.com/User-Story-Mapping-Discovery-RIGHT/dp/1491904909

## Anti-Patterns to Avoid

### Common Mistakes

1. **Vague Requirements**
   - "Make it fast" → "API < 200ms p95"

2. **Implementation in Spec**
   - Don't specify how, specify what

3. **Missing Edge Cases**
   - Document failure modes
   - Handle capacity limits

4. **No Traceability**
   - Always use @spec tags
   - Link tasks to requirements

5. **Forgotten Documentation**
   - Update docs as code changes
   - Keep ADRs current

6. **Skipping ADRs**
   - Document significant decisions
   - Record rationale and trade-offs
