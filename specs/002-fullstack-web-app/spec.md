# Feature Specification: Phase II - Todo Full-Stack Web Application

**Feature Branch**: `002-fullstack-web-app`
**Created**: 2025-12-29
**Status**: Draft
**Input**: User description: "Transform the Phase I in-memory console Todo app into a modern, multi-user, persistent web application with responsive UI, RESTful API, database storage, and JWT-based authentication, while strictly adhering to Spec-Driven Development using Claude Code and Spec-Kit Plus."

## Clarifications

### Session 2025-12-29
- Q: What is the JWT token expiration duration? → A: 24 hours
- Q: What is the maximum number of tasks per user? → A: 100 tasks
- Q: What are the password requirements? → A: Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Registration (Priority: P1)

A new user visits the application and creates an account to start managing their personal todo tasks.

**Why this priority**: Without user registration, no user can access the system. This is the entry point for all functionality and a fundamental prerequisite for multi-user support.

**Independent Test**: Can be fully tested by navigating to signup page, filling out registration form, and verifying account creation. Delivers value by enabling user identity establishment.

**Acceptance Scenarios**:

1. **Given** a visitor on the signup page, **When** they enter a valid email and password and submit, **Then** their account is created and they are redirected to the task dashboard
2. **Given** a visitor on the signup page, **When** they enter an email that already exists, **Then** they see an error message indicating the email is taken
3. **Given** a visitor on the signup page, **When** they enter an invalid email format, **Then** they see a validation error before submission
4. **Given** a visitor on the signup page, **When** they enter a password that doesn't meet requirements, **Then** they see specific password requirement feedback

---

### User Story 2 - User Authentication (Priority: P1)

A registered user signs in to access their personal task dashboard and manage their todos.

**Why this priority**: Authentication is required for all task operations. Users cannot view or manage tasks without being authenticated.

**Independent Test**: Can be fully tested by signing in with valid credentials and verifying access to the dashboard. Delivers value by enabling secure access to personal tasks.

**Acceptance Scenarios**:

1. **Given** a registered user on the signin page, **When** they enter valid credentials, **Then** they are authenticated and redirected to their task dashboard
2. **Given** a user on the signin page, **When** they enter invalid credentials, **Then** they see an error message without revealing which field was incorrect
3. **Given** an authenticated user, **When** they click sign out, **Then** their session is terminated and they are redirected to the signin page
4. **Given** an unauthenticated user, **When** they try to access the task dashboard directly, **Then** they are redirected to the signin page

---

### User Story 3 - View Personal Tasks (Priority: P1)

An authenticated user views their list of tasks with completion status indicators on the dashboard.

**Why this priority**: Viewing tasks is the core read operation. Users need to see their tasks before they can manage them.

**Independent Test**: Can be fully tested by signing in and viewing the task list with mixed completion states. Delivers value by providing visibility into personal task inventory.

**Acceptance Scenarios**:

1. **Given** an authenticated user with existing tasks, **When** they access the dashboard, **Then** they see all their tasks listed with title, description, and completion status
2. **Given** an authenticated user with no tasks, **When** they access the dashboard, **Then** they see an empty state message encouraging them to add their first task
3. **Given** an authenticated user, **When** they view tasks, **Then** completed tasks show a distinct visual indicator (checked box) from incomplete tasks (unchecked box)
4. **Given** User A is authenticated, **When** they view the dashboard, **Then** they only see their own tasks, not tasks belonging to other users

---

### User Story 4 - Add New Task (Priority: P2)

An authenticated user creates a new task with a title and optional description.

**Why this priority**: Adding tasks is the primary write operation that populates the user's task list. Critical for the app to be useful but requires authentication first.

**Independent Test**: Can be fully tested by creating a task and verifying it appears in the list. Delivers value by enabling users to capture new work items.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the dashboard, **When** they click "Add Task" and enter a title, **Then** a new task is created and appears in their task list
2. **Given** an authenticated user adding a task, **When** they provide both title and description, **Then** both are saved and displayed
3. **Given** an authenticated user, **When** they try to create a task without a title, **Then** they see a validation error requiring a title
4. **Given** an authenticated user, **When** they create a task, **Then** it is persisted and visible after page refresh

---

