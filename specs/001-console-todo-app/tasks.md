---

description: "Task list for Phase I Console Todo Application implementation"
---

# Tasks: Phase I Console Todo Application

**Input**: Design documents from `/specs/001-console-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/cli-interface.md

**Tests**: Tests are optional for Phase I but recommended. Test tasks are included in optional sections and can be skipped if time-constrained.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Tests optional: `tests/` at repository root (if including tests)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic directory structure

- [X] T001 Create directory structure per implementation plan: src/models/, src/services/, src/cli/, src/__init__.py
- [X] T002 Create __init__.py files in src/models/, src/services/, src/cli/ to make them Python packages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create Task dataclass model in src/models/task.py with id, title, description, completed, created_at attributes (@spec FR-002, data-model.md)
- [X] T004 Implement TodoManager service class in src/services/todo_manager.py with _tasks list and _next_id counter for state management (@spec FR-004, research.md)

**Checkpoint**: Foundation ready - Task model and TodoManager service available for user stories

---

## Phase 3: User Story 1 - Manage Task Lifecycle (Priority: P1) 🎯 MVP

**Goal**: Enable users to create, view, update, delete, and toggle completion status of tasks through an interactive console application

**Independent Test**: Launch application with `python -m src.main`, add 3 tasks, view list, update 1 task, delete 1 task, toggle 1 task complete, verify all operations persist in memory, then exit

### Tests for User Story 1 (OPTIONAL - recommended but can skip)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 [P] [US1] Unit test for Task model creation and validation in tests/unit/test_task.py
- [ ] T006 [P] [US1] Unit test for TodoManager CRUD operations in tests/unit/test_todo_manager.py
- [ ] T007 [P] [US1] Integration test for full add-view-update-delete workflow in tests/integration/test_task_lifecycle.py

### Implementation for User Story 1

- [X] T008 [US1] Implement TodoManager.add_task() method in src/services/todo_manager.py with title validation and auto-increment ID generation (@spec FR-003)
- [X] T009 [US1] Implement TodoManager.view_tasks() method in src/services/todo_manager.py that returns all tasks with display format (@spec FR-005)
- [X] T010 [US1] Implement TodoManager.update_task() method in src/services/todo_manager.py to update title/description by ID (@spec FR-006)
- [X] T011 [US1] Implement TodoManager.delete_task() method in src/services/todo_manager.py to remove task by ID (@spec FR-007)
- [X] T012 [US1] Implement TodoManager.toggle_complete() method in src/services/todo_manager.py to flip completed status (@spec FR-008)
- [X] T013 [P] [US1] Implement display_menu() function in src/cli/menu.py showing 6 numbered options: Add Task, View Tasks, Update Task, Delete Task, Toggle Complete, Exit (@spec FR-001)
- [X] T014 [P] [US1] Implement add_task_prompt() function in src/cli/menu.py to prompt for title (required) and description (optional) and call TodoManager.add_task()
- [X] T015 [P] [US1] Implement view_tasks_prompt() function in src/cli/menu.py to display all tasks in format `[ID] [Status] Title - Description: {description}` (@spec FR-005)
- [X] T016 [P] [US1] Implement update_task_prompt() function in src/cli/menu.py to prompt for ID, new title (optional to keep), new description (optional to keep), and call TodoManager.update_task()
- [X] T017 [P] [US1] Implement delete_task_prompt() function in src/cli/menu.py to prompt for ID and call TodoManager.delete_task()
- [X] T018 [P] [US1] Implement toggle_complete_prompt() function in src/cli/menu.py to prompt for ID and call TodoManager.toggle_complete()
- [X] T019 [US1] Implement main application loop in src/main.py that instantiates TodoManager, displays menu via menu.display_menu(), processes menu input, and routes to appropriate prompt functions
- [X] T020 [US1] Add success confirmation messages after each operation: "Task added successfully", "Task updated successfully", "Task deleted successfully", "Task marked complete/incomplete" (@spec FR-010)
- [X] T021 [US1] Ensure application returns to main menu after each operation (success or error) to allow continuous task management (@spec FR-010)

**Checkpoint**: At this point, User Story 1 should be fully functional - all 5 Basic Level operations (add, view, update, delete, complete) work independently and in sequence

---

## Phase 4: User Story 2 - Handle Invalid Input Gracefully (Priority: P2)

**Goal**: Display clear error messages when users provide invalid input without application crashes

**Independent Test**: Attempt invalid operations (delete non-existent task ID 99, update with empty title, mark complete on invalid ID, enter "xyz" for menu option) and verify helpful error messages display and application returns to menu without crashing

### Implementation for User Story 2

- [X] T022 [US2] Add menu option validation in src/cli/menu.py to handle non-integer inputs and out-of-range values (not 1-6), display "Invalid option. Please try again." and redisplay menu (@spec FR-009, FR-012)
- [X] T023 [US2] Add title validation in TodoManager.add_task() in src/services/todo_manager.py to reject empty strings, raise ValueError with "Title cannot be empty" (@spec FR-009)
- [X] T024 [US2] Add Task ID validation in TodoManager update/delete/toggle methods in src/services/todo_manager.py to check if ID exists, raise ValueError with "Task ID {id} not found" if not found (@spec FR-009)
- [X] T025 [US2] Add empty task list handling in TodoManager.view_tasks() in src/services/todo_manager.py to return special message "No tasks available. Add some tasks to get started!" when list is empty (@spec US2-AS3)
- [X] T026 [US2] Wrap all user input operations in CLI menu functions with try/except blocks to catch ValueError, display appropriate error messages, and continue to next menu iteration without propagating exceptions (@spec FR-012)
- [X] T027 [US2] Ensure add_task_prompt() accepts empty description in src/cli/menu.py by allowing Enter key to skip description field and defaulting to empty string (@spec US2-AS4)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - all CRUD operations function with robust error handling

---

## Phase 5: User Story 3 - Navigate Application Intuitively (Priority: P3)

**Goal**: Provide clear, numbered menu with descriptive options and clean exit functionality

**Independent Test**: Launch application, observe menu clarity (numbered 1-6 with clear labels), navigate through options, verify seamless flow, and exit with goodbye message

### Implementation for User Story 3

- [X] T028 [US3] Verify menu option labels in src/cli/menu.py match exactly: "Add Task", "View Tasks", "Update Task", "Delete Task", "Toggle Complete", "Exit" with clear numbering 1-6 (@spec US3-AS1)
- [X] T029 [US3] Add welcome header "=== TODO APP ===" displayed at top of menu in src/cli/menu.py
- [X] T030 [US3] Implement exit_handler() function in src/cli/menu.py that displays "Thank you for using Todo App. Goodbye!" and cleanly terminates application loop (@spec FR-011, US3-AS2)
- [X] T031 [US3] Ensure consistent task display formatting in view_tasks_prompt() in src/cli/menu.py with clear separation between ID, status [ ]/[x], title, and description fields (@spec US3-AS4)

**Checkpoint**: All user stories should now be independently functional with professional, intuitive user experience

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure production readiness

- [ ] T032 [P] Add @spec reference comments to all functions/methods linking to specific spec requirements (Principle VII compliance) in src/models/task.py, src/services/todo_manager.py, src/cli/menu.py, src/main.py
- [ ] T033 [P] Add docstrings to all functions and classes in src/models/task.py, src/services/todo_manager.py, src/cli/menu.py, src/main.py explaining purpose, parameters, and return values
- [ ] T034 Verify all PEP 8 naming conventions are followed (snake_case for functions/variables, PascalCase for classes)
- [ ] T035 Ensure no external dependencies are imported - verify only Python standard library modules used (dataclasses, typing, datetime, sys)
- [ ] T036 Run quickstart.md validation: Create virtual environment, run `python -m src.main`, execute manual test checklist
- [ ] T037 Run demo workflow test (SC-005): Add 3 tasks, view list, update 1 task, toggle 1 task complete, delete 1 task, exit in under 60 seconds
- [ ] T038 [P] Optional: Add additional unit tests for edge cases (long titles/descriptions, rapid task creation, toggle completion multiple times) in tests/unit/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after User Story 1 is complete - Builds error handling on top of CRUD operations
- **User Story 3 (P3)**: Can start after User Story 1 is complete - Enhances UI navigation, no blocking dependencies

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation (TDD approach)
- Models/services before CLI prompts
- CRUD operations before error handling
- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001, T002)
- Foundational tasks must be sequential (T003 before T004)
- Test tasks marked [P] can run in parallel (T005, T006, T007)
- CLI prompt functions marked [P] within US1 can run in parallel (T013-T018)
- Polish tasks marked [P] can run in parallel (T032, T033, T038)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if including tests):
Task: "Unit test for Task model creation and validation in tests/unit/test_task.py"
Task: "Unit test for TodoManager CRUD operations in tests/unit/test_todo_manager.py"
Task: "Integration test for full add-view-update-delete workflow in tests/integration/test_task_lifecycle.py"

# Launch all CLI prompt functions for User Story 1 together (after TodoManager complete):
Task: "Implement display_menu() function in src/cli/menu.py"
Task: "Implement add_task_prompt() function in src/cli/menu.py"
Task: "Implement view_tasks_prompt() function in src/cli/menu.py"
Task: "Implement update_task_prompt() function in src/cli/menu.py"
Task: "Implement delete_task_prompt() function in src/cli/menu.py"
Task: "Implement toggle_complete_prompt() function in src/cli/menu.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003, T004) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T005-T021 or T008-T021 if skipping tests)
4. **STOP and VALIDATE**: Test User Story 1 independently with quickstart.md manual test
5. Demo MVP - all 5 Basic Level operations functional

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo (MVP!)
3. Add User Story 2 → Test independently → Demo
4. Add User Story 3 → Test independently → Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 2 (error handling)
   - Developer C: User Story 3 (UI polish)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- If including tests, verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All code must include @spec: comments linking to spec requirements (Principle VII)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are OPTIONAL for Phase I - can skip T005-T007 if time-constrained
- Phase I constraint: Standard library only, no external packages
