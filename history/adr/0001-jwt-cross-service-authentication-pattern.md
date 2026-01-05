# ADR-0001: JWT Cross-Service Authentication Pattern

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2026-01-05
- **Feature:** 002-fullstack-web-app
- **Context:** Phase II requires multi-user web application with authentication. Frontend is Next.js 16+, backend is FastAPI (Python). Need to authenticate users and authorize API requests across technology boundaries while maintaining stateless design per constitution.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security? YES - Security-critical, affects all API endpoints
     2) Alternatives: Multiple viable options considered with tradeoffs? YES - NextAuth, custom JWT, Auth0 evaluated
     3) Scope: Cross-cutting concern (not an isolated detail)? YES - Spans frontend, backend, database, deployment
-->

## Decision

**JWT Cross-Service Authentication Pattern with Better Auth (Frontend) + FastAPI (Backend)**

- **Frontend Auth Library**: Better Auth v1.0.0 with JWT plugin
- **Backend Verification**: FastAPI dependency injection with python-jose
- **Token Type**: JSON Web Token (JWT) with HS256 algorithm (HMAC-SHA256)
- **Token Expiration**: 24 hours (configurable via `expiresIn` option)
- **Shared Secret**: `BETTER_AUTH_SECRET` environment variable (≥32 characters, identical on both services)
- **Token Payload**: `{ sub: user_id (UUID), exp: expiration timestamp, iat: issued timestamp }`
- **Authorization Header**: `Authorization: Bearer <jwt_token>`
- **User ID Validation**: Double validation (JWT `sub` === path `user_id` parameter)

**Authentication Flow**:
1. User signs in via Better Auth on frontend
2. Better Auth validates credentials and issues JWT token
3. Frontend stores JWT in session
4. Frontend API client attaches JWT to `Authorization` header
5. FastAPI verifies JWT signature using shared `BETTER_AUTH_SECRET`
6. FastAPI validates `user_id` from JWT matches path parameter
7. Request proceeds or returns 403 Forbidden

## Consequences

### Positive

- **Stateless Backend**: FastAPI remains stateless, no session storage required. Enables horizontal scaling without sticky sessions.
- **Technology Independence**: Frontend and backend can scale/deploy independently. No shared session database required.
- **Security**: JWT signatures cryptographically verify token authenticity. User isolation enforced at both application (JWT validation) and database (`user_id` foreign key) layers.
- **Developer Experience**: Better Auth provides Next.js-native auth UI, hooks, and middleware. Minimal boilerplate for signup/signin flows.
- **Performance**: No database lookup required for session validation. Token verification is O(1) cryptographic operation.
- **Cross-Language**: Standard JWT format works across TypeScript (frontend) and Python (backend). Any future service can verify tokens.

### Negative

- **Token Expiration Management**: 24-hour expiration means users must re-authenticate after token expires. No refresh token implementation (future enhancement).
- **Secret Synchronization**: `BETTER_AUTH_SECRET` must be identical between frontend and backend environments. Mismatch causes authentication failures.
- **Token Revocation Difficulty**: JWTs cannot be easily revoked before expiration. If security breach occurs, must rotate secret immediately (invalidates all tokens).
- **Payload Size Limitation**: JWTs include all claims in every request. Large payloads increase header size. Current payload is minimal (user_id, exp, iat).
- **Algorithm Upgrade Complexity**: Upgrading from HS256 to RS256 (asymmetric keys) requires coordinated frontend/backend deployment.
- **Debugging Complexity**: JWT decode errors can be cryptic. Need proper logging to distinguish signature failures vs expiration issues.

## Alternatives Considered

### Alternative A: NextAuth.js with Backend Session Store

**Description**: Use NextAuth.js (more mature) on frontend with shared PostgreSQL session store that FastAPI queries.

**Components**:
- Frontend: NextAuth.js v4 (beta for v5)
- Backend: Query `sessions` table on every request
- Database: Shared `sessions` table managed by NextAuth

**Why Rejected**:
- **Stateful Backend**: Requires FastAPI to query database on every request for session validation. Adds latency and database load.
- **Technology Coupling**: Backend depends on NextAuth's session table schema. Schema changes in NextAuth break backend.
- **More Complexity**: Need to share database connection between Node.js (NextAuth) and Python (FastAPI) for session queries.
- **Slower**: Session lookup is database query (O(1) but with network I/O) vs JWT verification (CPU-bound, no I/O).

**Trade-off**: NextAuth.js is more mature and has more provider integrations, but the stateful backend violates constitution's stateless design principle.

### Alternative B: Custom JWT Implementation

**Description**: Build custom JWT issuance and verification from scratch on both frontend and backend.

**Components**:
- Frontend: Custom signup/signin endpoints using crypto library
- Backend: Custom JWT verification using python-jose
- Database: Custom `users` and `sessions` tables

