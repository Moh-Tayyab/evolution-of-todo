---
id: 0003
title: Generate tasks-md file
stage: tasks
date: 2025-12-26
surface: agent
model: claude-sonnet-4-5
feature: 001-console-todo-app
branch: 001-console-todo-app
user: user
command: /sp.tasks
labels: ["tasks", "implementation"]
links:
  spec: /specs/001-console-todo-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /specs/001-console-todo-app/tasks.md
tests:
  - None generated (tests are optional in tasks.md)
---

## Prompt

$ARGUMENTS

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: plan.md (tech stack, libraries, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (API endpoints), research.md (decisions), quickstart.md (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

3. **Execute task generation workflow**:
   - Load plan.md and extract tech stack, libraries, project structure
   - Load spec.md and extract user stories with their priorities (P1, P2, P3, etc.)
   - If data-model.md exists: Extract entities and map to user stories
   - If contracts/ exists: Map endpoints to user stories
   - If research.md exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness (each user story has all needed tasks, independently testable)

4. **Generate tasks.md**: Use `.specify/templates/tasks-template.md` as structure, fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from spec.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per story
   - Implementation strategy section (MVP first, incremental delivery)

5. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)

Context for task generation: $ARGUMENTS

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

## Response snapshot

Generated tasks.md at /specs/001-console-todo-app/tasks.md with 38 total tasks organized by 3 user stories:

**Summary**:
- Total tasks: 38
- Phase 1 (Setup): 2 tasks (T001-T002)
- Phase 2 (Foundational): 2 tasks (T003-T004)
- Phase 3 (US1 - Manage Task Lifecycle P1 MVP): 14 tasks (T005-T021, 3 optional tests)
- Phase 4 (US2 - Handle Invalid Input Gracefully P2): 6 tasks (T022-T027)
- Phase 5 (US3 - Navigate Application Intuitively P3): 4 tasks (T028-T031)
- Phase 6 (Polish): 7 tasks (T032-T038)

**Task Count per User Story**:
- User Story 1 (P1): 14 tasks (11 implementation + 3 optional tests) - MVP candidate
- User Story 2 (P2): 6 tasks (error handling enhancements)
- User Story 3 (P3): 4 tasks (UI polish and navigation)

**Parallel Opportunities**:
- Setup: 2 parallelizable tasks
- Foundational: Sequential (T003 before T004)
- US1: 6 parallelizable CLI prompt tasks (T013-T018), 3 parallelizable test tasks
- US2: Sequential (depends on US1)
- US3: Sequential (depends on US1)
- Polish: 3 parallelizable tasks

**Independent Test Criteria**:
- US1: Launch app, add/view/update/delete/toggle tasks, verify persistence in memory
- US2: Attempt invalid operations, verify error messages and no crashes
- US3: Launch app, verify menu clarity, seamless navigation, clean exit

**Format Validation**: All tasks follow checklist format with checkbox, Task ID, [P] marker, [Story] label, and file path

**Suggested MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (US1) = 18 tasks (21 with tests)

## Outcome

- ✅ Impact: High - tasks.md provides clear, executable implementation plan organized by user story for independent delivery
- 🧪 Tests: Optional test tasks included (T005-T007) for TDD approach but marked as skippable for time-constrained Phase I
- 📁 Files: Created /specs/001-console-todo-app/tasks.md with 38 actionable tasks across 6 phases
- 🔁 Next prompts: /sp.implement to execute the tasks sequentially, or /sp.adr to document architectural decisions identified during planning
- 🧠 Reflection: Tasks are well-organized by user story with clear dependencies and parallel opportunities. Each story has independent test criteria. MVP scope is clearly defined (US1 only). Optional test tasks allow flexibility in testing approach.

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation completed successfully
- Graders run and results (PASS/FAIL): Not applicable - no graders for tasks.md generation
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding test coverage percentage targets in Polish phase if constitution requires ≥80% coverage
