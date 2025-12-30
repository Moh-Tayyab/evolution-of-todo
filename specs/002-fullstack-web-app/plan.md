# Implementation Plan: Phase II - Todo Full-Stack Web Application

**Branch**: `002-fullstack-web-app` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fullstack-web-app/spec.md`

## Summary

Transform the Phase I in-memory console Todo app into a multi-user web application with:
- **Frontend**: Next.js 16+ (App Router) with TypeScript, Tailwind CSS, and Better Auth for JWT authentication
- **Backend**: Python FastAPI with SQLModel ORM, JWT verification middleware, and user-scoped REST API
- **Database**: Neon Serverless PostgreSQL with user_id foreign keys for data isolation
- **Architecture**: Monorepo structure with layered CLAUDE.md files for AI-assisted development
- **Features**: 5 Basic (CRUD + Complete) + 5 Intermediate (Priorities, Tags, Search, Filter, Sort) = 10 features total

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x, Node.js 20+
- Backend: Python 3.13+

**Primary Dependencies**:
- Frontend: Next.js 16+, Better Auth (JWT plugin), Tailwind CSS, React 19+
- Backend: FastAPI, SQLModel, Pydantic, python-jose (JWT), uvicorn

**Storage**: Neon Serverless PostgreSQL (SQLModel ORM)

**Testing**:
- Frontend: Jest, React Testing Library
- Backend: pytest, httpx (async testing)

**Target Platform**: Web (responsive 320px-1920px), local development via docker-compose

**Project Type**: Web application (frontend + backend monorepo)

**Performance Goals**:
- Task completion toggle: <200ms visual feedback
- Signup: <60s completion
- Signin: <30s completion
- Add task: <10s completion
- Search results: <500ms (after 300ms debounce)
- Filter/sort operations: <200ms
- Tag autocomplete: <200ms

**Constraints**:
- JWT expiration: 24 hours
- Max tasks per user: 100
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- API pattern: `/api/{user_id}/tasks`

**Scale/Scope**:
- Local development only (Phase II)
- Single-region deployment
- 100 tasks per user limit

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase II Requirements (from Constitution v2.0.0)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Tech Stack: Next.js 16+ | ✅ PASS | Using Next.js 16+ with App Router |
| Tech Stack: FastAPI | ✅ PASS | Backend uses FastAPI |
| Tech Stack: SQLModel | ✅ PASS | ORM for PostgreSQL |
| Tech Stack: Neon PostgreSQL | ✅ PASS | Serverless PostgreSQL |
| Tech Stack: Better Auth (JWT) | ✅ PASS | Frontend auth with JWT plugin |
| JWT 24h expiration | ✅ PASS | Specified in clarifications |
| user_id FK + index on user tables | ✅ PASS | Tasks table has user_id FK |
| Input validation: Pydantic (BE) + Zod (FE) | ✅ PASS | Planned for implementation |
| HTTPS enforced | ⚠️ DEFER | Local dev only; HTTPS for production |
| Secrets in .env (not committed) | ✅ PASS | .env.local / .env files |

### Key Standards Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| Spec-driven development | ✅ PASS | All code from spec |
| @spec comments in code | ✅ PLAN | Will enforce during implementation |
| PHR for all commits | ✅ PLAN | Creating PHRs throughout |
| 100% spec traceability | ✅ PLAN | Target for implementation |
| Test coverage ≥80% BE, ≥70% FE | ✅ PLAN | Target for implementation |
| Security scan (no HIGH/CRITICAL) | ✅ PLAN | Will run before completion |

### Feature Scope Check (Basic + Intermediate for Phase II)

| Feature | Constitution Requirement | Spec Coverage |
|---------|-------------------------|---------------|
| Create Task | ✅ Basic #1 | FR-009 |
| Delete Task | ✅ Basic #2 | FR-014 |
| List Tasks | ✅ Basic #3 | FR-010, FR-011 |
| View Task Details | ✅ Basic #4 | FR-011 |
| Mark as Complete | ✅ Basic #5 | FR-013 |
| Priorities | ✅ Intermediate #6 | FR-023, FR-024 |
| Tags | ✅ Intermediate #7 | FR-025, FR-026 |
| Search | ✅ Intermediate #8 | FR-027, FR-028 |
| Filter | ✅ Intermediate #9 | FR-029, FR-030, FR-031, FR-032 |
| Sort | ✅ Intermediate #10 | FR-033, FR-034 |

**Note**: Spec includes all 10 features required by Constitution v2.0.0 for Phase II (5 Basic + 5 Intermediate).

### Gate Violations

None. All requirements satisfied or planned for implementation phase.

## Project Structure

### Documentation (this feature)

```text
specs/002-fullstack-web-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
│   ├── openapi.yaml     # Backend API contract
│   └── auth-flows.md    # Authentication flow documentation
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
/
├── frontend/                       # Next.js 16+ application
│   ├── CLAUDE.md                   # Frontend AI instructions
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── .env.local.example
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   │   ├── layout.tsx          # Root layout with providers
│   │   │   ├── page.tsx            # Landing (redirect logic)
│   │   │   ├── signin/
│   │   │   │   └── page.tsx        # Sign in page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx        # Sign up page
│   │   │   └── dashboard/
│   │   │       └── page.tsx        # Protected task dashboard
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── SignInForm.tsx
│   │   │   │   ├── SignUpForm.tsx
│   │   │   │   └── SignOutButton.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskItem.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   ├── DeleteConfirmation.tsx
│   │   │   │   ├── PrioritySelector.tsx
│   │   │   │   ├── TagInput.tsx
│   │   │   │   └── TagChip.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   ├── SortSelector.tsx
│   │   │   │   └── ActiveFilters.tsx
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   ├── lib/
│   │   │   ├── auth.ts             # Better Auth client config
│   │   │   ├── api.ts              # API client with JWT
│   │   │   └── validation.ts       # Zod schemas
│   │   └── types/
│   │       └── index.ts            # TypeScript types
│   └── tests/
│       ├── components/
│       └── integration/
│
├── backend/                        # FastAPI application
│   ├── CLAUDE.md                   # Backend AI instructions
│   ├── pyproject.toml              # UV/pip dependencies
│   ├── .env.example
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Settings from env
│   │   ├── database.py             # SQLModel engine/session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── task.py             # Task SQLModel
│   │   │   └── tag.py              # Tag SQLModel + TaskTag junction
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── task.py             # Pydantic request/response
│   │   │   └── tag.py              # Tag schemas
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py             # Dependencies (JWT verify)
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── tasks.py        # Task CRUD + search/filter/sort endpoints
│   │   │       └── tags.py         # Tag CRUD endpoints
│   │   └── middleware/
│   │       ├── __init__.py
│   │       └── auth.py             # JWT verification
│   └── tests/
│       ├── conftest.py
│       ├── unit/
│       ├── contract/
│       └── integration/
│
├── specs/                          # Organized specifications
│   └── 002-fullstack-web-app/
│       └── [as documented above]
│
├── .specify/                       # SpecKit Plus
│   └── memory/
│       └── constitution.md
│
├── CLAUDE.md                       # Root AI instructions
├── docker-compose.yml              # Local dev: frontend + backend + postgres
├── .gitignore
└── README.md                       # Setup instructions
```

**Structure Decision**: Web application (Option 2) with `/frontend` and `/backend` directories. This matches the constitution's monorepo structure requirement and provides clear separation of concerns for the Next.js + FastAPI architecture.

## Complexity Tracking

> No violations requiring justification. Architecture follows standard patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