### User Story 5 - Mark Task Complete/Incomplete (Priority: P2)

An authenticated user toggles the completion status of a task with instant visual feedback.

**Why this priority**: Marking tasks complete is the primary user action that indicates progress. Essential for task management but depends on having tasks to mark.

**Independent Test**: Can be fully tested by toggling a task's status and verifying visual update. Delivers value by enabling users to track their progress.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an incomplete task, **When** they click the task checkbox, **Then** the task is marked complete with immediate visual feedback
2. **Given** an authenticated user with a completed task, **When** they click the task checkbox, **Then** the task is marked incomplete with immediate visual feedback
3. **Given** an authenticated user toggling a task, **When** the page is refreshed, **Then** the completion status persists

---

### User Story 6 - Update Task Details (Priority: P3)

An authenticated user modifies the title and/or description of an existing task.

**Why this priority**: Updating tasks allows users to correct mistakes or refine task descriptions. Important but less frequent than viewing, adding, or completing tasks.

**Independent Test**: Can be fully tested by editing a task's title/description and verifying changes persist. Delivers value by enabling users to refine their task definitions.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing their tasks, **When** they click edit on a task, **Then** they see a form pre-populated with the current title and description
2. **Given** an authenticated user editing a task, **When** they update the title and save, **Then** the new title is displayed in the task list
3. **Given** an authenticated user editing a task, **When** they clear the title and try to save, **Then** they see a validation error requiring a title
4. **Given** an authenticated user editing a task, **When** changes are saved, **Then** they persist after page refresh

---

### User Story 7 - Delete Task (Priority: P3)

An authenticated user removes a task from their list with confirmation.

**Why this priority**: Deletion is a destructive operation used less frequently. Users typically complete tasks rather than delete them.

**Independent Test**: Can be fully tested by deleting a task and verifying it no longer appears. Delivers value by enabling users to remove irrelevant tasks.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing their tasks, **When** they click delete on a task, **Then** they see a confirmation prompt
2. **Given** an authenticated user confirming deletion, **When** they confirm, **Then** the task is permanently removed from their list
3. **Given** an authenticated user at the delete confirmation, **When** they cancel, **Then** the task remains in their list
4. **Given** an authenticated user deleting a task, **When** the deletion completes, **Then** the task is removed from the database and does not reappear on refresh

---

### User Story 8 - Set Task Priority (Priority: P2) [Intermediate]

An authenticated user assigns a priority level (High, Medium, Low) to a task for better organization.

**Why this priority**: Priorities help users focus on what matters most. This is a key organizational feature that enhances task management beyond basic CRUD.

**Independent Test**: Can be fully tested by setting a priority on a task and verifying it displays correctly. Delivers value by enabling users to indicate task importance.

**Acceptance Scenarios**:

1. **Given** an authenticated user creating a task, **When** they select a priority level, **Then** the task is created with that priority
2. **Given** an authenticated user viewing their tasks, **When** they look at a task with priority, **Then** they see a visual indicator of the priority level (color/icon)
3. **Given** an authenticated user editing a task, **When** they change the priority, **Then** the new priority is saved and displayed
4. **Given** an authenticated user, **When** no priority is selected, **Then** the task defaults to Medium priority

---

### User Story 9 - Add Tags to Tasks (Priority: P2) [Intermediate]

An authenticated user adds tags to tasks for categorization and organization.

**Why this priority**: Tags enable flexible categorization beyond rigid hierarchies. Users can group related tasks across different contexts.

**Independent Test**: Can be fully tested by adding tags to a task and verifying they display correctly. Delivers value by enabling custom categorization.

**Acceptance Scenarios**:

1. **Given** an authenticated user creating or editing a task, **When** they add tags, **Then** the tags are saved with the task
2. **Given** an authenticated user viewing their tasks, **When** they look at a task with tags, **Then** they see the tags displayed as labels/chips
3. **Given** an authenticated user, **When** they enter a new tag name, **Then** it is created and associated with the task
4. **Given** an authenticated user, **When** they remove a tag from a task, **Then** the association is removed but the tag remains available for other tasks
5. **Given** an authenticated user, **When** they add a tag, **Then** existing tags are suggested via autocomplete

---

### User Story 10 - Search Tasks (Priority: P2) [Intermediate]

