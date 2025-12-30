# Data Model: Complete Phase I with Intermediate & Advanced Features

**Date**: 2025-12-29
**Feature**: 001-phase-i-complete
**Spec Reference**: [spec.md](spec.md)

---

## Entity Definitions

### 1. Task

**Purpose**: Represents a single todo item with all organizational and scheduling attributes.

**Source Requirements**: FR-001 through FR-016 (Basic), FR-020 through FR-025 (Organization), FR-050 through FR-056 (Recurring), FR-060 through FR-063 (Due Dates)

**Attributes**:

| Attribute | Type | Required | Default | Validation | Spec Reference |
|-----------|------|----------|---------|------------|----------------|
| `id` | `int` | Yes | Auto-increment (1+) | > 0 | FR-002 |
| `title` | `str` | Yes | N/A | Non-empty, stripped | FR-001, FR-016 |
| `description` | `str` | No | `""` | Any string | FR-001 |
| `is_completed` | `bool` | Yes | `False` | Boolean | FR-004, FR-005 |
| `completed_at` | `datetime \| None` | No | `None` | ISO 8601 timestamp | FR-006 |
| `created_at` | `datetime` | Yes | `datetime.now()` | ISO 8601 timestamp | Entity definition |
| `priority` | `Priority \| None` | No | `None` | Priority enum or None | FR-020, FR-021 |
| `tags` | `list[str]` | Yes | `[]` | List of strings | FR-023, FR-024 |
| `due_date` | `date \| None` | No | `None` | YYYY-MM-DD, future or today | FR-060, FR-061 |
| `recurrence` | `Recurrence \| None` | No | `None` | Recurrence enum or None | FR-050 |
| `recurrence_interval` | `int \| None` | No | `None` | > 0 if custom recurrence | FR-050 |

**Python Implementation**:
```python
from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Optional
from enum import Enum

@dataclass
class Task:
    """
    Represents a todo task with organizational and scheduling attributes.

    @spec: specs/001-phase-i-complete/spec.md
    User Story 1-5: Task management with priorities, tags, and recurrence
    """
    id: int
    title: str
    description: str = ""
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    priority: Optional['Priority'] = None
    tags: list[str] = field(default_factory=list)
    due_date: Optional[date] = None
    recurrence: Optional['Recurrence'] = None
    recurrence_interval: Optional[int] = None

    def __post_init__(self):
        """Validate task data after initialization."""
        if not self.title or not self.title.strip():
            raise ValueError("Task title cannot be empty")
        if self.id <= 0:
            raise ValueError("Task ID must be positive")
        if self.recurrence == Recurrence.CUSTOM and not self.recurrence_interval:
            raise ValueError("Custom recurrence requires interval")
```

**State Transitions**:
1. **Created** → `is_completed=False`, `completed_at=None`
2. **Completed** → `is_completed=True`, `completed_at=datetime.now()`
3. **Uncompleted** → `is_completed=False`, `completed_at=None`
4. **Recurring Spawn** → New Task with `is_completed=False`, updated `due_date`, same other attributes

---

### 2. Priority

**Purpose**: Enum representing task priority levels.

**Source Requirements**: FR-020, FR-021, FR-022

**Values**:

| Value | Display | Sort Order | Description |
|-------|---------|------------|-------------|
| `HIGH` | `[HIGH]` | 1 | Urgent, critical tasks |
| `MEDIUM` | `[MED]` | 2 | Important but not urgent |
| `LOW` | `[LOW]` | 3 | Nice to have |
| `None` | (no indicator) | 4 | No priority assigned |

**Python Implementation**:
```python
from enum import Enum

class Priority(Enum):
    """
    Task priority levels for organizational categorization.

    @spec: specs/001-phase-i-complete/spec.md
    User Story 2: Task Organization with Priorities
    """
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

    def __str__(self) -> str:
        """Display format for UI."""
        return f"[{self.value.upper()}]"

    @property
    def sort_order(self) -> int:
        """Numeric sort order (1=highest priority)."""
        order = {
            Priority.HIGH: 1,
            Priority.MEDIUM: 2,
            Priority.LOW: 3
        }
        return order[self]
```

