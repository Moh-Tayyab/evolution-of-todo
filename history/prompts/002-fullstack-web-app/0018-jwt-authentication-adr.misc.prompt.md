---
id: 0018
title: jwt-authentication-adr
stage: misc
date: 2026-01-05
surface: agent
model: claude-opus-4-5-20251101
feature: 002-fullstack-web-app
branch: 002-fullstack-web-app
user: evolution-of-todo
command: /sp.adr jwt-auth-integration
labels: ["adr","jwt-auth","architecture","security"]
links:
  spec: specs/002-fullstack-web-app/spec.md
  ticket: null
  adr: history/adr/0001-jwt-cross-service-authentication-pattern.md
  pr: null
files:
  - history/adr/0001-jwt-cross-service-authentication-pattern.md (created)
tests:
  - Significance checklist validation performed
---

## Prompt

Create JWT auth ADR using sp.adr skill with input "jwt-auth-integration"

## Response snapshot

### ADR Review Complete

**Significance Test Applied**:
1. ✅ Impact: Security-critical, long-term consequence for architecture
2. ✅ Alternatives: 4 alternatives considered (NextAuth, Custom JWT, Auth0/Clerk, Backend-Only)
3. ✅ Scope: Cross-cutting concern spanning frontend, backend, database, deployment

**Decision Cluster**: JWT Cross-Service Authentication Pattern
- Better Auth (frontend) + FastAPI (backend) with shared BETTER_AUTH_SECRET
- HS256 algorithm, 24-hour expiration, double user_id validation

### ADR Content Created

**Title**: JWT Cross-Service Authentication Pattern
**Status**: Accepted
**ID**: ADR-0001

**Decision Components**:
- Frontend Auth Library: Better Auth v1.0.0 with JWT plugin
- Backend Verification: FastAPI dependency injection with python-jose
- Token Type: JWT with HS256 (HMAC-SHA256)
- Token Expiration: 24 hours
- Shared Secret: BETTER_AUTH_SECRET (≥32 chars, identical on both services)
- Token Payload: `{ sub: user_id (UUID), exp: expiration, iat: issued }`
- Authorization Header: `Authorization: Bearer <jwt_token>`
- User ID Validation: JWT `sub` === path `user_id` parameter

**Positive Consequences** (6):
- Stateless backend (horizontal scaling)
- Technology independence (deploy separately)
- Security (JWT signatures + database isolation)
- Developer experience (Better Auth hooks/UI)
- Performance (O(1) token verification)
- Cross-language compatibility

**Negative Consequences** (6):
- Token expiration management (no refresh tokens)
- Secret synchronization requirement
- Token revocation difficulty
- Payload size limitation
- Algorithm upgrade complexity
- Debugging complexity

**Alternatives Considered** (4):
1. NextAuth.js with Backend Session Store - Rejected (stateful, violates constitution)
2. Custom JWT Implementation - Rejected (security risk, reinventing wheel)
3. Auth0/Clerk (Third-Party) - Rejected (cost, vendor lock-in, overkill)
4. Backend-Only Authentication - Rejected (violates stateless design, limits flexibility)

**Implementation Notes**:
- Environment variables setup
- Security checklist (9 items)
- Future enhancements (refresh tokens, RS256, token revocation, 2FA)

**References**: Links to spec.md, plan.md (lines 252-397), research.md (lines 9-23), data-model.md, constitution

## Outcome

- ✅ Impact: Created comprehensive ADR documenting JWT cross-service authentication pattern
- 🧪 Tests: Significance checklist PASSED (all 3 criteria met)
- 📁 Files: history/adr/0001-jwt-cross-service-authentication-pattern.md (168 lines, 4 alternatives analyzed)
- 🔁 Next prompts: None (ADR complete)
- 🧠 Reflection: This ADR captures a critical security architecture decision. The JWT cross-service pattern enables stateless backend design while maintaining user isolation. Four alternatives were thoroughly analyzed with clear rationale for rejection. The ADR includes implementation notes and security checklist for reference during implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - ADR creation workflow executed successfully
- Graders run and results (PASS/FAIL):
  - Significance Test: PASS (Impact: HIGH, Alternatives: 4, Scope: Cross-cutting)
  - Decision Clustering: PASS (JWT auth pattern as integrated solution, not atomic choices)
  - Alternatives Analysis: PASS (4 alternatives with detailed pros/cons and rejection rationale)
  - Consequences Coverage: PASS (6 positive, 6 negative outcomes documented)
  - References: PASS (links to spec, plan, research, data-model, constitution)
- Prompt variant (if applicable): Standard /sp.adr workflow
- Next experiment (smallest change to try): Consider creating ADR-0002 for Monorepo Structure decision to document architectural pattern for separating frontend and backend code

## Next Steps

The JWT authentication ADR is complete and ready for reference during implementation. Suggested next ADRs:

- ADR-0002: Monorepo Structure - Document rationale for monorepo vs polyrepo decision
- ADR-0003: SQLModel vs SQLAlchemy - Document choice of SQLModel over raw SQLAlchemy

These are optional but recommended for architectural decision traceability.