An authenticated user searches their tasks by title, description, or tag content.

**Why this priority**: Search is essential when users have many tasks. It enables quick access to specific tasks without scrolling through lists.

**Independent Test**: Can be fully tested by searching for a term and verifying matching tasks appear. Delivers value by enabling quick task discovery.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the dashboard, **When** they enter a search term, **Then** they see tasks matching the term in title or description
2. **Given** an authenticated user searching, **When** results are found, **Then** the matching text is highlighted
3. **Given** an authenticated user searching, **When** no results are found, **Then** they see an empty state with the search term displayed
4. **Given** an authenticated user searching, **When** they clear the search, **Then** all tasks are displayed again
5. **Given** an authenticated user, **When** they search, **Then** results update as they type (debounced, 300ms)

---

### User Story 11 - Filter Tasks (Priority: P2) [Intermediate]

An authenticated user filters their task list by status, priority, or tags.

**Why this priority**: Filtering helps users focus on specific subsets of tasks. Combined with search, it provides powerful task discovery.

**Independent Test**: Can be fully tested by applying filters and verifying only matching tasks appear. Delivers value by enabling focused task views.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the dashboard, **When** they filter by status (completed/incomplete), **Then** only tasks with that status are shown
2. **Given** an authenticated user, **When** they filter by priority (High/Medium/Low), **Then** only tasks with that priority are shown
3. **Given** an authenticated user, **When** they filter by tag, **Then** only tasks with that tag are shown
4. **Given** an authenticated user, **When** they apply multiple filters, **Then** tasks matching ALL filters are shown (AND logic)
5. **Given** an authenticated user, **When** they clear filters, **Then** all tasks are displayed again
6. **Given** an authenticated user, **When** filters are active, **Then** a clear indicator shows which filters are applied

---

### User Story 12 - Sort Tasks (Priority: P2) [Intermediate]

An authenticated user sorts their task list by different criteria.

**Why this priority**: Sorting provides different views of the same data. Users can organize by date, priority, or alphabetically based on current needs.

**Independent Test**: Can be fully tested by applying sort options and verifying task order changes. Delivers value by enabling customized task ordering.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the dashboard, **When** they sort by creation date, **Then** tasks are ordered by created_at (newest first or oldest first)
2. **Given** an authenticated user, **When** they sort by priority, **Then** tasks are ordered High → Medium → Low (or reverse)
3. **Given** an authenticated user, **When** they sort alphabetically, **Then** tasks are ordered A-Z or Z-A by title
4. **Given** an authenticated user, **When** they change sort order, **Then** the view updates immediately
5. **Given** an authenticated user, **When** sorting is combined with filters, **Then** filtered results are sorted according to selection

---

### Edge Cases

- What happens when a user's JWT token expires during an active session? System shows session expired message and redirects to signin without data loss.
- How does the system handle concurrent edits to the same task? Last write wins with timestamp-based conflict resolution.
- What happens when the database connection fails during a task operation? User sees a friendly error message with retry option; no partial data is saved.
- How does the system handle extremely long task titles or descriptions? Input is limited to reasonable lengths (title: 200 chars, description: 2000 chars) with client-side and server-side validation.
- What happens when a user tries to access another user's tasks via direct API call? System returns 403 Forbidden; authorization is enforced at API layer.
- What happens when a user reaches the 100 task limit? System returns 400 Bad Request with message "Task limit reached (100 maximum)"; user must delete tasks before adding new ones.

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication Requirements
- **FR-001**: System MUST provide a user signup page with email and password fields
- **FR-002**: System MUST validate email format and password strength during signup (minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number)
- **FR-003**: System MUST provide a user signin page with email and password fields
- **FR-004**: System MUST authenticate users and issue JWT tokens (24-hour expiration) upon successful signin
- **FR-005**: System MUST provide a signout mechanism that invalidates the current session
- **FR-006**: System MUST redirect unauthenticated users to signin page when accessing protected routes
- **FR-007**: System MUST verify JWT tokens on every API request to protected endpoints
- **FR-008**: System MUST return 401 Unauthorized for requests with missing or invalid JWT tokens