---

### 3. Recurrence

**Purpose**: Enum representing recurrence patterns for repeating tasks.

**Source Requirements**: FR-050, FR-051, FR-053

**Values**:

| Value | Description | Next Due Date Calculation |
|-------|-------------|---------------------------|
| `DAILY` | Repeats every day | `current_due_date + 1 day` |
| `WEEKLY` | Repeats every week | `current_due_date + 7 days` |
| `MONTHLY` | Repeats every month | See month-end handling in research.md |
| `CUSTOM` | Custom interval | `current_due_date + {interval} days/weeks/months` |

**Python Implementation**:
```python
from enum import Enum

class Recurrence(Enum):
    """
    Recurrence patterns for repeating tasks.

    @spec: specs/001-phase-i-complete/spec.md
    User Story 5: Recurring Tasks
    """
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

    def __str__(self) -> str:
        """Display format for UI."""
        return self.value.capitalize()
```

**Recurrence Calculation Rules** (from clarifications):
- **Daily**: `due_date + timedelta(days=1)`
- **Weekly**: `due_date + timedelta(days=7)`
- **Monthly**: Use `calculate_next_monthly_due_date()` from research.md (handles month-end)
- **Custom**: `due_date + timedelta(days=interval)` for days, similar for weeks/months

---

### 4. Notification

**Purpose**: Represents a pending or triggered notification for a task.

**Source Requirements**: FR-064, FR-065, FR-066

**Attributes**:

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `task_id` | `int` | Yes | Reference to associated task |
| `trigger_time` | `datetime` | Yes | When notification should be displayed |
| `notification_type` | `NotificationType` | Yes | Browser or Email |
| `status` | `NotificationStatus` | Yes | Pending, Sent, or Canceled |

**Python Implementation**:
```python
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

class NotificationType(Enum):
    """Type of notification delivery."""
    BROWSER = "browser"
    EMAIL = "email"

class NotificationStatus(Enum):
    """Status of notification lifecycle."""
    PENDING = "pending"
    SENT = "sent"
    CANCELED = "canceled"

@dataclass
class Notification:
    """
    Represents a scheduled or triggered notification for a task.

    @spec: specs/001-phase-i-complete/spec.md
    User Story 6: Due Dates and Reminders
    User Story 8: Email Notifications
    """
    task_id: int
    trigger_time: datetime
    notification_type: NotificationType
    status: NotificationStatus
```

**Lifecycle**:
1. **Created** → `status=PENDING`, `trigger_time` set based on due date
2. **Triggered** → `status=SENT` after notification displayed/sent
3. **Canceled** → `status=CANCELED` if task completed before trigger

---

### 5. EmailConfig

**Purpose**: Configuration for SMTP email notifications.

**Source Requirements**: FR-083, FR-084

**Attributes**:

| Attribute | Type | Required | Source | Validation |
|-----------|------|----------|--------|------------|
| `smtp_host` | `str` | Yes | `SMTP_HOST` env var | Non-empty |
| `smtp_port` | `int` | Yes | `SMTP_PORT` env var | 1-65535 |
| `smtp_use_tls` | `bool` | Yes | `SMTP_USE_TLS` env var | Boolean |
| `smtp_username` | `str` | Yes | `SMTP_USERNAME` env var | Non-empty |
| `smtp_password` | `str` | Yes | `SMTP_PASSWORD` env var | Non-empty |
| `from_email` | `str` | Yes | `SMTP_FROM_EMAIL` env var | Valid email |
| `to_email` | `str` | Yes | `SMTP_TO_EMAIL` env var | Valid email |

