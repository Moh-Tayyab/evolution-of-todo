# CLI Interface Contract: Console Todo Application

**Feature**: Phase I Console Todo Application
**Contract Type**: CLI Menu Interface
**Date**: 2025-12-25

## Menu Contract

### Main Menu Options

| Option Number | Label | Action | Input Required |
|---------------|-------|--------|----------------|
| 1 | Add Task | Create new task with title and optional description | Title (required), Description (optional) |
| 2 | View Tasks | Display all tasks with ID, title, description, status | None |
| 3 | Update Task | Modify title/description of existing task | Task ID (required), New Title (optional), New Description (optional) |
| 4 | Delete Task | Remove task by ID | Task ID (required) |
| 5 | Toggle Complete | Flip completion status of task by ID | Task ID (required) |
| 6 | Exit | Terminate application gracefully | None |

### Input Format

**Title Input**: Free-form string (1-200 characters)
- Required for Add Task operation
- Must not be empty (validation enforced)
- Trim whitespace before storage

**Description Input**: Free-form string (0-1000 characters)
- Optional for Add Task and Update Task operations
- Can be empty string
- Defaults to empty string if not provided

**Task ID Input**: Positive integer (≥1)
- Required for Update, Delete, Toggle Complete operations
- Must reference existing task ID
- Validation: ID must exist in task list

### Output Format

**Task List Display** (from FR-005):

```
[ID] [Status] Title - Description: {description}
```

Where:
- `[ID]`: Numeric task identifier
- `[Status]`: Either `[ ]` (incomplete) or `[x]` (complete)
- `Title`: Task title (trimmed)
- `Description`: Task description or "(no description)" if empty

**Error Message Format** (from FR-009):

- `Task ID {id} not found`: When operation references non-existent ID
- `Title cannot be empty`: When Add Task with empty title
- `Invalid option. Please try again.`: When menu input not 1-6
- `No tasks available. Add some tasks to get started!`: When View Tasks on empty list

**Success Message Format** (from FR-010):

- `Task added successfully`: After Add Task operation
- `Task updated successfully`: After Update Task operation
- `Task deleted successfully`: After Delete Task operation
- `Task marked complete`: After Toggle Complete operation
- `Thank you for using Todo App. Goodbye!`: On Exit option

### Interaction Flow

**Menu Loop Sequence**:
1. Display main menu with 6 numbered options
2. Prompt user for option selection: "Enter option (1-6): "
3. Parse and validate input (must be integer 1-6)
4. Dispatch to appropriate action handler
5. Display success/error message
6. Return to step 1 (redisplay menu)

**Input Prompts**:

**Add Task**:
1. "Enter task title: " → Read until non-empty string
2. "Enter task description (optional, press Enter to skip): " → Read entire line, allow empty

**Update Task**:
1. "Enter task ID to update: " → Read integer, validate exists
2. "Enter new title (or press Enter to keep current): " → Read, use current if empty
3. "Enter new description (or press Enter to keep current): " → Read, use current if empty

**Delete Task**:
1. "Enter task ID to delete: " → Read integer, validate exists
2. "Are you sure you want to delete task {id}? (y/N): " → Confirm before deletion

**Toggle Complete**:
1. "Enter task ID to mark complete/incomplete: " → Read integer, validate exists
2. "Toggling task {id} to {status}" → Display action taken

**Exit**:
1. "Thank you for using Todo App. Goodbye!" → Display farewell
2. Terminate application loop

### Validation Rules

**Menu Input Validation** (from FR-012):
- Must be integer type (handle ValueError)
- Must be in range [1, 6] (handle out-of-range)
- Re-prompt on invalid input with error message

**Task ID Validation**:
- Must be positive integer
- Must exist in task list for update/delete/complete operations
- Display "Task ID {id} not found" if invalid

**Title Validation** (from FR-002, FR-009):
- Cannot be empty or whitespace-only
- Max length 200 characters
- Trim leading/trailing whitespace

**Description Validation**:
- Optional field (can be empty)
- Max length 1000 characters
- Trim whitespace

### Error Handling

**Recovery Strategy** (from US2):
- All user inputs wrapped in try/except blocks
- ValueError: Type conversion errors (menu input, task ID)
- IndexError: List access out of bounds (should not occur with proper validation)
- Exception caught → Display error message → Return to menu
- No unhandled exceptions propagate to top level (application crashes)

**Graceful Degradation**: None applicable (console app has no fallback modes)

## State Management

**Application State**:
- Task list stored in memory (`TodoManager._tasks: List[Task]`)
- Task ID counter (`TodoManager._next_id: int`) for auto-increment
- Application running flag for main loop

**Session Scope**:
- All data lost when application exits
- No persistence between sessions
- Single-user, no concurrency

## Testing Contract

### Manual Testing Scenarios

**Happy Path Tests** (from US1-AS):
1. Create task with title and description
2. View tasks and verify display format
3. Update task title
4. Delete task and confirm removal
5. Toggle completion status multiple times
6. Exit application cleanly

**Error Path Tests** (from US2-AS):
1. Attempt operation on non-existent task ID
2. Create task with empty title
3. Enter invalid menu option (0, 7, text)
4. Enter non-integer for menu or task ID
5. View tasks when list is empty

### Expected Behavior

**From Constitution SC-001**: Task creation in <10 seconds from menu selection
**From Constitution SC-003**: Handles ≥100 tasks without performance degradation
**From Constitution SC-004**: 100% of invalid operations display clear error messages without crashing
**From Constitution SC-005**: Full demo workflow in <60 seconds