#### Task Management Requirements
- **FR-009**: System MUST allow authenticated users to create tasks with a required title and optional description (maximum 100 tasks per user)
- **FR-010**: System MUST allow authenticated users to view all their tasks
- **FR-011**: System MUST display tasks with their title, description (if present), and completion status
- **FR-012**: System MUST allow authenticated users to update the title and/or description of their tasks
- **FR-013**: System MUST allow authenticated users to toggle the completion status of their tasks
- **FR-014**: System MUST allow authenticated users to delete their tasks with confirmation
- **FR-015**: System MUST persist all task data to the database immediately upon creation, update, or deletion

#### Data Isolation Requirements
- **FR-016**: System MUST scope all task operations to the authenticated user's ID
- **FR-017**: System MUST prevent users from accessing, viewing, or modifying tasks belonging to other users
- **FR-018**: API endpoints MUST include user_id in the path (e.g., /api/{user_id}/tasks) and verify it matches the authenticated user

#### Intermediate Feature Requirements
- **FR-023**: System MUST allow authenticated users to assign a priority level (High, Medium, Low) to tasks, defaulting to Medium
- **FR-024**: System MUST display priority levels with distinct visual indicators (colors/icons)
- **FR-025**: System MUST allow authenticated users to add tags to tasks for categorization
- **FR-026**: System MUST provide tag autocomplete based on existing user tags
- **FR-027**: System MUST allow authenticated users to search tasks by title, description, or tag content
- **FR-028**: System MUST provide debounced search (300ms) with result highlighting
- **FR-029**: System MUST allow authenticated users to filter tasks by status (completed/incomplete)
- **FR-030**: System MUST allow authenticated users to filter tasks by priority level
- **FR-031**: System MUST allow authenticated users to filter tasks by tag
- **FR-032**: System MUST support multiple simultaneous filters with AND logic
- **FR-033**: System MUST allow authenticated users to sort tasks by creation date, priority, or title
- **FR-034**: System MUST persist user's current filter and sort preferences in the session

#### User Interface Requirements
- **FR-035**: Frontend MUST provide responsive design that works on desktop and mobile devices
- **FR-036**: Frontend MUST provide instant visual feedback when toggling task completion
- **FR-037**: Frontend MUST display appropriate loading states during API operations
- **FR-038**: Frontend MUST display user-friendly error messages for all error conditions
- **FR-039**: Frontend MUST provide a search input field in the task list header
- **FR-040**: Frontend MUST provide filter controls for status, priority, and tags
- **FR-041**: Frontend MUST provide sort controls with direction toggle
- **FR-042**: Frontend MUST show active filter/sort state clearly to users

### Key Entities

- **User**: Represents a registered user of the system. Managed by Better Auth. Contains unique identifier, email, password hash, and account metadata.
- **Task**: Represents a todo item belonging to a specific user. Contains unique identifier, user reference, title (required), description (optional), priority level (High/Medium/Low), completion status, and timestamps for creation and modification.
- **Tag**: Represents a user-defined label for categorizing tasks. Contains unique identifier, user reference, name, and color (optional). Tags are user-scoped (each user has their own tag namespace).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the signup process in under 60 seconds
- **SC-002**: Users can complete the signin process in under 30 seconds
- **SC-003**: Authenticated users can add a new task in under 10 seconds
- **SC-004**: Task completion toggle provides visual feedback within 200ms of user action
- **SC-005**: All task operations (create, read, update, delete) complete and persist successfully
- **SC-006**: 100% of API requests without valid JWT return 401 Unauthorized
- **SC-007**: 100% of cross-user task access attempts are blocked (return 403 Forbidden)
- **SC-008**: Application displays correctly on screens from 320px to 1920px width
- **SC-009**: All 5 Basic Level features (Add, View, Update, Delete, Mark Complete) function correctly for authenticated users
- **SC-010**: User data isolation is maintained—no user can access another user's tasks through any means
- **SC-011**: All 5 Intermediate Level features (Priorities, Tags, Search, Filter, Sort) function correctly
- **SC-012**: Search results appear within 500ms of user input (after 300ms debounce)
- **SC-013**: Filter and sort operations complete within 200ms
- **SC-014**: Tag autocomplete suggestions appear within 200ms of typing

## Assumptions

