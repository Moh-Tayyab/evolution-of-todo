# Tasks: Complete Phase I with Intermediate & Advanced Features

**Feature**: 001-phase-i-complete
**Branch**: `001-phase-i-complete`
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Data Model**: [data-model.md](data-model.md)

---

## Implementation Strategy

**MVP Scope**: User Story 1 only (Basic Task Management)
**Delivery Approach**: Incremental by user story - each story is independently testable
**Test Coverage Target**: ≥80% per NFR-008

### User Story Priorities (from spec.md):
- **P1 (Critical)**: US1 - Basic Task Management
- **P2 (High)**: US2 - Task Organization, US3 - Search/Filter, US6 - Due Dates/Notifications
- **P3 (Medium)**: US4 - Sort, US5 - Recurring Tasks, US7 - Voice Input, US8 - Email Notifications

### Parallel Execution Opportunities:
- After Setup (Phase 1): All model files can be created in parallel
- After Foundational (Phase 2): User stories can be implemented in parallel where they don't share files
- Within each story: Tests can run in parallel with different file implementations

---

## Phase 1: Setup & Project Initialization

**Goal**: Initialize Python project with UV, configure dependencies, establish project structure

- [x] T001 Initialize UV project with Python 3.13+ in repository root (pyproject.toml)
- [x] T002 [P] Create src/ directory structure (models/, services/, cli/, lib/)
- [x] T003 [P] Create tests/ directory structure (unit/, contract/, integration/)
- [x] T004 [P] Create config/ directory with .env.example file
- [x] T005 Add core dependencies to pyproject.toml (plyer, SpeechRecognition, pyaudio, python-dotenv)
- [x] T006 Add testing dependencies to pyproject.toml (pytest, pytest-cov)
- [x] T007 [P] Create __init__.py files for all src/ subdirectories
- [x] T008 [P] Create pytest.ini with coverage configuration (≥80% target)
- [x] T009 [P] Create README.md with quickstart instructions per quickstart.md
- [x] T010 [P] Create .gitignore (Python, .env, __pycache__, .pytest_cache, htmlcov/)

**Acceptance**: `uv sync` succeeds, all directories exist, pytest discovers test paths

---

## Phase 2: Foundational Components

**Goal**: Implement shared models and utilities needed by multiple user stories

### Models (Blocking for all user stories)

- [x] T011 [P] Implement Priority enum in src/models/priority.py (HIGH, MEDIUM, LOW with display methods)
- [x] T012 [P] Implement Recurrence enum in src/models/recurrence.py (DAILY, WEEKLY, MONTHLY, CUSTOM)
- [x] T013 Implement Task dataclass in src/models/task.py with all 10 attributes and validation
- [x] T014 [P] Implement Notification dataclass in src/models/notification.py (NotificationType, NotificationStatus enums)
- [x] T015 [P] Implement EmailConfig dataclass in src/models/email_config.py with from_env() classmethod

### Utilities (Blocking for date-related features)

- [x] T016 [P] Implement date parsing utilities in src/lib/date_utils.py (parse YYYY-MM-DD, validate format)
- [x] T017 [P] Implement notification platform detection in src/lib/notification_utils.py

**Acceptance**: All model files importable, validation rules enforced, utilities functional

---

## Phase 3: User Story 1 - Basic Task Management (P1) 🎯 MVP

**Goal**: Implement core CRUD operations for tasks - this is the minimal viable product

**Why this story**: Foundation for all other features. Delivers immediate value.

**Independent Test**: Create task → View tasks → Update task → Toggle complete → Delete task

### Services

- [x] T018 [US1] Implement TaskList.__init__() in src/services/todo_list.py (initialize empty list, next_id counter)
- [x] T019 [US1] Implement TaskList.create_task() in src/services/todo_list.py (FR-001, FR-002, FR-016 validation)
- [x] T020 [US1] Implement TaskList.get_all_tasks() in src/services/todo_list.py (FR-003)
- [x] T021 [P] [US1] Implement TaskList.get_task() in src/services/todo_list.py (FR-003)
- [x] T022 [P] [US1] Implement TaskList.update_task() in src/services/todo_list.py (FR-008, FR-009, FR-011)
- [x] T023 [P] [US1] Implement TaskList.delete_task() in src/services/todo_list.py (FR-007, FR-010)
- [x] T024 [US1] Implement TaskList.toggle_complete() in src/services/todo_list.py (FR-005, FR-006 with timestamp)