**Python Implementation**:
```python
from dataclasses import dataclass
import os
from dotenv import load_dotenv

@dataclass
class EmailConfig:
    """
    SMTP configuration for email notifications.

    @spec: specs/001-phase-i-complete/spec.md
    User Story 8: Email Notifications for High-Priority Tasks
    """
    smtp_host: str
    smtp_port: int
    smtp_use_tls: bool
    smtp_username: str
    smtp_password: str
    from_email: str
    to_email: str

    @classmethod
    def from_env(cls) -> Optional['EmailConfig']:
        """
        Load configuration from environment variables.

        Returns None if configuration is incomplete (per FR-084).
        """
        load_dotenv()

        host = os.getenv('SMTP_HOST')
        port = os.getenv('SMTP_PORT')
        use_tls = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
        username = os.getenv('SMTP_USERNAME')
        password = os.getenv('SMTP_PASSWORD')
        from_email = os.getenv('SMTP_FROM_EMAIL')
        to_email = os.getenv('SMTP_TO_EMAIL')

        if not all([host, port, username, password, from_email, to_email]):
            return None  # Gracefully handle missing config (FR-084)

        return cls(
            smtp_host=host,
            smtp_port=int(port),
            smtp_use_tls=use_tls,
            smtp_username=username,
            smtp_password=password,
            from_email=from_email,
            to_email=to_email
        )
```

---

## Relationships

### Task → Priority (0..1)
- Each Task may have one Priority (HIGH, MEDIUM, LOW) or None
- Priority is optional attribute on Task entity

### Task → Tags (0..*)
- Each Task has zero or more tags (list of strings)
- Tags are simple strings, no separate Tag entity needed for Phase I

### Task → Recurrence (0..1)
- Each Task may have one Recurrence pattern or None
- Recurrence determines how next instance is generated

### Task → Notification (1..*)
- Each Task with a due date may have multiple Notifications (browser + email)
- Notifications reference Task via `task_id`

---

## Data Validation Rules

### Task Validation
1. **Title**: Non-empty after stripping whitespace (FR-016)
2. **ID**: Positive integer, unique within TaskList (FR-002)
3. **Due Date**: Must be valid YYYY-MM-DD format (FR-061)
4. **Recurrence + Interval**: If recurrence is CUSTOM, interval must be provided (FR-050)
5. **Tags**: Case-sensitive, no spaces within tags (use hyphens, per Assumption #12)

### Priority Validation
- Must be one of: HIGH, MEDIUM, LOW, or None
- Display format: `[HIGH]`, `[MED]`, `[LOW]`, or empty

### Due Date Validation
- Format: `YYYY-MM-DD` (ISO 8601)
- Must be today or future date
- Invalid dates raise ValueError

### Email Config Validation
- All fields required for functionality
- Missing config → gracefully disable email (FR-084)
- Invalid SMTP settings → log error, continue (FR-085)

---

## Persistence Strategy (Phase I)

**Storage**: In-memory Python list
**Lifetime**: Data lost on application exit
**Rationale**: Acceptable for Phase I hackathon demo; persistent storage in Phase II

**TaskList Storage**:
```python
class TaskList:
    def __init__(self):
        self._tasks: list[Task] = []  # In-memory storage
        self._next_id: int = 1         # Auto-increment counter
```

**Migration Path to Phase II**:
- Replace in-memory list with PostgreSQL + SQLModel ORM
- Add `user_id` foreign key to all tables
- Implement Alembic migrations
- Maintain same entity structure (minimal code changes)

---

## Entity Summary

| Entity | Purpose | Key Attributes | Relationships |
|--------|---------|----------------|---------------|
| **Task** | Core todo item | id, title, description, is_completed, priority, tags, due_date, recurrence | → Priority (0..1), → Tags (0..*), → Recurrence (0..1) |
| **Priority** | Priority level enum | HIGH, MEDIUM, LOW | ← Task (0..1) |
| **Recurrence** | Recurrence pattern enum | DAILY, WEEKLY, MONTHLY, CUSTOM | ← Task (0..1) |
| **Notification** | Scheduled reminder | task_id, trigger_time, type, status | ← Task (1..*) |
| **EmailConfig** | SMTP configuration | smtp_host, smtp_port, credentials, emails | Used by EmailService |

---

**Data Model Status**: ✅ Complete - All entities defined with validation rules
**Next Step**: Generate contracts/ (service interface definitions)
