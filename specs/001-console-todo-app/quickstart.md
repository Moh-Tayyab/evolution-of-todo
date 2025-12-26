# Quickstart: Phase I Console Todo Application

**Purpose**: Setup and run the console todo application from scratch
**Audience**: Hackathon judges, developers, maintainers

## Prerequisites

- **Python 3.13+** required (check with `python --version`)
- **UV** package manager for project setup (install from [https://github.com/astral-sh/uv](https://github.com/astral-sh/uv))
- **Git** for cloning repository

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd evolution-of-todo
git checkout 001-console-todo-app
```

### 2. Install UV (if not already installed)

```bash
# Linux/macOS
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 3. Create Virtual Environment

```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

**Note**: UV automatically installs Python 3.13+ in the virtual environment.

### 4. Verify Python Version

```bash
python --version
# Should output: Python 3.13.x
```

### 5. Install Dependencies

```bash
# Phase I uses only standard library - no external packages
# No `uv pip install` needed
```

**Dependencies**:
- None (standard library only)

## Running the Application

### Start Todo App

```bash
# From project root
python -m src.main
```

**Expected Output**:

```
=== TODO APP ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Toggle Complete
6. Exit

Enter option (1-6):
```

### Example Session

```bash
$ python -m src.main
=== TODO APP ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Toggle Complete
6. Exit

Enter option (1-6): 1
Enter task title: Buy groceries
Enter task description (optional, press Enter to skip): Milk, eggs, bread

Task added successfully!

=== TODO APP ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Toggle Complete
6. Exit

Enter option (1-6): 2

Tasks:
[1] [ ] Buy groceries - Desc: Milk, eggs, bread

=== TODO APP ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Toggle Complete
6. Exit

Enter option (1-6): 5
Enter task ID to mark complete: 1

Task 1 marked complete!

=== TODO APP ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Toggle Complete
6. Exit

Enter option (1-6): 6

Thank you for using Todo App. Goodbye!
```

## Directory Structure

```
evolution-of-todo/
├── .specify/
│   └── memory/
│       └── constitution.md
├── specs/
│   └── 001-console-todo-app/
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       ├── quickstart.md
│       ├── contracts/
│       │   └── cli-interface.md
│       └── checklists/
│           └── requirements.md
├── src/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── todo_manager.py
│   ├── cli/
│   │   ├── __init__.py
│   │   └── menu.py
│   └── main.py
└── history/
    ├── prompts/
    └── adr/
```

## Troubleshooting

### UV Installation Issues

**Problem**: `uv: command not found`
**Solution**: Ensure UV installation completed and add to PATH:
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$HOME/.local/bin:$PATH"
```

### Python Version Mismatch

**Problem**: `Python 3.12.x or earlier detected`
**Solution**: Ensure UV creates new venv with correct version:
```bash
rm -rf .venv
uv venv --python 3.13
```

### Import Errors

**Problem**: `ModuleNotFoundError: No module named 'src'`
**Solution**: Run from project root with `-m` flag:
```bash
python -m src.main
```

### Application Won't Start

**Problem**: Application exits immediately
**Solution**: Check for Python syntax errors in CLI output or run with verbose flag (if added):
```bash
python -m src.main --verbose  # Add verbose logging if needed
```

## Verification

### Manual Test Checklist

- [ ] Application starts without errors
- [ ] Main menu displays with 6 options
- [ ] Can add task with title and description
- [ ] Can view tasks with correct format `[ID] [Status] Title - Description`
- [ ] Can update task title/description by ID
- [ ] Can delete task by ID with confirmation
- [ ] Can toggle completion status
- [ ] Error messages display for invalid inputs (empty title, bad ID, invalid menu option)
- [ ] Application exits cleanly with goodbye message

### Demo Workflow Test (SC-005: <60 seconds)

Time yourself completing this workflow:
1. Add 3 tasks
2. View task list
3. Update 1 task
4. Toggle 1 task complete
5. Delete 1 task
6. Exit

**Goal**: Complete all steps in <60 seconds

## Next Steps

After confirming functionality:
- Review implementation against specification (@specs/001-console-todo-app/spec.md)
- Create PHR documenting AI generation process
- If issues found, iterate specification with `/sp.clarify`
- Proceed to create tasks with `/sp.tasks` for implementation

## Contact & Support

For hackathon questions or issues:
- Review specification: `/specs/001-console-todo-app/spec.md`
- Check constitution: `/.specify/memory/constitution.md`
- Run manual tests as documented in `/specs/001-console-todo-app/contracts/cli-interface.md`