### CLI Commands

- [x] T025 [P] [US1] Implement menu display in src/cli/menu.py (FR-090, FR-095 - show 9 options with v2.0)
- [x] T026 [US1] Implement menu selection handler in src/cli/menu.py (FR-091 - validate 1-9, loop until valid)
- [x] T027 [P] [US1] Implement handle_view_all() in src/cli/commands.py (FR-003, FR-004 - format [ ]/[x])
- [x] T028 [P] [US1] Implement handle_add_task() in src/cli/commands.py (FR-001, FR-093 - prompt title/description)
- [x] T029 [P] [US1] Implement handle_update_task() in src/cli/commands.py (FR-008, FR-009, FR-011, FR-093)
- [x] T030 [P] [US1] Implement handle_delete_task() in src/cli/commands.py (FR-007, FR-010, FR-093 - confirm Y/N)
- [x] T031 [P] [US1] Implement handle_toggle_complete() in src/cli/commands.py (FR-005, FR-006, FR-093)
- [x] T032 [US1] Implement main application loop in src/cli/main.py (FR-092 - loop until exit)
- [x] T033 [P] [US1] Implement input validation utilities in src/cli/input_validators.py (validate non-empty, numeric ID)

### Integration Tests

- [x] T034 [US1] Write integration test for complete CRUD flow in tests/integration/test_cli_flow.py (US1 acceptance scenarios)

**Story Acceptance**: All US1 acceptance scenarios pass, MVP functional

---

## Phase 4: User Story 2 - Task Organization (P2)

**Goal**: Add priority levels and tag categorization to tasks

**Why this story**: Users need organizational tools for managing multiple tasks across contexts

**Independent Test**: Create tasks with priorities/tags → View formatted display → Update priorities/tags → Verify persistence

### Services (Extend TaskList)

- [ ] T035 [US2] Update TaskList.create_task() to accept priority parameter in src/services/todo_list.py (FR-021)
- [ ] T036 [P] [US2] Update TaskList.create_task() to accept tags parameter in src/services/todo_list.py (FR-024)
- [ ] T037 [P] [US2] Update TaskList.update_task() to handle priority updates in src/services/todo_list.py (FR-021)
- [ ] T038 [P] [US2] Update TaskList.update_task() to handle tag updates in src/services/todo_list.py (FR-024)

### CLI Commands (Extend existing)

- [ ] T039 [US2] Update handle_view_all() to display priority indicators in src/cli/commands.py (FR-022 - [HIGH]/[MED]/[LOW])
- [ ] T040 [P] [US2] Update handle_view_all() to display tags in src/cli/commands.py (FR-025 - comma-separated)
- [ ] T041 [P] [US2] Update handle_add_task() to prompt for priority in src/cli/commands.py (FR-021, FR-093)
- [ ] T042 [P] [US2] Update handle_add_task() to prompt for tags in src/cli/commands.py (FR-024, FR-093 - comma-separated input)
- [ ] T043 [P] [US2] Update handle_update_task() to allow priority/tag changes in src/cli/commands.py (FR-021, FR-024)

### Integration Tests

- [ ] T044 [US2] Write integration test for priority/tag workflow in tests/integration/test_cli_flow.py (US2 acceptance scenarios)

**Story Acceptance**: Tasks display with [HIGH]/[MED]/[LOW] prefix and tags, updates persist

---

## Phase 5: User Story 3 - Search and Filter (P2)

**Goal**: Enable users to find tasks quickly via keyword search and multi-criteria filtering

**Why this story**: Critical for managing large task lists efficiently

**Independent Test**: Create diverse tasks → Search by keyword → Filter by status/priority/date → Verify results match criteria

### Services (Extend TaskList)

- [ ] T045 [US3] Implement TaskList.search_tasks() in src/services/todo_list.py (FR-030 - case-insensitive title/description search)
- [ ] T046 [P] [US3] Implement TaskList.filter_tasks() in src/services/todo_list.py (FR-032, FR-033, FR-034, FR-035 - AND logic)

### CLI Commands

- [ ] T047 [P] [US3] Implement handle_search() in src/cli/commands.py (FR-030, FR-037 - prompt keyword, display results)
- [ ] T048 [US3] Implement handle_filter() with submenu in src/cli/commands.py (FR-031, FR-036 - status/priority/date/clear options)
- [ ] T049 [US3] Implement filter submenu loop in src/cli/commands.py (FR-032, FR-033, FR-034, FR-035 - apply AND logic)