- Users have modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Users have stable internet connectivity for API operations
- Email addresses serve as unique user identifiers
- Password requirements: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number
- Better Auth provides standard session management and JWT issuance capabilities
- Neon PostgreSQL provides reliable serverless database connectivity
- Local development environment can run both frontend (Node.js) and backend (Python) servers

## Dependencies

- Phase I console Todo app (completed) - provides feature requirements baseline
- Better Auth library for authentication in Next.js frontend
- FastAPI with JWT verification middleware for backend
- SQLModel ORM for database operations
- Neon Serverless PostgreSQL for data persistence
- Shared BETTER_AUTH_SECRET between frontend and backend for JWT verification

## Out of Scope

- Advanced features (recurring tasks, due dates, reminders, notifications)
- AI-powered chatbot interface
- Real-time updates via WebSockets
- Deployment to Kubernetes or cloud providers
- Admin panels or multi-role access
- Social authentication (Google, GitHub, etc.)
- Password reset functionality (can be added in future phase)
- Email verification (can be added in future phase)

---

## Repository Structure Requirements

The project MUST be organized as a monorepo with the following structure:

```
/
├── frontend/                    # Next.js application
│   ├── CLAUDE.md               # Frontend-specific AI instructions
│   └── ...
├── backend/                     # FastAPI application
│   ├── CLAUDE.md               # Backend-specific AI instructions
│   └── ...
├── specs/                       # Organized specification files
│   ├── 002-fullstack-web-app/
│   │   ├── spec.md             # This file
│   │   ├── overview.md         # Phase II overview
│   │   ├── features/
│   │   │   ├── task-crud.md    # Task CRUD feature specs
│   │   │   └── authentication.md # Auth feature specs
│   │   ├── api/
│   │   │   └── rest-endpoints.md # API contract
│   │   ├── database/
│   │   │   └── schema.md       # Database schema
│   │   └── ui/
│   │       ├── components.md   # UI components
│   │       └── pages.md        # Page specifications
│   └── ...
├── .specify/                    # SpecKit Plus configuration
│   └── memory/
│       └── constitution.md     # Updated for Phase II
├── CLAUDE.md                    # Root AI instructions
├── docker-compose.yml          # Local development setup
└── README.md                   # Setup instructions
```

### CLAUDE.md Layering Requirements

- **Root CLAUDE.md**: Project-wide instructions, monorepo structure, shared conventions
- **frontend/CLAUDE.md**: Next.js conventions, Better Auth integration, TypeScript standards
- **backend/CLAUDE.md**: FastAPI conventions, SQLModel patterns, JWT verification

---

## API Contract Requirements

### Base URL Pattern
All task endpoints MUST follow: `/api/{user_id}/tasks`

### Required Endpoints

#### Task Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | `/api/{user_id}/tasks` | List all tasks for user (supports query params for search, filter, sort) | Yes (JWT) |
| POST   | `/api/{user_id}/tasks` | Create new task | Yes (JWT) |
| GET    | `/api/{user_id}/tasks/{task_id}` | Get single task | Yes (JWT) |
| PUT    | `/api/{user_id}/tasks/{task_id}` | Update task | Yes (JWT) |
| PATCH  | `/api/{user_id}/tasks/{task_id}` | Partial update (e.g., toggle complete) | Yes (JWT) |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete task | Yes (JWT) |

#### Tag Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET    | `/api/{user_id}/tags` | List all tags for user | Yes (JWT) |
| POST   | `/api/{user_id}/tags` | Create new tag | Yes (JWT) |
| PUT    | `/api/{user_id}/tags/{tag_id}` | Update tag | Yes (JWT) |
| DELETE | `/api/{user_id}/tags/{tag_id}` | Delete tag | Yes (JWT) |

### Query Parameters for Task List
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search term for title/description/tags |
| `status` | string | Filter by status: `completed`, `incomplete`, `all` (default) |
| `priority` | string | Filter by priority: `high`, `medium`, `low` |
| `tags` | string | Comma-separated tag IDs to filter by |
| `sort` | string | Sort field: `created_at`, `priority`, `title` (default: `created_at`) |
| `order` | string | Sort direction: `asc`, `desc` (default: `desc`) |

### Request/Response Contracts

