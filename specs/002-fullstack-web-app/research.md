# Research: Phase II - Todo Full-Stack Web Application

**Feature**: 002-fullstack-web-app
**Date**: 2025-12-29
**Status**: Complete

## Research Topics

### 1. Better Auth + FastAPI JWT Integration

**Decision**: Use Better Auth on frontend for session/JWT management, verify JWTs on FastAPI backend using shared secret.

**Rationale**:
- Better Auth is a Next.js-native auth library with built-in JWT plugin
- Backend only needs to verify JWT signatures, not manage sessions
- Shared `BETTER_AUTH_SECRET` enables cross-system JWT verification
- This pattern keeps authentication logic on frontend while backend remains stateless

**Alternatives Considered**:
- **NextAuth.js**: More mature but heavier; Better Auth is lighter and more modern
- **Custom JWT implementation**: More work, higher risk of security issues
- **Auth0/Clerk**: External dependency, cost concerns, overkill for hackathon

**Implementation Notes**:
- Frontend: `better-auth` with `jwt` plugin configured
- Backend: `python-jose` library to decode and verify JWT
- JWT payload must include `sub` (user_id) claim
- Backend extracts user_id from JWT, validates against path parameter

### 2. SQLModel with Neon PostgreSQL

**Decision**: Use SQLModel for ORM with async support via `asyncpg`.

**Rationale**:
- SQLModel combines SQLAlchemy + Pydantic for type safety
- Native async support for FastAPI
- Neon provides serverless PostgreSQL with connection pooling
- SQLModel models can serve as both DB models and API schemas

**Alternatives Considered**:
- **Raw SQLAlchemy**: More verbose, requires separate Pydantic models
- **Tortoise ORM**: Less mature, smaller community
- **Prisma (Python)**: Experimental, not production-ready

**Implementation Notes**:
- Use `create_async_engine` with Neon connection string
- Enable connection pooling in Neon dashboard
- SQLModel `Field` for column definitions with constraints
- Async session context manager for request handling

### 3. Next.js 16+ App Router Patterns

**Decision**: Use App Router with Server Components for pages, Client Components for interactive elements.

**Rationale**:
- App Router is the recommended approach for Next.js 16+
- Server Components reduce client-side JavaScript
- Better SEO and initial load performance
- Cleaner file-based routing structure

**Alternatives Considered**:
- **Pages Router**: Legacy approach, less performant
- **Full client-side SPA**: Poor SEO, slower initial load

**Implementation Notes**:
- Pages: Server Components by default
- Forms/interactions: Client Components with `"use client"` directive
- Auth state: Use Better Auth's `useSession` hook in Client Components
- API calls: Fetch from Client Components, cache with React Query or SWR (optional)

### 4. JWT Verification Middleware Pattern

**Decision**: Create FastAPI dependency that extracts and validates JWT from Authorization header.

**Rationale**:
- Dependency injection is FastAPI's recommended pattern for auth
- Centralized validation logic
- Easy to test in isolation
- Clear separation from business logic

**Alternatives Considered**:
- **Middleware**: Global, harder to exclude public routes
- **Decorator pattern**: Less composable than dependencies

**Implementation Notes**:
```python
# Pattern for JWT dependency
async def verify_jwt(authorization: str = Header(...)) -> dict:
    token = authorization.replace("Bearer ", "")
    payload = jwt.decode(token, SECRET, algorithms=["HS256"])
    return payload

async def get_current_user_id(
    user_id: str,  # From path
    jwt_payload: dict = Depends(verify_jwt)
) -> str:
    if jwt_payload["sub"] != user_id:
        raise HTTPException(403, "Forbidden")
    return user_id
```

### 5. User ID in Path vs. JWT-Only

**Decision**: Use `/api/{user_id}/tasks` pattern with JWT validation that user_id matches token.

**Rationale**:
- Spec explicitly requires this pattern
- Provides clear URL structure for debugging
- Double validation (path + JWT) adds security layer
- Frontend must know user_id anyway for API calls

**Alternatives Considered**:
- **JWT-only (no user_id in path)**: Simpler URLs but less explicit
- **Query parameter**: Less RESTful, harder to cache

**Implementation Notes**:
- Frontend extracts user_id from JWT payload after login
- All task API calls include user_id in path
- Backend validates path user_id matches JWT `sub` claim
- Mismatch returns 403 Forbidden

### 6. Tailwind CSS + Component Styling

**Decision**: Use Tailwind CSS with utility classes, minimal custom CSS.

**Rationale**:
- Spec requires Tailwind CSS
- Rapid development with utility classes
- Consistent design system
- Good responsive design primitives

**Alternatives Considered**:
- **CSS Modules**: More boilerplate, slower development
- **Styled Components**: Runtime overhead, SSR complexity
- **shadcn/ui**: Good option but adds complexity; may use for specific components

**Implementation Notes**:
- Install `tailwindcss`, `postcss`, `autoprefixer`
- Configure `tailwind.config.ts` with custom breakpoints if needed
- Use `@apply` sparingly for reusable patterns
- Mobile-first responsive design

### 7. Form Validation Strategy

**Decision**: Zod for frontend validation, Pydantic for backend validation.

**Rationale**:
- Constitution requires Pydantic (backend) + Zod (frontend)
- Both provide runtime type checking
- Zod integrates well with React Hook Form
- Pydantic is native to FastAPI

**Alternatives Considered**:
- **Yup**: Less TypeScript-friendly than Zod
- **Joi**: Node.js focused, not ideal for frontend

**Implementation Notes**:
- Frontend: Zod schemas for form validation
- Backend: Pydantic models for request/response
- Keep schemas in sync manually (consider codegen for larger projects)
- Validate on both client and server (never trust client)

### 8. Error Handling Strategy

**Decision**: Consistent error format across frontend and backend.

**Rationale**:
- Spec defines error response format
- Consistent UX for error messages
- Easier debugging and logging

**Implementation Notes**:
- Backend error format: `{"error": "code", "message": "...", "details": [...]}`
- Frontend displays `message` to user
- HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found)
- Toast notifications for transient errors
- Inline validation errors for form fields

## Dependencies Resolution

### Frontend Dependencies
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "better-auth": "^1.0.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^19.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

### Backend Dependencies
```toml
[project]
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "sqlmodel>=0.0.14",
    "asyncpg>=0.29.0",
    "python-jose[cryptography]>=3.3.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "httpx>=0.26.0",
]
```

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| JWT library for Python | python-jose with cryptography backend |
| Async PostgreSQL driver | asyncpg (native async, best performance) |
| Form library for React | Native forms with Zod validation (keep simple) |
| State management | React Context + Better Auth hooks (no Redux needed) |
| API client | Native fetch with typed wrapper (no axios needed) |

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Better Auth API changes | Low | Medium | Pin version, check changelog before updates |
| Neon cold start latency | Medium | Low | Use connection pooling, keep-alive queries |
| JWT secret exposure | Low | High | Use .env files, never commit secrets |
| CORS issues in development | High | Low | Configure CORS middleware with localhost origins |

## Research Conclusion

All technical decisions resolved. No blocking unknowns remain. Ready for Phase 1 design artifacts.