### Integration Tests

- [ ] T050 [US3] Write integration test for search workflow in tests/integration/test_cli_flow.py (US3 search scenarios)
- [ ] T051 [P] [US3] Write integration test for filter workflow in tests/integration/test_cli_flow.py (US3 filter scenarios)

**Story Acceptance**: Search returns case-insensitive matches, filters combine with AND logic, submenu navigable

---

## Phase 6: User Story 6 - Due Dates and Notifications (P2)

**Goal**: Add due date tracking and browser notifications for time-sensitive tasks

**Why this story**: Transforms app from passive list to proactive task management system

**Independent Test**: Add task with due date → View overdue highlighting → Trigger notification (if enabled) → Mark complete cancels notification

### Services

- [ ] T052 [P] [US6] Update TaskList.create_task() to accept due_date parameter in src/services/todo_list.py (FR-060, FR-061)
- [ ] T053 [P] [US6] Update TaskList.update_task() to handle due_date updates in src/services/todo_list.py (FR-060)
- [ ] T054 [US6] Implement NotificationService class in src/services/notification_service.py (init with plyer)
- [ ] T055 [US6] Implement NotificationService.check_notifications() in src/services/notification_service.py (FR-064, FR-065 - check today/overdue)
- [ ] T056 [P] [US6] Implement NotificationService.trigger_browser_notification() in src/services/notification_service.py (FR-064, FR-067 - graceful permission denial)
- [ ] T057 [P] [US6] Implement NotificationService.cancel_notification() in src/services/notification_service.py (FR-066)

### CLI Commands

- [ ] T058 [P] [US6] Update handle_view_all() to highlight overdue tasks in src/cli/commands.py (FR-063 - ⚠️ OVERDUE prefix)
- [ ] T059 [P] [US6] Update handle_view_all() to display due dates in src/cli/commands.py (FR-062 - Due: YYYY-MM-DD)
- [ ] T060 [P] [US6] Update handle_add_task() to prompt for due_date in src/cli/commands.py (FR-060, FR-093 - validate YYYY-MM-DD)
- [ ] T061 [P] [US6] Update handle_update_task() to allow due_date changes in src/cli/commands.py (FR-060)
- [ ] T062 [US6] Add notification check to main loop in src/cli/main.py (FR-065 - startup + every 5 min)
- [ ] T063 [US6] Update handle_toggle_complete() to cancel notifications in src/cli/main.py (FR-066)

### Integration Tests

- [ ] T064 [US6] Write integration test for due date workflow in tests/integration/test_notifications.py (US6 acceptance scenarios)

**Story Acceptance**: Due dates display, overdue tasks highlighted, notifications trigger at startup (if permissions granted)

---

## Phase 7: User Story 4 - Sort Tasks (P3)

**Goal**: Allow users to reorder task list by due date, priority, or title

**Why this story**: Enhances usability by letting users view tasks in preferred order

**Independent Test**: Create tasks with varied attributes → Sort by due date → Sort by priority → Sort alphabetically → Verify ordering

### Services (Extend TaskList)

- [ ] T065 [P] [US4] Implement TaskList.sort_tasks() in src/services/todo_list.py (FR-040, FR-041, FR-042 - due_date/priority/title)

### CLI State Management

- [ ] T066 [US4] Add current_sort state to main.py (FR-044 - persist in session, reset on restart)
- [ ] T067 [US4] Update handle_view_all() to apply current sort in src/cli/commands.py (FR-043)
- [ ] T068 [P] [US4] Implement sort menu options in src/cli/commands.py (prompt for due_date/priority/title)

### Integration Tests

- [ ] T069 [US4] Write integration test for sort workflows in tests/integration/test_cli_flow.py (US4 acceptance scenarios)

**Story Acceptance**: Sort by due date (nulls last), priority (H→M→L→None), title (A-Z) all functional

---

## Phase 8: User Story 5 - Recurring Tasks (P3)

**Goal**: Auto-create next instance of recurring tasks when marked complete

**Why this story**: Saves time for repetitive tasks (daily standup, weekly reports, etc.)

**Independent Test**: Create recurring task → Mark complete → Verify new instance created with correct next due date

### Services

