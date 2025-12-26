# Phase I Research: Console Todo Application

**Phase**: 0 - Outline & Research
**Date**: 2025-12-25
**Feature**: Phase I Console Todo Application

## Decisions Made

### Testing Framework

**Question**: What testing approach for Python console app?

**Decision**: Use `unittest` from Python standard library

**Rationale**:
- Constitution requires standard library only (no external packages)
- `unittest` is built-in, mature, and well-documented
- `pytest` requires external dependency (violates constraint)
- Console apps have simple business logic; `unittest` is sufficient

**Alternatives Considered**:
- `pytest`: More modern, cleaner syntax, but requires `uv pip install` (external package)
- Custom assertions: Too ad-hoc, no test runner infrastructure
- No tests: Violates Quality Standards requirement for Phase I (≥80% coverage)

### Performance Goals

**Question**: What performance targets for in-memory console app?

**Decision**: No explicit performance metrics; ensure instantaneous operations

**Rationale**:
- In-memory operations (list/dict manipulation) are O(n) at worst
- Console I/O is limiting factor, not computation
- User experience goal: "instant feel" (response <100ms for all operations)
- Constitution SC-003: "System handles at least 100 tasks without performance degradation (list operations remain instant)"

**Alternatives Considered**:
- Specific latency targets (e.g., <50ms): Unnecessary for console app complexity
- Task count limits: Reduces user freedom; constitution says "no hard limit"
- Profiling/optimization: Premature; validate with user testing

### Type Hints Approach

**Question**: How to implement typed Task model?

**Decision**: Use `@dataclasses.dataclass` (Python 3.10+)

**Rationale**:
- Modern Python practice, cleaner than `__init__` methods
- Type hints built-in, no manual `__annotations__` management
- Immutability support (frozen=True option if needed)
- Better IDE support and mypy compatibility

**Alternatives Considered**:
- `typing.NamedTuple`: Too restrictive for optional fields (description)
- `pydantic.BaseModel`: External package, violates stdlib constraint
- Plain `__init__`: Verbose, more error-prone, less explicit typing

### Project Structure

**Question**: Single file vs multi-file modules?

**Decision**: Multi-file modules (src/models, src/services, src/cli)

**Rationale**:
- Constitution requires "professional and reproducible"
- Separation of concerns: data model (Task), business logic (TodoManager), presentation (CLI)
- Single file violates modular structure quality standard
- Supports Phase II migration (add persistence without massive refactor)

**Alternatives Considered**:
- Single main.py: Simpler but violates modularity requirement
- src/ + tests/ in root: Violates constitution monorepo structure (src/ at root, tests/ under src/)
- src/app/ nested: Unnecessary complexity for console app

### Menu System Design

**Question**: Numeric menu vs text commands?

**Decision**: Numeric menu (1-6) with confirmation prompts

**Rationale**:
- Simpler for users: "Press 1 to add task" vs remembering "add", "update", etc.
- Clear error handling: Validate integer in range (1-6)
- Better accessibility for hackathon demo (keyboard-only, no typing commands)
- FR-001 specifies "numbered options"

**Alternatives Considered**:
- Text commands ("add", "update"): More power-user friendly but less discoverable
- Hybrid (numbers + shortcuts): Added complexity for limited Phase I scope
- Command-line arguments: Violates spec (interactive console loop required)

### ID Generation Strategy

**Question**: How to generate unique task IDs?

**Decision**: Sequential integer starting from 1, stored as counter in TodoManager

**Rationale**:
- Simple, predictable: User can reference "task 3" easily
- FR-003 requires "unique integer ID"
- No external dependency like `uuid` (violates stdlib constraint)
- Handles deletions gracefully (IDs don't shift, only increment)

**Alternatives Considered**:
- `uuid.uuid4()`: External library, not needed for single-user app
- Timestamps as IDs: Hard for users to reference ("update task 1734928381")
- UUID string generation with `random`: Unnecessary complexity

### Error Handling Strategy

**Question**: How to handle invalid inputs?

**Decision**: Explicit validation with helpful messages, return to menu on all errors

**Rationale**:
- FR-009, FR-012 require clear error messages
- FR-010 requires return to main menu after all operations
- User experience: "Error: Task ID 99 not found. Press Enter to continue..."
- No exceptions propagate to top-level; all caught in CLI layer

**Alternatives Considered**:
- Exit on error: Frustrating user experience, violates FR-010
- Retry automatically: Can cause loops (e.g., validation errors)
- Silent failures: Unprofessional, violates Quality Standards

## Technical Context Summary

Based on research decisions above, Technical Context for Phase I:

**Language/Version**: Python 3.13+
**Primary Dependencies**: None (standard library only)
**Storage**: In-memory (list of Task objects)
**Testing**: unittest (Python stdlib)
**Target Platform**: Linux console
**Project Type**: Single project (console CLI)
**Performance Goals**: Instantaneous operations (<100ms for in-memory actions)
**Constraints**: No manual coding; all via Claude Code from specs
**Scale/Scope**: Single-user, single-session, no hard task count limit

## Dependencies Identified

None external. Using Python standard library exclusively:
- `dataclasses` (built-in)
- `unittest` (built-in)
- `typing` (built-in)
- `sys`, `os`, `datetime` (built-in)

## Integration Patterns

No external integrations. All internal modules:
- `src/models/task.py`: Task dataclass
- `src/services/todo_manager.py`: CRUD operations
- `src/cli/menu.py`: User interface, input parsing
- `src/main.py`: Entry point, orchestration
