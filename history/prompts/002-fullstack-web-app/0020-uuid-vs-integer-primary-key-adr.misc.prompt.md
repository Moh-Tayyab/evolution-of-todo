---
id: 0020
title: uuid-vs-integer-primary-key-adr
stage: misc
date: 2026-01-05
surface: agent
model: claude-opus-4-5-20251101
feature: 002-fullstack-web-app
branch: 002-fullstack-web-app
user: evolution-of-todo
command: /sp.adr task-id-uuid-vs-integer
labels: ["adr","uuid","primary-key","database","security"]
links:
  spec: specs/002-fullstack-web-app/spec.md
  ticket: null
  adr: history/adr/0002-primary-key-strategy-uuid-vs-integer-for-task-ids.md
  pr: null
files:
  - history/adr/0002-primary-key-strategy-uuid-vs-integer-for-task-ids.md (created)
tests:
  - Significance checklist validation performed
---

## Prompt

Create ADR for UUID vs integer task ID using sp.adr skill with input "task-id-uuid-vs-integer"

## Response snapshot

### ADR Review Complete

**Significance Test Applied**:
1. ✅ Impact: Security-critical, affects all entity IDs, API contracts, database performance
2. ✅ Alternatives: 3 alternatives considered (Integer BIGINT, ULID, CUID)
3. ✅ Scope: Cross-cutting concern (database schema, API endpoints, TypeScript types, URL patterns, ORM)

**Decision Cluster**: Primary Key Strategy - Use UUID v4 for all user-owned entities

### ADR Content Created

**Title**: Primary Key Strategy: UUID vs Integer for Task IDs
**Status**: Accepted
**ID**: ADR-0002

**Decision Components**:
- Primary Key Type: UUID v4 (random UUID, 128-bit)
- Database: PostgreSQL UUID type (16 bytes storage)
- Python: `UUID` from `uuid` module
- TypeScript: `string` type
- Affected Entities: tasks (id), tags (id), task_tags (task_id, tag_id)
- API Format: UUID strings in URLs
- Generation: `uuid_generate_v4()` or `uuid.uuid4()`

**Rationale**: UUID provides security (non-guessable IDs), distributed system compatibility, and future-proofing for horizontal scaling. Acknowledges deviation from Hackathon-II spec requirement of `id: integer`.

**Positive Consequences** (7):
- Security: Non-guessable, prevents enumeration attacks
- Distributed System Ready: Globally unique, no coordination needed
- Collision Resistance: 2^122 possible values
- Privacy Protection: Doesn't leak creation order or count
- Future Migration Path: No remapping needed for sharding
- ORM Compatibility: Native PostgreSQL and SQLModel support
- Type Safety: TypeScript string vs number confusion

**Negative Consequences** (6):
- Storage Overhead: 16 bytes vs 4/8 bytes (mitigated for small scale)
- Index Performance: Slightly slower (negligible for <100k records)
- URL Readability: Longer URLs (not user-facing)
- Hackathon Spec Compliance: Intentional deviation with risk acceptance
- Type Inconsistency: Resolved - both user_id and id now UUID strings
- Learning Curve: Mitigated by ORM support

**Alternatives Analyzed** (3):

1. **Integer Primary Key (BIGINT)** - Hackathon-II Requirement
   - Rejected: Security risk (guessable), information leakage, scaling limitations, inconsistency with user_id string type
   - Trade-off: Exact spec compliance but sacrifices security and future-proofing

2. **ULID (Universally Unique Lexicographically Sortable Identifier)**
   - Rejected: Complexity (additional libraries), non-standard, no sortability requirement
   - Trade-off: Provides sortability but adds complexity without clear benefit

3. **CUID (Collision-Resistant Unique Identifiers)**
   - Rejected: Complexity, less adoption, no clear advantage over UUID
   - Trade-off: Interesting alternative but lacks ecosystem support

**Hackathon-II Submission Notes**:
- Acknowledged deviation from `id: integer (primary key)` requirement
- Justification: Security, industry best practice, production-ready, consistency
- Risk Acceptance: Accept potential point deduction for security best practices

**Reversibility**: MEDIUM DIFFICULTY - 4-6 hours to revert if judges require strict compliance

### References

- Feature Spec: specs/002-fullstack-web-app/spec.md
- Implementation Plan: specs/002-fullstack-web-app/plan.md (lines 467-470)
- Data Model: specs/002-fullstack-web-app/data-model.md (lines 68-81)
- Alignment Report: specs/002-fullstack-web-app/checklists/hackathon-ii-alignment-report.md (lines 77-110)
- Related ADRs: ADR-0001 (JWT Cross-Service Authentication Pattern)

## Outcome

- ✅ Impact: Created comprehensive 204-line ADR documenting UUID vs integer primary key decision
- 🧪 Tests: Significance checklist PASSED (all 3 criteria met)
- 📁 Files: history/adr/0002-primary-key-strategy-uuid-vs-integer-for-task-ids.md (204 lines, 3 alternatives analyzed)
- 🔁 Next prompts: None (ADR complete)
- 🧠 Reflection: This ADR captures a critical security and database architecture decision. The choice of UUID over integer addresses the Hackathon-II spec deviation identified in the alignment report. Three alternatives were thoroughly analyzed with clear rationale for rejection. The ADR includes implementation notes, security considerations, performance notes, and Hackathon-II submission notes to help judges understand the architectural reasoning. The decision prioritizes security and production-ready architecture over strict spec compliance, which demonstrates real-world engineering tradeoff thinking.

## Evaluation notes (flywheel)

- Failure modes observed: None - ADR creation workflow executed successfully
- Graders run and results (PASS/FAIL):
  - Significance Test: PASS (Impact: HIGH - security-critical, Alternatives: 3, Scope: Cross-cutting)
  - Decision Clustering: PASS (Primary key strategy as integrated decision, not atomic choice)
  - Alternatives Analysis: PASS (3 alternatives with detailed pros/cons and rejection rationale)
  - Consequences Coverage: PASS (7 positive, 6 negative outcomes documented)
  - References: PASS (links to spec, plan, data-model, alignment report, ADR-0001)
  - Hackathon Awareness: PASS (explicitly acknowledges spec deviation with justification)
- Prompt variant (if applicable): Standard /sp.adr workflow
- Next experiment (smallest change to try): If Hackathon-II judges reject UUID decision, refer to Reversibility section in ADR-0002 for step-by-step migration plan back to integer IDs. Would require updating data-model.md, spec.md, plan.md, and creating migration SQL script.

## Next Steps

The UUID vs integer ADR is complete and documents the architectural decision to use UUID for security and distributed system compatibility. The ADR acknowledges the intentional deviation from Hackathon-II spec requirements and provides justification for judges.

Current ADR Status:
- ADR-0001: JWT Cross-Service Authentication Pattern ✅
- ADR-0002: Primary Key Strategy: UUID vs Integer ✅

Remaining ADR Candidates (from plan.md):
- ADR-0003: Monorepo Structure (document rationale for monorepo vs polyrepo)
- ADR-0004: SQLModel vs SQLAlchemy (document ORM choice)

These are optional but recommended for complete architectural traceability.

Ready to proceed with implementation using `/sp.implement`.