#### Create Task (POST)
**Request Body**:
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (optional, max 2000 chars)",
  "priority": "string (optional, default 'medium', one of: high, medium, low)",
  "tag_ids": "array of UUIDs (optional)"
}
```

**Response (201 Created)**:
```json
{
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "title": "string",
  "description": "string | null",
  "priority": "string (high | medium | low)",
  "completed": false,
  "tags": [{"id": "UUID", "name": "string", "color": "string | null"}],
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

#### List Tasks (GET)
**Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "string (UUID)",
      "user_id": "string (UUID)",
      "title": "string",
      "description": "string | null",
      "priority": "string (high | medium | low)",
      "completed": "boolean",
      "tags": [{"id": "UUID", "name": "string", "color": "string | null"}],
      "created_at": "ISO 8601 timestamp",
      "updated_at": "ISO 8601 timestamp"
    }
  ],
  "count": "integer"
}
```

#### Update Task (PUT/PATCH)
**Request Body**:
```json
{
  "title": "string (optional for PATCH)",
  "description": "string | null (optional)",
  "priority": "string (optional, one of: high, medium, low)",
  "completed": "boolean (optional)",
  "tag_ids": "array of UUIDs (optional, replaces existing tags)"
}
```

#### Create Tag (POST /api/{user_id}/tags)
**Request Body**:
```json
{
  "name": "string (required, max 50 chars)",
  "color": "string (optional, hex color code)"
}
```

**Response (201 Created)**:
```json
{
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "name": "string",
  "color": "string | null",
  "created_at": "ISO 8601 timestamp"
}
```

#### List Tags (GET /api/{user_id}/tags)
**Response (200 OK)**:
```json
{
  "tags": [
    {
      "id": "string (UUID)",
      "name": "string",
      "color": "string | null",
      "task_count": "integer"
    }
  ],
  "count": "integer"
}
```

### Error Responses

| Status | Condition | Response Body |
|--------|-----------|---------------|
| 400    | Invalid request body | `{"error": "validation_error", "details": [...]}` |
| 401    | Missing/invalid JWT | `{"error": "unauthorized", "message": "..."}` |
| 403    | user_id mismatch | `{"error": "forbidden", "message": "..."}` |
| 404    | Task not found | `{"error": "not_found", "message": "..."}` |

### Authentication Header
All requests MUST include: `Authorization: Bearer <jwt_token>`

---

## Database Schema Requirements

### Users Table (Managed by Better Auth)
Better Auth manages the users table with at minimum:
- `id` - Unique identifier (UUID)
- `email` - User email (unique)
- `password_hash` - Hashed password
- Standard auth metadata (created_at, updated_at, etc.)

### Tasks Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique task identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL | Owner reference |
| `title` | VARCHAR(200) | NOT NULL | Task title |
| `description` | TEXT | NULLABLE | Optional description |
| `priority` | VARCHAR(10) | NOT NULL, DEFAULT 'medium' | Priority level (high, medium, low) |
| `completed` | BOOLEAN | NOT NULL, DEFAULT false | Completion status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Tags Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique tag identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL | Owner reference |
| `name` | VARCHAR(50) | NOT NULL | Tag name |
| `color` | VARCHAR(7) | NULLABLE | Optional hex color code |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

### Task_Tags Junction Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `task_id` | UUID | FOREIGN KEY → tasks.id, NOT NULL | Task reference |
| `tag_id` | UUID | FOREIGN KEY → tags.id, NOT NULL | Tag reference |
| PRIMARY KEY | (task_id, tag_id) | | Composite primary key |

### Indexes
- PRIMARY KEY on `tasks.id`
- INDEX on `tasks.user_id` (for efficient user task queries)
- INDEX on `tasks.priority` (for priority filtering)
- PRIMARY KEY on `tags.id`
- INDEX on `tags.user_id` (for efficient user tag queries)
- UNIQUE constraint on `(tags.user_id, tags.name)` (unique tag names per user)
- UNIQUE constraint on `users.email`

### Relationships
- `tasks.user_id` → `users.id` (Many-to-One)
- `tags.user_id` → `users.id` (Many-to-One)
- `task_tags.task_id` → `tasks.id` (Many-to-Many via junction)
- `task_tags.tag_id` → `tags.id` (Many-to-Many via junction)
- ON DELETE CASCADE: When user is deleted, all their tasks and tags are deleted
- ON DELETE CASCADE: When task is deleted, its tag associations are deleted

---

## UI/UX Requirements

### Pages Required

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| Landing/Home | `/` | No | Redirect to signin or dashboard |
| Sign Up | `/signup` | No | Registration form |
| Sign In | `/signin` | No | Login form |
| Dashboard | `/dashboard` | Yes | Task list and management |

### Component Requirements

#### Authentication Components
- **SignUpForm**: Email, password, confirm password fields with validation
- **SignInForm**: Email, password fields with "remember me" option
- **SignOutButton**: Clears session and redirects

#### Task Components
- **TaskList**: Displays all user tasks with empty state
- **TaskItem**: Single task with checkbox, priority indicator, title, description, tags, edit/delete buttons
- **TaskForm**: Create/edit modal with title (required), description (optional), priority selector, tag input
- **DeleteConfirmation**: Modal confirming task deletion
- **PrioritySelector**: Dropdown or button group for High/Medium/Low selection
- **TagInput**: Input with autocomplete for adding/removing tags
- **TagChip**: Visual representation of a tag with optional remove button

#### Search/Filter/Sort Components
- **SearchInput**: Text input for searching tasks with debounce
- **FilterPanel**: Controls for filtering by status, priority, tags
- **SortSelector**: Dropdown for sort field and direction
- **ActiveFilters**: Display of currently active filters with clear buttons

#### Layout Components
- **Header**: App title, user info, sign out button
- **ProtectedRoute**: Wrapper that redirects unauthenticated users

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Visual Feedback Requirements
- Loading spinners during API calls
- Success/error toast notifications
- Checkbox animation on completion toggle
- Form validation errors inline

---

## Configuration Requirements

### Environment Variables

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=<shared-secret>
```

