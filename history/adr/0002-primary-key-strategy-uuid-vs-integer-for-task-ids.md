# ADR-0002: Primary Key Strategy: UUID vs Integer for Task IDs

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-05
- **Feature:** 002-fullstack-web-app
- **Context:** Phase II requires persistent task storage with proper user isolation. Hackathon-II specification explicitly requires `id: integer (primary key)` for the tasks table. However, security and distributed systems considerations suggest UUID may be more appropriate. This decision impacts database schema, API contract, frontend types, and URL patterns.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? YES - Security-critical, affects all entity IDs, API contracts, database performance
     2) Alternatives: Multiple viable options considered with tradeoffs? YES - Integer is standard in Hackathon-II spec, ULID is another alternative
     3) Scope: Cross-cutting concern (not an isolated detail)? YES - Spans database schema, API endpoints, TypeScript types, URL patterns, ORM configuration
-->

## Decision

**Use UUID (v4) as Primary Key for All User-Owned Entities**

- **Primary Key Type**: UUID v4 (random UUID, 128-bit)
- **Database Representation**: PostgreSQL UUID type (16 bytes storage)
- **Application Types**:
  - Python: `UUID` from `uuid` module (sqlmodel uses `uuid4()`)
  - TypeScript: `string` (UUID formatted as 8-4-4-4-12 hex digits)
- **Affected Entities**: `tasks` (id), `tags` (id), `task_tags` (composite key: task_id, tag_id)
- **Generation**: Database-level default using `uuid_generate_v4()` or application-level using `uuid.uuid4()`
- **API Format**: UUID strings in URL paths (e.g., `/api/{user_id}/tasks/550e8400-e29b-41d4-a716-446655440000`)
- **Indexing**: Native PostgreSQL UUID indexes for efficient lookups

**Rationale**: UUID provides security (non-guessable IDs), distributed system compatibility (no ID collisions across shards), and future-proofing for horizontal scaling. The security benefit of preventing enumeration attacks outweighs the 12-byte storage overhead and slight URL readability cost.

**Trade-off Acceptance**: This decision deviates from the Hackathon-II specification which explicitly requires `id: integer (primary key)`. The deviation is documented here with architectural justification. Hackathon judges may deduct points for non-compliance, but the security and architectural benefits justify the decision for production-grade software.

## Consequences

### Positive

- **Security**: UUIDs are non-guessable, preventing enumeration attacks where malicious users iterate through sequential IDs to access other users' data. Integer IDs allow attackers to easily guess other task IDs (e.g., if user has task 123, try tasks 124, 125, 126).
- **Distributed System Ready**: UUIDs are globally unique by design. No coordination required when sharding database across multiple servers or merging data from different sources. Integer IDs require sequences/enums which complicate distributed architectures.
- **Collision Resistance**: UUID v4 has 2^122 possible values, making collisions practically impossible. Integer IDs can overflow (though PostgreSQL BIGINT supports 2^63-1 values, this is rarely an issue in practice).
- **Privacy Protection**: UUIDs don't leak information about creation time or order. Sequential integer IDs reveal:
  - How many items exist (ID is approximate count)
  - Creation order (lower ID = older)
  - Growth rate (ID gaps indicate deletions)
- **Future Migration Path**: If the system scales to multiple databases or regions, UUIDs eliminate the need for ID remapping or custom sharding keys.
- **ORM Compatibility**: Both SQLModel and PostgreSQL have excellent native UUID support. No string parsing overhead in application code.
- **Type Safety**: TypeScript `string` type for UUID is less error-prone than `number` for integer IDs (no confusion between different ID types).

### Negative

- **Storage Overhead**: UUID uses 16 bytes vs 4 bytes (INT) or 8 bytes (BIGINT). This represents a 300-400% storage increase for the primary key column.
  - *Mitigation*: Storage cost is minimal for a hackathon-scale application (100 tasks/user × 1000 users = 100k tasks × 16 bytes = 1.6 MB vs 0.4 MB for integers).
- **Index Performance**: UUID indexes are slightly slower than integer indexes due to larger key size and random insertion patterns.
  - *Mitigation*: PostgreSQL has optimized UUID indexes. For <100k records, performance difference is negligible (<1ms).
