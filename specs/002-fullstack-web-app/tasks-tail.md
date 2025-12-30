- [ ] T125 [US9] Implement DELETE /api/{user_id}/tags/{tag_id} endpoint with cascade
- [ ] T126 [US9] Update TaskCreate/Update schemas to include tag_ids field
- [ ] T127 [US9] Update task endpoints to handle tag associations on create/update
- [ ] T128 [P] [US9] Add Tag types to frontend/src/types/index.ts
- [ ] T129 [US9] Create TagChip component in frontend/src/components/tasks/TagChip.tsx
- [ ] T130 [US9] Create TagInput component with autocomplete in frontend/src/components/tasks/TagInput.tsx
- [ ] T131 [US9] Integrate TagInput into TaskForm component
- [ ] T132 [US9] Add tag chips display to TaskItem component
- [ ] T133 [US9] Add tag fetch to dashboard initialization

**Checkpoint**: User Story 9 complete - users can tag tasks

---

## Phase 10: User Story 10 - Search Tasks (Priority: P2) [Intermediate]

**Goal**: An authenticated user can search tasks by title, description, or tag content with debounced input.

**Independent Test**: Search for a term, verify matching tasks appear with highlighted text.

**Acceptance Criteria**:
- Search term entered → results appear within 500ms (after 300ms debounce)
- Search results found → matching text highlighted
- No results found → empty state with search term displayed
- Search cleared → all tasks displayed again
- Results update as user types (debounced)

### Tests for User Story 10

- [ ] T134 [P] [US10] Backend integration test for search query param in backend/tests/integration/test_search.py
- [ ] T135 [P] [US10] Frontend component test for SearchInput in frontend/tests/components/test_searchinput.tsx

### Implementation for User Story 10

- [ ] T136 [US10] Add search query parameter support to GET /api/{user_id}/tasks endpoint
- [ ] T137 [US10] Implement search logic (title, description, tags) in task queries
- [ ] T138 [P] [US10] Add TaskListParams type with search field to frontend/src/types/index.ts
- [ ] T139 [US10] Create SearchInput component with debounce in frontend/src/components/search/SearchInput.tsx
- [ ] T140 [P] [US10] Add searchParams state to dashboard
- [ ] T141 [US10] Integrate SearchInput into dashboard header
- [ ] T142 [US10] Implement result highlighting in TaskList component
- [ ] T143 [US10] Handle empty search results with clear message

**Checkpoint**: User Story 10 complete - users can search tasks

---

## Phase 11: User Story 11 - Filter Tasks (Priority: P2) [Intermediate]

**Goal**: An authenticated user can filter tasks by status, priority, or tags with visual feedback of active filters.

**Independent Test**: Apply filters, verify only matching tasks appear, clear filters to see all tasks.

**Acceptance Criteria**:
- Filter by status → only tasks with that status shown
- Filter by priority → only tasks with that priority shown
- Filter by tags → only tasks with those tags shown
- Multiple filters → tasks matching ALL filters shown (AND logic)
- Clear filters → all tasks displayed again
- Active filters → visual indicator shows which filters are applied

### Tests for User Story 11

- [ ] T144 [P] [US11] Backend integration test for filter query params in backend/tests/integration/test_filter.py
- [ ] T145 [P] [US11] Frontend component test for FilterPanel in frontend/tests/components/test_filterpanel.tsx

### Implementation for User Story 11

- [ ] T146 [US11] Add status, priority, tags query params to GET /api/{user_id}/tasks endpoint
- [ ] T147 [US11] Implement filter logic with AND semantics in task queries
- [ ] T148 [US11] Add filter fields to TaskListParams type
- [ ] T149 [P] [US11] Create FilterPanel component in frontend/src/components/search/FilterPanel.tsx
- [ ] T150 [P] [US11] Create SortSelector component in frontend/src/components/search/SortSelector.tsx
- [ ] T151 [US11] Create ActiveFilters component in frontend/src/components/search/ActiveFilters.tsx
- [ ] T152 [US11] Integrate FilterPanel and SortSelector into dashboard header
- [ ] T153 [US11] Add filter state management to dashboard
- [ ] T154 [US11] Implement filter/sort persistence in session

**Checkpoint**: User Story 11 complete - users can filter and sort tasks

---

## Phase 12: User Story 12 - Sort Tasks (Priority: P2) [Intermediate]

**Goal**: An authenticated user can sort tasks by different criteria (date, priority, title) with direction toggle.

**Independent Test**: Apply sort options, verify task order changes immediately.

**Acceptance Criteria**:
- Sort by creation date → tasks ordered by created_at (newest first or oldest first)
- Sort by priority → tasks ordered High → Medium → Low (or reverse)
- Sort alphabetically → tasks ordered A-Z or Z-A by title
- Change sort order → view updates immediately
- Sort combined with filters → filtered results sorted correctly

### Tests for User Story 12

- [ ] T155 [P] [US12] Backend integration test for sort query params in backend/tests/integration/test_sort.py
- [ ] T156 [P] [US12] Frontend component test for SortSelector in frontend/tests/components/test_sortselector.tsx

### Implementation for User Story 12

- [ ] T157 [US12] Add sort (field, order) query params to GET /api/{user_id}/tasks endpoint
- [ ] T158 [US12] Implement sort logic in task queries (created_at, priority, title)
- [ ] T159 [US12] Add sort fields to TaskListParams type
- [ ] T160 [US12] Ensure SortSelector component created (from US11) supports all sort options
- [ ] T161 [US12] Add sort direction toggle to SortSelector
- [ ] T162 [US12] Implement sort state management in dashboard
- [ ] T163 [US12] Verify sort persists with filters

