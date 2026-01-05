# Tasks: Phase II - Todo Full-Stack Web Application

**Input**: Design documents from `/specs/002-fullstack-web-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included as the constitution requires ≥80% backend coverage, ≥70% frontend coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create monorepo directory structure per implementation plan (frontend/, backend/, specs/)
- [ ] T002 [P] Initialize backend Python project with pyproject.toml in backend/pyproject.toml
- [ ] T003 [P] Initialize frontend Next.js 16+ project with package.json in frontend/package.json
- [ ] T004 [P] Create root CLAUDE.md with project-wide AI instructions
- [ ] T005 [P] Create backend/CLAUDE.md with FastAPI conventions and patterns
- [ ] T006 [P] Create frontend/CLAUDE.md with Next.js conventions and patterns
- [ ] T007 [P] Create docker-compose.yml for local development (postgres, backend, frontend)
- [ ] T008 [P] Create backend/.env.example with required environment variables
- [ ] T009 [P] Create frontend/.env.local.example with required environment variables
- [ ] T010 Update root README.md with setup instructions and quickstart guide

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T011 Create backend configuration module in backend/src/config.py (Settings from env)
- [ ] T012 Create database connection module in backend/src/database.py (SQLModel async engine)
- [ ] T013 Create Task SQLModel entity in backend/src/models/task.py per data-model.md
- [ ] T014 [P] Create Pydantic schemas in backend/src/schemas/task.py (TaskCreate, TaskUpdate, TaskRead)
- [ ] T015 Create JWT verification middleware in backend/src/middleware/auth.py
- [ ] T016 Create API dependencies in backend/src/api/deps.py (verify_jwt, get_current_user_id)
- [ ] T017 Create FastAPI main app in backend/src/main.py with CORS and routes
- [ ] T018 [P] Create backend/src/models/__init__.py with model exports
- [ ] T019 [P] Create backend/src/schemas/__init__.py with schema exports
- [ ] T020 [P] Create backend/src/api/__init__.py with router setup
- [ ] T021 [P] Create backend/src/api/routes/__init__.py with route registration
- [ ] T022 [P] Create backend/tests/conftest.py with pytest fixtures

### Frontend Foundation

- [ ] T023 Configure Tailwind CSS in frontend/tailwind.config.ts
- [ ] T024 Configure TypeScript in frontend/tsconfig.json
- [ ] T025 Create Better Auth client configuration in frontend/src/lib/auth.ts
- [ ] T026 Create API client with JWT attachment in frontend/src/lib/api.ts
- [ ] T027 Create Zod validation schemas in frontend/src/lib/validation.ts
- [ ] T028 Create TypeScript types in frontend/src/types/index.ts per data-model.md
- [ ] T029 Create root layout with providers in frontend/src/app/layout.tsx
- [ ] T030 Create ProtectedRoute component in frontend/src/components/layout/ProtectedRoute.tsx
- [ ] T031 Create Header component in frontend/src/components/layout/Header.tsx
- [ ] T032 Create landing page with redirect logic in frontend/src/app/page.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: A new user can create an account to start managing their personal todo tasks

**Independent Test**: Navigate to signup page, fill registration form, verify account creation and redirect to dashboard

**Acceptance Criteria**:
- Valid email/password → account created, redirected to dashboard
- Existing email → error message "email is taken"
- Invalid email format → validation error before submission
- Weak password → specific password requirement feedback

### Tests for User Story 1

- [ ] T033 [P] [US1] Backend integration test for signup endpoint in backend/tests/integration/test_signup.py
- [ ] T034 [P] [US1] Frontend component test for SignUpForm in frontend/tests/components/test_signup.tsx

### Implementation for User Story 1

- [ ] T035 [P] [US1] Create SignUpForm component in frontend/src/components/auth/SignUpForm.tsx
- [ ] T036 [US1] Create signup page in frontend/src/app/signup/page.tsx
- [ ] T037 [US1] Implement signup API route handler (Better Auth handles this via frontend/src/lib/auth.ts)
- [ ] T038 [US1] Add password validation (8+ chars, uppercase, lowercase, number) to SignUpForm
- [ ] T039 [US1] Add email validation to SignUpForm
- [ ] T040 [US1] Add error handling and user feedback to SignUpForm

**Checkpoint**: User Story 1 complete - users can register accounts

---

## Phase 4: User Story 2 - User Authentication (Priority: P1)

**Goal**: A registered user can sign in to access their personal task dashboard

**Independent Test**: Sign in with valid credentials, verify access to dashboard and session management

**Acceptance Criteria**:
- Valid credentials → authenticated, redirected to dashboard
- Invalid credentials → generic error message (no field hints)
- Sign out → session terminated, redirected to signin
- Unauthenticated access to dashboard → redirected to signin

### Tests for User Story 2

- [ ] T041 [P] [US2] Backend test for JWT verification in backend/tests/unit/test_auth.py
- [ ] T042 [P] [US2] Frontend component test for SignInForm in frontend/tests/components/test_signin.tsx

### Implementation for User Story 2

- [ ] T043 [P] [US2] Create SignInForm component in frontend/src/components/auth/SignInForm.tsx
- [ ] T044 [P] [US2] Create SignOutButton component in frontend/src/components/auth/SignOutButton.tsx
- [ ] T045 [US2] Create signin page in frontend/src/app/signin/page.tsx
- [ ] T046 [US2] Implement signin API route handler (Better Auth via frontend/src/lib/auth.ts)
- [ ] T047 [US2] Implement signout functionality in SignOutButton
- [ ] T048 [US2] Add redirect logic to ProtectedRoute for unauthenticated users
- [ ] T049 [US2] Add session expiration handling (24h JWT) with redirect to signin

**Checkpoint**: User Stories 1 & 2 complete - users can register and authenticate

---

## Phase 5: User Story 3 - View Personal Tasks (Priority: P1)

**Goal**: An authenticated user can view their list of tasks with completion status indicators

**Independent Test**: Sign in, view task list with mixed completion states, verify user isolation

**Acceptance Criteria**:
- User with tasks → sees all tasks with title, description, completion status
- User with no tasks → sees empty state message
- Completed tasks → checked box visual indicator
- User isolation → only sees own tasks, not other users' tasks

### Tests for User Story 3

- [ ] T050 [P] [US3] Backend contract test for GET /api/{user_id}/tasks in backend/tests/contract/test_list_tasks.py
- [ ] T051 [P] [US3] Backend integration test for task listing in backend/tests/integration/test_tasks.py
- [ ] T052 [P] [US3] Frontend component test for TaskList in frontend/tests/components/test_tasklist.tsx

### Implementation for User Story 3

- [ ] T053 [US3] Implement GET /api/{user_id}/tasks endpoint in backend/src/api/routes/tasks.py
- [ ] T054 [US3] Add user_id validation (JWT sub must match path param) to tasks routes
- [ ] T055 [P] [US3] Create TaskList component in frontend/src/components/tasks/TaskList.tsx
- [ ] T056 [P] [US3] Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx
- [ ] T057 [US3] Create dashboard page in frontend/src/app/dashboard/page.tsx
- [ ] T058 [US3] Implement task fetching with API client in dashboard
- [ ] T059 [US3] Add empty state UI when user has no tasks
- [ ] T060 [US3] Add loading state UI while fetching tasks

**Checkpoint**: User Stories 1, 2 & 3 complete - users can view their tasks

---

## Phase 6: User Story 4 - Add New Task (Priority: P2)

**Goal**: An authenticated user can create a new task with title and optional description

**Independent Test**: Create a task, verify it appears in list and persists after refresh

**Acceptance Criteria**:
- Enter title only → task created, appears in list
- Enter title + description → both saved and displayed
- No title → validation error
- Task persists after page refresh

### Tests for User Story 4

- [ ] T061 [P] [US4] Backend contract test for POST /api/{user_id}/tasks in backend/tests/contract/test_create_task.py
- [ ] T062 [P] [US4] Frontend component test for TaskForm in frontend/tests/components/test_taskform.tsx

### Implementation for User Story 4

- [ ] T063 [US4] Implement POST /api/{user_id}/tasks endpoint in backend/src/api/routes/tasks.py
- [ ] T064 [US4] Add 100 task limit validation to create endpoint
- [ ] T065 [P] [US4] Create TaskForm component (modal) in frontend/src/components/tasks/TaskForm.tsx
- [ ] T066 [US4] Add "Add Task" button to dashboard that opens TaskForm modal
- [ ] T067 [US4] Implement task creation with API client
- [ ] T068 [US4] Add optimistic UI update after task creation
- [ ] T069 [US4] Add title validation (required, max 200 chars) to TaskForm
- [ ] T070 [US4] Add description validation (optional, max 2000 chars) to TaskForm

**Checkpoint**: User Stories 1-4 complete - users can create tasks

---

## Phase 7: User Story 5 - Mark Task Complete/Incomplete (Priority: P2)

**Goal**: An authenticated user can toggle task completion status with instant visual feedback

**Independent Test**: Toggle a task's status, verify visual update and persistence

**Acceptance Criteria**:
- Click checkbox on incomplete task → marked complete with immediate feedback
- Click checkbox on completed task → marked incomplete with immediate feedback
- Status persists after page refresh

### Tests for User Story 5

- [ ] T071 [P] [US5] Backend contract test for PATCH /api/{user_id}/tasks/{task_id} in backend/tests/contract/test_toggle_task.py
- [ ] T072 [P] [US5] Frontend integration test for toggle in frontend/tests/integration/test_toggle.tsx

### Implementation for User Story 5

- [ ] T073 [US5] Implement PATCH /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py
- [ ] T074 [US5] Add checkbox toggle handler to TaskItem component
- [ ] T075 [US5] Implement toggle API call with optimistic UI update
- [ ] T076 [US5] Add visual feedback (<200ms) for toggle action
- [ ] T077 [US5] Handle toggle error with rollback of optimistic update

**Checkpoint**: User Stories 1-5 complete - users can complete tasks

---

## Phase 8: User Story 6 - Update Task Details (Priority: P3)

**Goal**: An authenticated user can modify the title and/or description of an existing task

**Independent Test**: Edit a task, verify changes persist after refresh

**Acceptance Criteria**:
- Click edit → form pre-populated with current values
- Update title → new title displayed
- Clear title → validation error
- Changes persist after page refresh

### Tests for User Story 6

- [ ] T078 [P] [US6] Backend contract test for PUT /api/{user_id}/tasks/{task_id} in backend/tests/contract/test_update_task.py
- [ ] T079 [P] [US6] Frontend component test for edit mode in frontend/tests/components/test_edit.tsx

### Implementation for User Story 6

- [ ] T080 [US6] Implement PUT /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py
- [ ] T081 [US6] Add edit button to TaskItem component
- [ ] T082 [US6] Extend TaskForm to support edit mode (pre-populated values)
- [ ] T083 [US6] Implement update API call from TaskForm
- [ ] T084 [US6] Add optimistic UI update for task editing
- [ ] T085 [US6] Handle update error with user feedback

**Checkpoint**: User Stories 1-6 complete - users can edit tasks

---

## Phase 9: User Story 7 - Delete Task (Priority: P3)

**Goal**: An authenticated user can remove a task with confirmation

**Independent Test**: Delete a task with confirmation, verify it's removed and doesn't reappear

**Acceptance Criteria**:
- Click delete → confirmation prompt appears
- Confirm deletion → task permanently removed
- Cancel deletion → task remains
- Deleted task doesn't reappear after refresh

### Tests for User Story 7

- [ ] T086 [P] [US7] Backend contract test for DELETE /api/{user_id}/tasks/{task_id} in backend/tests/contract/test_delete_task.py
- [ ] T087 [P] [US7] Frontend component test for DeleteConfirmation in frontend/tests/components/test_delete.tsx

### Implementation for User Story 7

- [ ] T088 [US7] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py
- [ ] T089 [P] [US7] Create DeleteConfirmation modal in frontend/src/components/tasks/DeleteConfirmation.tsx
- [ ] T090 [US7] Add delete button to TaskItem component
- [ ] T091 [US7] Implement delete confirmation flow (show modal, confirm/cancel)
- [ ] T092 [US7] Implement delete API call with optimistic UI update
- [ ] T093 [US7] Handle delete error with user feedback

**Checkpoint**: All 7 user stories complete - full CRUD functionality

---
