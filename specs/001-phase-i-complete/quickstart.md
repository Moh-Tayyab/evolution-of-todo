# Quickstart Guide: Intelligent Todo Manager v2.0

**Feature**: 001-phase-i-complete
**Date**: 2025-12-29
**Spec**: [spec.md](spec.md)

---

## Prerequisites

- **Python**: 3.13 or later
- **UV**: Python package manager (https://github.com/astral-sh/uv)
- **Operating System**: Windows, macOS, or Linux
- **Microphone**: Required for voice input feature (optional)
- **Email Account**: SMTP credentials for email notifications (optional)

---

## Installation

### 1. Install UV (if not already installed)

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 2. Clone Repository

```bash
git clone <repository-url>
cd evolution-of-todo
git checkout 001-phase-i-complete
```

### 3. Install Dependencies

```bash
uv sync
```

This installs:
- Python 3.13+ (if not present)
- Core dependencies: plyer, SpeechRecognition, pyaudio, python-dotenv
- Testing dependencies: pytest, pytest-cov

**Note**: On macOS, pyaudio requires portaudio:
```bash
brew install portaudio
```

### 4. Configure Email (Optional)

Create `.env` file in project root:

```bash
cp config/.env.example .env
```

Edit `.env` with your SMTP credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_TO_EMAIL=recipient@example.com
```

**Gmail Users**: Use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

---

## Running the Application

### Start the Todo Manager

```bash
uv run python src/cli/main.py
```

You'll see the main menu:

```text
====================================
  INTELLIGENT TODO MANAGER v2.0
====================================
1. View All Tasks
2. Add Task
3. Update Task
4. Delete Task
5. Complete Task (Toggle)
6. Search Tasks
7. Filter Tasks
8. Add Task by Voice
9. Exit Application
====================================
Enter your choice (1-9):
```

---

## Basic Usage

### Add a Task

1. Select `2` from main menu
2. Enter task title (required)
3. Enter description (optional, press Enter to skip)
4. Choose priority: `high`, `medium`, `low`, or press Enter for none
5. Enter tags (comma-separated, optional)
6. Enter due date in YYYY-MM-DD format (optional)
7. Choose recurrence: `daily`, `weekly`, `monthly`, or press Enter for none

**Example**:
```
Enter your choice (1-9): 2
Task title: Buy groceries
Description (optional): Milk, eggs, bread
Priority (high/medium/low or Enter for none): high
Tags (comma-separated, optional): home,shopping
Due date (YYYY-MM-DD or Enter for none): 2025-12-30
Recurrence (daily/weekly/monthly or Enter for none): weekly
✓ Task created successfully (ID: 1)
```

### View All Tasks

Select `1` from main menu to see all tasks:

```
====================================
  ALL TASKS
====================================
[1] [ ] [HIGH] Buy groceries - Tags: home, shopping - Due: 2025-12-30 🔁
    Description: Milk, eggs, bread

[2] [x] [MED] Write report - Due: 2025-12-28 ⚠️ OVERDUE
    Completed: 2025-12-29 14:30:00
====================================
```

**Legend**:
- `[ ]` = Incomplete task
- `[x]` = Completed task
- `[HIGH]` / `[MED]` / `[LOW]` = Priority level
- `🔁` = Recurring task
- `⚠️ OVERDUE` = Past due date

### Complete a Task

1. Select `5` from main menu
2. Enter task ID
3. Task status toggles (incomplete ↔ complete)
4. If recurring: new instance created automatically

**Example**:
```
Enter your choice (1-9): 5
Enter task ID: 1
✓ Task #1 marked as complete
🔁 Created recurring instance (ID: 3) - Due: 2026-01-06
```

### Search Tasks

1. Select `6` from main menu
2. Enter keyword to search in titles and descriptions (case-insensitive)

**Example**:
```
Enter your choice (1-9): 6
Enter search keyword: grocery
====================================
  SEARCH RESULTS: "grocery"
====================================
[1] [x] [HIGH] Buy groceries - Tags: home, shopping
[3] [ ] [HIGH] Buy groceries - Tags: home, shopping - Due: 2026-01-06 🔁
====================================
Found 2 task(s)
```

### Filter Tasks

1. Select `7` from main menu
2. Choose filter submenu option:
   - `1` Filter by status (complete/incomplete/all)
   - `2` Filter by priority (high/medium/low/none)
   - `3` Filter by date range
   - `4` Clear all filters
   - `5` Back to main menu

Filters combine with AND logic (task must match all active filters).

**Example**:
```
Enter your choice (1-9): 7
====================================
  FILTER MENU
====================================
1. Filter by Status
2. Filter by Priority
3. Filter by Date Range
4. Clear Filters
5. Back to Main Menu
====================================
Current filters: Priority=HIGH, Status=Incomplete
Enter your choice (1-5): 1
```

### Add Task by Voice

1. Select `8` from main menu
2. Speak clearly when prompted (30 seconds max)
3. Task created with transcribed text as title
4. On error: option to retry or enter manually

**Example**:
```
Enter your choice (1-9): 8
Listening... Speak now (30 seconds max)
[User speaks: "Call dentist for appointment"]
✓ Transcribed: "Call dentist for appointment"
✓ Task created successfully (ID: 4)
```

**Troubleshooting**:
- Ensure microphone permissions granted
- Speak clearly and at moderate pace
- If transcription fails, use manual entry fallback

---

## Advanced Features

### Recurring Tasks

When you mark a recurring task complete:
1. Original task marked complete
2. New task automatically created
3. Due date calculated based on recurrence pattern
4. All attributes copied except completion status

**Recurrence Patterns**:
- `daily`: Next day
- `weekly`: +7 days
- `monthly`: Same day next month (or last day if original day doesn't exist)

### Browser Notifications

Notifications trigger automatically when:
- Task due date is today OR overdue
- Task is not completed
- App is running (checked at startup and every 5 minutes)

**Setup** (if prompted):
- Allow notification permissions when first notification appears
- Notifications show: "Task Due Today: [title]"

### Email Notifications

For high-priority tasks, emails sent when:
- Due date within 24 hours
- Due date has passed (overdue)

**Requirements**:
- `.env` file configured with SMTP settings
- High-priority task with due date

---

## Running Tests

### Run All Tests

```bash
uv run pytest
```

### Run with Coverage Report

```bash
uv run pytest --cov=src --cov-report=html --cov-report=term-missing
```

View HTML report: `open htmlcov/index.html`

### Run Specific Test Category

```bash
# Unit tests only
uv run pytest tests/unit/

# Integration tests only
uv run pytest tests/integration/

# Contract tests only
uv run pytest tests/contract/
```

---

## Troubleshooting

### Voice Input Not Working

**macOS**:
```bash
brew install portaudio
uv sync  # Reinstall pyaudio
```

**Windows**: Install [Microsoft Visual C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install portaudio19-dev python3-pyaudio
```

### Email Notifications Not Sending

1. Check `.env` file exists and has all required fields
2. Verify SMTP credentials (use app-specific password for Gmail)
3. Check application logs for error messages
4. Test SMTP connection manually:

```bash
uv run python -c "
from services.email_service import EmailConfig
config = EmailConfig.from_env()
print('Email configured:', config is not None)
"
```

### Browser Notifications Not Appearing

1. Check system notification permissions for Terminal/Python
2. **macOS**: System Settings → Notifications → Terminal → Allow Notifications
3. **Windows**: Settings → System → Notifications → Allow notifications from apps
4. **Linux**: Depends on desktop environment (GNOME, KDE, etc.)

### pyaudio Installation Fails

**Error**: `fatal error: 'portaudio.h' file not found`

**Solution**: Install portaudio system library first (see Voice Input section above)

---

## Configuration Files

### `.env` (Optional - Email Configuration)

Located at project root. Copy from `config/.env.example`.

Required fields for email notifications:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_TO_EMAIL=recipient@example.com
```

### `pyproject.toml`

UV project configuration (managed automatically).

Dependencies:
- **Core**: plyer, SpeechRecognition, pyaudio, python-dotenv
- **Testing**: pytest, pytest-cov

---

## Performance

- **Startup**: <3 seconds
- **Search**: <1 second for 1000 tasks
- **Filter**: <1 second for 1000 tasks
- **Sort**: <1 second for 1000 tasks
- **Voice transcription**: <5 seconds for 30-second audio

---

## Data Persistence

**Phase I**: Data stored in memory only. All tasks lost when application exits.

**Future (Phase II)**: PostgreSQL database with persistent storage.

---

## Next Steps

1. **Try Basic Features**: Add, view, complete, delete tasks
2. **Explore Organization**: Add priorities, tags, due dates
3. **Test Search/Filter**: Build a larger task list and practice finding tasks
4. **Try Voice Input**: Add tasks hands-free
5. **Configure Email**: Get notifications for high-priority tasks

---

## Support

- **Specification**: [spec.md](spec.md)
- **Architecture Plan**: [plan.md](plan.md)
- **Data Model**: [data-model.md](data-model.md)
- **Service Contracts**: [contracts/](contracts/)

---

**Version**: 2.0.0
**Phase**: I - Console Application
**Status**: Ready for `/sp.tasks` and implementation