**Checkpoint**: All 12 user stories complete - full Basic + Intermediate feature set

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T094 [P] Create backend health check endpoint in backend/src/api/routes/health.py
- [ ] T095 [P] Add @spec comments to all backend source files per constitution
- [ ] T096 [P] Add @spec comments to all frontend source files per constitution
- [ ] T097 Run backend security scan (safety check) and fix any HIGH/CRITICAL issues
- [ ] T098 Run frontend security scan (npm audit) and fix any HIGH/CRITICAL issues
- [ ] T099 [P] Add error toast notifications to frontend for API errors
- [ ] T100 [P] Add loading spinners to all async operations
- [ ] T101 Verify responsive design (320px-1920px) across all pages
- [ ] T102 Run full test suite and verify coverage (≥80% BE, ≥70% FE)
- [ ] T103 Update README.md with final setup and usage instructions
- [ ] T104 Validate quickstart.md steps work on fresh environment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (Registration) → Can start after Phase 2
  - US2 (Authentication) → Can start after Phase 2, integrates with US1
  - US3 (View Tasks) → Can start after Phase 2, requires auth from US2
  - US4 (Add Task) → Can start after Phase 2, requires US3 for display
  - US5 (Toggle Complete) → Can start after Phase 2, requires US3 for display
  - US6 (Update Task) → Can start after Phase 2, requires US3 for display
  - US7 (Delete Task) → Can start after Phase 2, requires US3 for display
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (CRITICAL BLOCKER)
    ↓
┌───────────────────────────────────────────────────┐
│  Phase 3: US1 (Registration) ←─── MVP START      │
│      ↓                                            │
│  Phase 4: US2 (Authentication)                   │
│      ↓                                            │
│  Phase 5: US3 (View Tasks) ←─── Requires Auth    │
│      ↓                                            │
│  Phase 6-9: US4-US7 can proceed in parallel      │
│  after US3, as they all use the task list UI     │
└───────────────────────────────────────────────────┘
    ↓
Phase 10: Polish
```

### Within Each User Story

1. Tests written first (they will fail)
2. Backend implementation (models → endpoints)
3. Frontend implementation (components → pages)
4. Integration and error handling
5. Story checkpoint validation

### Parallel Opportunities

**Phase 1 - Setup** (all [P] tasks):
```
T002 (backend init) | T003 (frontend init) | T004-T006 (CLAUDE.md files)
T007-T010 (config files)
```

**Phase 2 - Foundational** (backend and frontend can parallelize):
```
Backend: T011-T022 (sequential except [P] marked)
Frontend: T023-T032 (can run in parallel with backend)
```

**User Story Tests** (per story):
```
Each story's test tasks marked [P] can run in parallel
```

**Cross-Story Parallelization** (after US3 complete):
```
US4, US5, US6, US7 can all proceed in parallel once US3 is done
(they all depend on the task list UI from US3)
```

---

## Parallel Example: Phase 2 Foundation

```bash
# Backend foundation (sequential core, parallel utilities)
T011 → T012 → T013 → T014 (parallel) | T015 → T016 → T017
T018, T019, T020, T021, T022 (all parallel - just init files)

# Frontend foundation (mostly parallel)
T023 | T024 | T025 | T026 | T027 | T028 (all parallel)
T029 → T030 → T031 → T032 (sequential - layout dependencies)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Registration)
4. Complete Phase 4: User Story 2 (Authentication)
5. Complete Phase 5: User Story 3 (View Tasks)
6. **STOP and VALIDATE**: Users can register, login, view tasks
7. Deploy/demo MVP

### Intermediate Features (User Stories 8-12)

8. Complete Phase 8: US8 (Set Priority) → Users can set task priorities
9. Complete Phase 9: US9 (Add Tags) → Users can tag tasks
10. Complete Phase 10: US10 (Search) → Users can search tasks
11. Complete Phase 11: US11 (Filter) → Users can filter tasks
12. Complete Phase 12: US12 (Sort) → Users can sort tasks
13. Complete Phase 13: Polish → Production-ready

### Incremental Delivery

1. MVP (US1-3) → Users can register, login, see tasks
2. MVP + US4 (Add Task) → Users can create tasks
3. MVP + US5 (Toggle) → Users can complete tasks
4. MVP + US6 (Update) → Users can edit tasks
5. MVP + US7 (Delete) → Users can remove tasks
6. MVP + US8 (Priority) → Users can set priorities
7. MVP + US9 (Tags) → Users can tag tasks
8. MVP + US10 (Search) → Users can search tasks
9. MVP + US11 (Filter) → Users can filter tasks
10. MVP + US12 (Sort) → Users can sort tasks
11. Polish → Production-ready

### Suggested MVP Scope

**Minimum Viable Product**: User Stories 1, 2, 3
- User can register
- User can sign in
- User can view their tasks (seeded or empty state)

This delivers authentication + read capability, proving the full stack works.

---

## Task Summary

| Phase | Task Count | User Story |
|-------|------------|------------|
| Phase 1: Setup | 10 | - |
| Phase 2: Foundational | 22 | - |
| Phase 3: US1 Registration | 8 | US1 (P1) |
| Phase 4: US2 Authentication | 9 | US2 (P1) |
| Phase 5: US3 View Tasks | 11 | US3 (P1) |
| Phase 6: US4 Add Task | 10 | US4 (P2) |
| Phase 7: US5 Toggle Complete | 7 | US5 (P2) |
| Phase 8: US6 Update Task | 8 | US6 (P3) |
| Phase 9: US7 Delete Task | 8 | US7 (P3) |
| Phase 10: Polish | 11 | - |
| **Total** | **104** | **7 stories** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All source files MUST include @spec comments per constitution