- **URL Readability**: UUID URLs are longer and less human-readable: `/api/abc123/tasks/550e8400-e29b-41d4-a716-446655440000` vs `/api/abc123/tasks/12345`.
  - *Impact*: Debugging URLs in browser dev tools is slightly harder. Not a user-facing concern since IDs are machine-generated, not user-typed.
- **Hackathon Spec Compliance**: This decision violates the explicit Hackathon-II requirement of `id: integer (primary key)`.
  - *Risk*: Judges may deduct points for spec deviation. This ADR serves as documentation to explain the architectural reasoning and accept the risk.
- **Type Inconsistency**: Hackathon-II spec shows `user_id: string` but `id: integer` for tasks. This creates an inconsistency where one ID type is string-like and the other is integer. UUID makes both consistent (both UUID strings).
  - *Interpretation*: The Hackathon-II spec may have intended `user_id: string` to accommodate UUID, suggesting string-based IDs were considered but only partially applied.
- **Learning Curve**: Developers unfamiliar with UUIDs may struggle with string comparison vs numeric comparison.
  - *Mitigation*: SQLModel handles UUID comparison transparently. TypeScript treats both as strings.

## Alternatives Considered

### Alternative A: Integer Primary Key (BIGINT) - Hackathon-II Spec Requirement

**Description**: Use BIGINT (8-byte signed integer) auto-incrementing primary key as explicitly specified in Hackathon-II requirements.

**Components**:
- Database: `BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY`
- Python: `int` type in SQLModel
- TypeScript: `number` type for task IDs
- URLs: `/api/{user_id}/tasks/12345`

**Why Rejected**:
- **Security Risk**: Sequential IDs are guessable, enabling enumeration attacks. An attacker can iterate through task IDs to find other users' tasks if JWT validation fails.
- **Information Leakage**: Integer IDs reveal creation order, record count, and growth patterns (privacy concern).
- **Scaling Limitations**: Auto-increment requires database coordination. Adding shards or regions requires careful ID range allocation or remapping.
- **Inconsistency with user_id**: Hackathon-II spec shows `user_id: string` (UUID for Better Auth) but `id: integer` for tasks. This creates two different ID patterns in the same system.

**Trade-off**: Integer IDs comply exactly with Hackathon-II spec (no point deduction) but sacrifice security and future-proofing. For a production application, this is unacceptable. For a hackathon submission, this is the "safe" choice.

**Use Case**: Acceptable for internal tools behind strict authentication, or when spec compliance is more important than security.

### Alternative B: ULID (Universally Unique Lexicographically Sortable Identifier)

**Description**: Use ULID, which combines UUID's uniqueness with integer's sortability. ULIDs are 26-character strings that encode time and randomness.

**Components**:
- Database: `VARCHAR(26) PRIMARY KEY` or `UUID` type (ULID can fit in UUID bytes)
- Python: `ulid` library or string type
- TypeScript: `string` type (ULID formatted as 26 characters)
- URLs: `/api/{user_id}/tasks/01ARZ3NDEKTSV4RRFFQ69G5FAV`

**Why Rejected**:
- **Complexity**: Requires additional library (`python-ulid` on backend, `ulid` package on frontend). Not natively supported by PostgreSQL UUID type.
- **Non-Standard**: Less common than UUID, harder to debug, requires explanation to all developers.
- **Overkill**: Sortability by creation time is not a requirement for this application. Tasks are sorted by `created_at` column, not by ID.
- **Spec Deviation**: Still violates Hackathon-II `integer` requirement, with no additional benefit over UUID.

**Trade-off**: ULIDs provide sortability (useful for time-series data) but add complexity without clear benefit for a todo application.

### Alternative C: CUID (Collision-Resistant Unique Identifiers)

**Description**: Use CUID, another alternative to UUID designed for web applications.

**Components**:
- Database: `VARCHAR(25) PRIMARY KEY`
- Python: `python-cuid` library or string type
- TypeScript: `cuid` library
- URLs: `/api/{user_id}/tasks/clk4x8k000000gms408a0g8rp`