- [ ] T070 [US5] Implement RecurrenceService class in src/services/recurrence_service.py
- [ ] T071 [P] [US5] Implement calculate_next_due_date() for DAILY in src/services/recurrence_service.py (FR-053 - +1 day)
- [ ] T072 [P] [US5] Implement calculate_next_due_date() for WEEKLY in src/services/recurrence_service.py (FR-053 - +7 days)
- [ ] T073 [US5] Implement calculate_next_due_date() for MONTHLY in src/services/recurrence_service.py (FR-053 - month-end handling per clarification)
- [ ] T074 [P] [US5] Implement calculate_next_due_date() for CUSTOM in src/services/recurrence_service.py (FR-053 - +interval days)
- [ ] T075 [US5] Implement TaskList.create_recurring_instance() in src/services/todo_list.py (FR-051, FR-052 - copy attrs, reset completion)
- [ ] T076 [P] [US5] Update TaskList.create_task() to accept recurrence parameters in src/services/todo_list.py (FR-050)
- [ ] T077 [P] [US5] Update TaskList.update_task() to handle recurrence changes in src/services/todo_list.py (FR-054)

### CLI Commands

- [ ] T078 [P] [US5] Update handle_view_all() to show recurrence indicator in src/cli/commands.py (FR-056 - 🔁 icon)
- [ ] T079 [P] [US5] Update handle_add_task() to prompt for recurrence in src/cli/commands.py (FR-050 - daily/weekly/monthly/custom)
- [ ] T080 [US5] Update handle_toggle_complete() to create next instance in src/cli/commands.py (FR-051 - call create_recurring_instance)
- [ ] T081 [P] [US5] Update handle_delete_task() to prompt for recurring deletion scope in src/cli/commands.py (FR-055 - this/all instances)

### Integration Tests

- [ ] T082 [US5] Write integration test for recurring task lifecycle in tests/integration/test_recurring_tasks.py (US5 acceptance scenarios)

**Story Acceptance**: Recurring tasks auto-create next instance with correct due date (including month-end edge cases)

---

## Phase 9: User Story 7 - Voice Input (P3)

**Goal**: Enable hands-free task creation via voice transcription

**Why this story**: Modern convenience feature for quick task capture

**Independent Test**: Select voice option → Speak task description → Verify task created with transcribed title (or fallback to manual)

### Services

- [ ] T083 [US7] Implement VoiceService class in src/services/voice_service.py (init with SpeechRecognition)
- [ ] T084 [US7] Implement VoiceService.record_and_transcribe() in src/services/voice_service.py (FR-071, FR-072 - 30s max)
- [ ] T085 [P] [US7] Implement VoiceService.is_available() in src/services/voice_service.py (check microphone presence)

### CLI Commands

- [ ] T086 [US7] Implement handle_voice_input() in src/cli/commands.py (FR-070, FR-073, FR-074 - record, transcribe, create or fallback)

### Integration Tests

- [ ] T087 [US7] Write integration test for voice input workflow in tests/integration/test_voice_input.py (US7 acceptance scenarios - mock audio)

**Story Acceptance**: Voice transcription works (or gracefully degrades), task created from spoken text

---

## Phase 10: User Story 8 - Email Notifications (P3)

**Goal**: Send email alerts for high-priority tasks that are due or overdue

**Why this story**: Multi-channel alerting for critical tasks

**Independent Test**: Configure SMTP → Create high-priority task with due date → Trigger email when due within 24h (or graceful degradation if not configured)

### Services

- [ ] T088 [US8] Implement EmailNotificationService class in src/services/email_service.py (init with EmailConfig.from_env)
- [ ] T089 [P] [US8] Implement EmailNotificationService.is_configured() in src/services/email_service.py (FR-083, FR-084)
- [ ] T090 [US8] Implement EmailNotificationService.send_email() in src/services/email_service.py (FR-080, FR-081, FR-082, FR-085, FR-086)

### CLI Integration

- [ ] T091 [US8] Add email notification check to main loop in src/cli/main.py (FR-081, FR-082 - check high-priority tasks)

### Integration Tests

- [ ] T092 [US8] Write integration test for email notification workflow in tests/integration/test_notifications.py (US8 acceptance scenarios - mock SMTP)

**Story Acceptance**: Email sent for high-priority tasks due within 24h (or logs warning if not configured)

---

## Phase 11: Polish & Cross-Cutting Concerns