**Why Rejected**:
- **Security Risk**: Implementing crypto correctly is error-prone. Password hashing, JWT signing, timing attack protection are hard.
- **Reinventing Wheel**: Better Auth already provides tested, secure auth flows. Custom implementation has higher risk of vulnerabilities.
- **Maintenance Burden**: Security best practices evolve. Need to maintain custom code vs relying on library updates.
- **Feature Deficit**: Better Auth provides email verification, password reset, OAuth providers out-of-box. Custom implementation requires building all features.

**Trade-off**: Custom JWT gives full control but increases development time and security risk. Better Auth provides 80% of features needed with 20% of effort.

### Alternative C: Auth0 or Clerk (Third-Party Auth)

**Description**: Use managed auth service (Auth0 or Clerk) that handles all authentication.

**Components**:
- Frontend: Auth0 SDK or Clerk SDK
- Backend: Verify Auth0/Clerk JWTs using JWKS endpoint
- Service: Auth0 or Clerk cloud service

**Why Rejected**:
- **Cost**: Free tiers limited (Auth0: 7,000 MAU, Clerk: 5,000 MAU). Exceeding limits requires paid plans.
- **Vendor Lock-in**: Migrating away from Auth0 requires re-implementing all auth flows.
- **Overkill for Hackathon**: Managed auth services are designed for production-scale applications with thousands of users.
- **External Dependency**: Application depends on external service availability. Auth0/Clerk outage blocks all signins.

**Trade-off**: Auth0/Clerk provide enterprise features (SSO, MFA, audit logs) but add cost and vendor dependency for a hackathon project.

### Alternative D: Backend-Only Authentication (Session Cookies)

**Description**: FastAPI handles all auth, sets session cookies, Next.js is just a UI layer.

**Components**:
- Backend: FastAPI with session middleware and cookie handling
- Frontend: Next.js purely as UI, no auth logic
- Session: Server-side sessions stored in PostgreSQL

**Why Rejected**:
- ** violates Separation of Concerns**: Frontend (Next.js) cannot be deployed independently. Must be collocated with FastAPI.
- **CORS Complexity**: Session cookies require same-origin or complex CORS configuration. Harder to separate domains later.
- **Constitution Violation**: Violates stateless design principle. Backend must maintain session state.
- **Scalability**: Session storage grows linearly with users. Requires database cleanup jobs.
- **Mobile-Unfriendly**: Session cookies work poorly for native mobile apps (React Native, Flutter) if needed later.

**Trade-off**: Backend-only auth is simpler for monolithic deployment but limits architectural flexibility and violates stateless design.

## References

- Feature Spec: [specs/002-fullstack-web-app/spec.md](../specs/002-fullstack-web-app/spec.md)
- Implementation Plan: [specs/002-fullstack-web-app/plan.md](../specs/002-fullstack-web-app/plan.md) (lines 252-397: JWT Authentication Flow)
- Research: [specs/002-fullstack-web-app/research.md](../specs/002-fullstack-web-app/research.md) (lines 9-23: Better Auth + FastAPI JWT Integration)
- Data Model: [specs/002-fullstack-web-app/data-model.md](../specs/002-fullstack-web-app/data-model.md)
- Related ADRs: None (first ADR for this project)
- Constitution: [.specify/memory/constitution.md](../.specify/memory/constitution.md) (Principle VI: Security and User Isolation)

## Implementation Notes

**Environment Variables Required**:
```bash
# frontend/.env.local
BETTER_AUTH_SECRET=<shared-secret-min-32-chars>
NEXT_PUBLIC_API_URL=http://localhost:8000

# backend/.env
BETTER_AUTH_SECRET=<same-secret-as-above>
DATABASE_URL=postgresql://...
CORS_ORIGINS=http://localhost:3000
```

**Security Checklist**:
- [ ] `BETTER_AUTH_SECRET` is ≥32 characters with high entropy
- [ ] Secret is never committed to Git (added to .gitignore)
- [ ] Frontend and backend use identical secret values in all environments
- [ ] JWT expiration is 24 hours or less (configurable)
- [ ] All protected endpoints require `Authorization: Bearer <token>` header
- [ ] Backend validates JWT `sub` claim matches path `user_id` parameter
- [ ] Backend returns 401 Unauthorized for missing/invalid JWT
- [ ] Backend returns 403 Forbidden for user_id mismatch
- [ ] HTTPS enforced in production (prevents token interception)

**Future Enhancements**:
- **Refresh Tokens**: Implement refresh token rotation to extend sessions without requiring re-authentication
- **RS256 Algorithm**: Upgrade to asymmetric keys (RS256) for better security at cost of complexity
- **Token Revocation**: Add token blocklist for immediate revocation (e.g., password change, logout)
- **Multi-Factor Authentication**: Add TOTP/SMS 2FA via Better Auth plugins