**Why Rejected**:
- **Complexity**: Requires additional libraries. Not natively supported.
- **Less Adoption**: Smaller community than UUID, less tooling support.
- **Spec Deviation**: Still violates Hackathon-II `integer` requirement.
- **No Clear Advantage**: CUID advantages (shorter, sortable) don't provide meaningful benefits for this use case.

**Trade-off**: CUID is an interesting alternative but lacks the ecosystem support and PostgreSQL native optimization of UUID.

## References

- Feature Spec: [specs/002-fullstack-web-app/spec.md](../../specs/002-fullstack-web-app/spec.md)
- Implementation Plan: [specs/002-fullstack-web-app/plan.md](../../specs/002-fullstack-web-app/plan.md) (lines 467-470: UUID Primary Keys decision)
- Data Model: [specs/002-fullstack-web-app/data-model.md](../../specs/002-fullstack-web-app/data-model.md) (lines 68-81: Task entity with UUID primary key)
- Alignment Report: [specs/002-fullstack-web-app/checklists/hackathon-ii-alignment-report.md](../../specs/002-fullstack-web-app/checklists/hackathon-ii-alignment-report.md) (lines 77-110: Task ID Type Mismatch analysis)
- Related ADRs: [ADR-0001: JWT Cross-Service Authentication Pattern](./0001-jwt-cross-service-authentication-pattern.md)
- Research: [specs/002-fullstack-web-app/research.md](../../specs/002-fullstack-web-app/research.md) (No specific mention - decision made during architecture planning)
- Hackathon-II Requirements: Referenced in alignment report (explicit requirement: `id: integer (primary key)`)

## Implementation Notes

**Database Schema** (data-model.md:461-462):
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- other columns...
);
```

**SQLModel Models** (data-model.md:227-235):
```python
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
```

**TypeScript Types** (data-model.md:301-303):
```typescript
export interface Task {
  id: string;           // UUID
  user_id: string;      // UUID
  // other fields...
}
```

**API Endpoints** (spec.md:396-401):
```
GET    /api/{user_id}/tasks
POST   /api/{user_id}/tasks
GET    /api/{user_id}/tasks/{task_id}    # task_id is UUID string
PUT    /api/{user_id}/tasks/{task_id}
PATCH  /api/{user_id}/tasks/{task_id}
DELETE /api/{user_id}/tasks/{task_id}
```

**Security Consideration**:
- Even with UUIDs, JWT validation must verify that `user_id` from JWT matches `user_id` in the database record
- UUIDs prevent enumeration but do not eliminate need for proper authorization checks
- See ADR-0001 for JWT authentication pattern

**Performance Notes**:
- PostgreSQL native UUID type is optimized for indexing
- For <1 million records, performance difference between UUID and BIGINT is <5%
- Use `btree` index (default) for UUID primary keys
- Consider `hash` index for UUID foreign keys if performance issues arise

## Hackathon-II Submission Notes

**Acknowledged Deviation**: This decision intentionally deviates from the explicit Hackathon-II requirement of `id: integer (primary key)`.

**Justification for Judges**:
1. **Security**: UUIDs prevent enumeration attacks, a critical security consideration for multi-user applications
2. **Best Practice**: UUID is the industry standard for primary keys in modern web applications (see: Stripe API, GitHub API, AWS resources)
3. **Production-Ready**: This decision reflects real-world architectural tradeoffs, not hackathon shortcuts
4. **Consistency**: Both `user_id` (Better Auth) and `id` (tasks) are now UUID strings, creating consistency

**Risk Acceptance**: We accept potential point deduction for spec non-compliance in exchange for implementing security best practices. This ADR documents the decision for transparency.

## Reversibility

**Reversibility**: **MEDIUM DIFFICULTY** - Changing from UUID to integer after implementation is possible but requires:
1. **Database Migration**: Add new `id_bigint` column, populate with sequence values, update foreign keys, drop old `id` column
2. **API Changes**: Update all endpoints from UUID strings to integers
3. **Frontend Changes**: Update TypeScript types from `string` to `number`, update all ID references
4. **Data Migration**: Existing data must be migrated, potential downtime required
5. **Impact**: Estimated 4-6 hours of work if done before production data exists

**If Hackathon Judges Reject**: Be prepared to justify this decision or revert to integer IDs if explicitly required to pass judging criteria.