#### Backend (.env)
```
DATABASE_URL=postgresql://...@neon.tech/...
BETTER_AUTH_SECRET=<shared-secret>
CORS_ORIGINS=http://localhost:3000
```

### Shared Secret
`BETTER_AUTH_SECRET` MUST be identical between frontend and backend for JWT verification.

---

## Deliverables Checklist

### Required Files in GitHub Repository

#### Configuration
- [ ] `.specify/memory/constitution.md` - Updated with Phase II constraints
- [ ] `CLAUDE.md` (root) - Project-wide AI instructions
- [ ] `frontend/CLAUDE.md` - Frontend-specific instructions
- [ ] `backend/CLAUDE.md` - Backend-specific instructions

#### Specifications
- [ ] `specs/002-fullstack-web-app/spec.md` - This specification
- [ ] `specs/002-fullstack-web-app/overview.md` - Phase II overview
- [ ] `specs/002-fullstack-web-app/features/task-crud.md` - Task CRUD specs
- [ ] `specs/002-fullstack-web-app/features/authentication.md` - Auth specs
- [ ] `specs/002-fullstack-web-app/api/rest-endpoints.md` - API contract
- [ ] `specs/002-fullstack-web-app/database/schema.md` - Database schema
- [ ] `specs/002-fullstack-web-app/ui/components.md` - Component specs
- [ ] `specs/002-fullstack-web-app/ui/pages.md` - Page specs

#### Frontend Application
- [ ] `/frontend/` - Complete Next.js 16+ app with App Router
- [ ] Better Auth integration with JWT plugin
- [ ] API client that attaches JWT to requests
- [ ] All pages: signup, signin, dashboard
- [ ] All components: TaskList, TaskItem, TaskForm, etc.
- [ ] Tailwind CSS styling
- [ ] TypeScript throughout

#### Backend Application
- [ ] `/backend/` - Complete FastAPI application
- [ ] JWT verification middleware
- [ ] SQLModel models for Task
- [ ] User-filtered routes (user_id in path)
- [ ] CORS configuration
- [ ] Database connection to Neon PostgreSQL

#### Infrastructure
- [ ] `docker-compose.yml` - Local development setup (recommended)
- [ ] `README.md` - Setup instructions with env var documentation

#### Evidence
- [ ] Multiple spec versions showing iterative refinement (if applicable)
- [ ] All code generated by Claude Code (no manual coding)