**Goal**: Add final touches, documentation, testing infrastructure

### Testing Infrastructure

- [ ] T093 [P] Write unit tests for Task model in tests/unit/test_task.py (validation rules, edge cases)
- [ ] T094 [P] Write unit tests for Priority enum in tests/unit/test_priority.py (display format, sort order)
- [ ] T095 [P] Write unit tests for Recurrence enum in tests/unit/test_recurrence.py
- [ ] T096 [P] Write unit tests for TaskList service in tests/unit/test_todo_list.py (all CRUD methods)
- [ ] T097 [P] Write unit tests for RecurrenceService in tests/unit/test_recurrence.py (month-end calculations)
- [ ] T098 [P] Write unit tests for date utilities in tests/unit/test_date_utils.py (parse, validate)
- [ ] T099 [P] Write contract tests for TaskService in tests/contract/test_task_service_contract.py
- [ ] T100 [P] Write contract tests for CLI commands in tests/contract/test_cli_commands_contract.py
- [ ] T101 [P] Write contract tests for NotificationService in tests/contract/test_notification_contract.py

### Documentation & Configuration

- [ ] T102 [P] Update README.md with complete usage instructions per quickstart.md
- [ ] T103 [P] Create .env.example with all SMTP variables in config/ directory
- [ ] T104 [P] Add @spec comments to all source files (100% traceability per FR-009, Principle I)

### Quality Validation

- [ ] T105 Run pytest with coverage report (verify ≥80% per NFR-008)
- [ ] T106 Validate all acceptance scenarios pass (US1-US8)
- [ ] T107 Validate Phase I → Phase II gate checklist (constitution.md)

**Phase Acceptance**: All tests pass, coverage ≥80%, spec traceability 100%, constitution compliance verified

---

## Dependency Graph

```
Setup (Phase 1)
    ↓
Foundational (Phase 2: Models + Utilities)
    ↓
├─→ US1 (P1) ─→ MVP Complete ✅
    ↓
├─→ US2 (P2) (extends US1)
├─→ US3 (P2) (extends US1)
├─→ US6 (P2) (extends US1, needs date_utils from Phase 2)
    ↓
├─→ US4 (P3) (extends US1, US2, US6)
├─→ US5 (P3) (extends US1, US6, needs RecurrenceService)
├─→ US7 (P3) (extends US1, independent of others)
├─→ US8 (P3) (extends US2, US6, needs EmailConfig from Phase 2)
    ↓
Polish (Phase 11: Tests + Docs)
```

**Key Insights**:
- US1 must complete first (all others depend on it)
- US2, US3, US6 can develop in parallel after US1
- US4, US5, US7, US8 can develop in parallel after their dependencies
- Testing can occur in parallel with implementation

---

## Parallel Execution Examples

### After Setup (Phase 1) - Models in Parallel
```bash
# Terminal 1: Priority enum
# Terminal 2: Recurrence enum
# Terminal 3: Task dataclass
# Terminal 4: Notification model
# Terminal 5: EmailConfig
```

### After US1 Complete - Parallel Stories
```bash
# Team A: US2 (Task Organization)
# Team B: US3 (Search/Filter)
# Team C: US6 (Due Dates/Notifications)
```

### Polish Phase - Tests in Parallel
```bash
# Terminal 1: Unit tests
# Terminal 2: Contract tests
# Terminal 3: Integration tests
# Terminal 4: Documentation
```

---

## Task Summary

**Total Tasks**: 107
**MVP Tasks (US1)**: 17 tasks (T018-T034)
**Tasks per Story**:
- Setup & Foundation: 27 tasks (T001-T027 equivalent)
- US1 (P1): 17 tasks
- US2 (P2): 10 tasks
- US3 (P2): 7 tasks
- US6 (P2): 13 tasks
- US4 (P3): 5 tasks
- US5 (P3): 13 tasks
- US7 (P3): 5 tasks
- US8 (P3): 5 tasks
- Polish: 15 tasks

**Parallelizable Tasks**: 67 tasks (marked with [P])
**Independent Stories**: US7 (Voice) can develop fully independently after US1

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All user story tasks include [US#] label
✅ All parallelizable tasks include [P] marker
✅ All task IDs sequential (T001-T107)
✅ All descriptions include specific file paths

---

**Tasks Status**: Ready for `/sp.implement` or `/sp.taskstoissues`
**Recommended Start**: Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1 MVP)