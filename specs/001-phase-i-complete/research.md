# Research: Technology Choices for Phase I Complete

**Date**: 2025-12-29
**Feature**: 001-phase-i-complete
**Purpose**: Resolve technology unknowns and establish best practices for implementation

---

## 1. Desktop Notification Libraries

### Decision: plyer

**Rationale**:
- **Cross-platform support**: Works on Windows, macOS, and Linux with single API
- **Simple API**: `notification.notify(title, message, app_name, timeout)`
- **Pure Python**: No OS-specific compilation required
- **Active maintenance**: Regular updates and good community support
- **Minimal dependencies**: Lightweight compared to alternatives

**Alternatives Considered**:
- **win10toast** (Windows only): Rejected - not cross-platform
- **pync** (macOS only): Rejected - not cross-platform
- **notify-send** (Linux only): Rejected - not cross-platform, requires system binary
- **desktop-notifier**: Rejected - newer library with less stability/documentation

**Implementation Pattern**:
```python
from plyer import notification

def trigger_notification(task_title: str, due_date: str):
    notification.notify(
        title="Task Due Today",
        message=f"{task_title} is due on {due_date}",
        app_name="Intelligent Todo Manager",
        timeout=10  # seconds
    )
```

**Graceful Degradation**:
- Check permission status before sending notifications
- Log warning if notification fails but continue app execution
- FR-067: "System MUST gracefully handle browser notification permission denial"

---

## 2. Voice Input Technology

### Decision: SpeechRecognition + pyaudio (local transcription)

**Rationale**:
- **Offline capability**: Works without internet (using Sphinx engine)
- **Multiple engine support**: Can use Google/Wit.ai/Azure if online
- **Python-native**: Well-integrated with Python ecosystem
- **Proven reliability**: Used in production applications
- **30-second limit**: Aligns with FR-072 requirement

**Alternatives Considered**:
- **External API (Google Speech-to-Text)**: Rejected - requires API key, internet dependency, cost concerns
- **Azure Speech**: Rejected - similar to Google, adds cloud dependency
- **Vosk**: Rejected - more complex setup, less documentation
- **Whisper (OpenAI)**: Rejected - requires heavy model download, overkill for simple task titles

**Implementation Pattern**:
```python
import speech_recognition as sr

def record_voice_input(timeout: int = 30) -> str:
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening... Speak now (30 seconds max)")
        try:
            audio = recognizer.listen(source, timeout=timeout, phrase_time_limit=30)
            text = recognizer.recognize_google(audio)  # or recognize_sphinx for offline
            return text
        except sr.UnknownValueError:
            raise ValueError("Could not understand audio")
        except sr.RequestError as e:
            raise ConnectionError(f"Speech service error: {e}")
```

**Dependency Installation**:
```bash
uv add SpeechRecognition pyaudio
# Note: pyaudio may require portaudio system library (brew install portaudio on macOS)
```

**Error Handling** (FR-073, FR-074):
- Catch UnknownValueError → "Could not understand audio. Please try again or enter manually."
- Catch RequestError → "Speech service unavailable. Please enter task manually."
- Offer immediate fallback to manual text entry

---

## 3. Email Configuration

### Decision: Environment variables (.env file)

**Rationale**:
- **Security best practice**: Keeps credentials out of code
- **Standard approach**: Industry-standard for configuration management
- **Easy to manage**: Single `.env` file per environment
- **UV compatibility**: Works seamlessly with Python-dotenv

**Configuration Schema** (FR-083):
```bash
# .env.example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_TO_EMAIL=recipient@example.com
```

**Alternatives Considered**:
- **Config file (YAML/JSON)**: Rejected - more complex parsing, less standard for secrets
- **User prompts**: Rejected - requires user to enter credentials every run (poor UX)
- **Command-line arguments**: Rejected - credentials in shell history (security risk)

**Implementation Pattern**:
```python
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText

load_dotenv()  # Load from .env file

class EmailConfig:
    def __init__(self):
        self.host = os.getenv('SMTP_HOST')
        self.port = int(os.getenv('SMTP_PORT', 587))
        self.use_tls = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
        self.username = os.getenv('SMTP_USERNAME')
        self.password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('SMTP_FROM_EMAIL')
        self.to_email = os.getenv('SMTP_TO_EMAIL')

    def is_configured(self) -> bool:
        return all([self.host, self.username, self.password, self.from_email, self.to_email])

def send_email_notification(config: EmailConfig, task_title: str, due_date: str):
    if not config.is_configured():
        # FR-084: Gracefully handle missing configuration
        print("Warning: Email not configured. Skipping email notification.")
        return

    try:
        msg = MIMEText(f"High-priority task '{task_title}' is due on {due_date}")
        msg['Subject'] = f"Task Due: {task_title}"
        msg['From'] = config.from_email
        msg['To'] = config.to_email

        with smtplib.SMTP(config.host, config.port) as server:
            if config.use_tls:
                server.starttls()
            server.login(config.username, config.password)
            server.send_message(msg)
    except Exception as e:
        # FR-085: Gracefully handle email sending failures
        print(f"Warning: Failed to send email notification: {e}")
```

**Dependency**: python-dotenv (added to pyproject.toml)

---

## 4. Month-End Date Handling

### Decision: calendar.monthrange() + timedelta

**Rationale**:
- **Standard library**: No external dependencies (aligns with P1 principle)
- **Reliable**: Python's calendar module handles all edge cases (leap years, varying month lengths)
- **Simple API**: Clear, readable code
- **Efficient**: O(1) calculation

**Implementation Pattern** (Clarification: Use last day of target month):
```python
from datetime import date, timedelta
import calendar

def calculate_next_monthly_due_date(current_due_date: date) -> date:
    """
    Calculate next monthly recurrence, handling month-end edge cases.

    Per clarification: If original day doesn't exist in target month,
    use last day of that month (e.g., Jan 31 → Feb 28/29).
    """
    # Get target month
    if current_due_date.month == 12:
        target_year = current_due_date.year + 1
        target_month = 1
    else:
        target_year = current_due_date.year
        target_month = current_due_date.month + 1

    # Get last day of target month
    last_day_of_target_month = calendar.monthrange(target_year, target_month)[1]

    # Use min(original_day, last_day_of_target_month)
    target_day = min(current_due_date.day, last_day_of_target_month)

    return date(target_year, target_month, target_day)

# Examples:
# Jan 31 → Feb 28 (non-leap) or Feb 29 (leap)
# Jan 30 → Feb 28 (non-leap) or Feb 29 (leap)
# Jan 15 → Feb 15 (no adjustment)
# Mar 31 → Apr 30 (April has 30 days)
```

**Alternatives Considered**:
- **dateutil.relativedelta**: Rejected - external dependency for simple operation
- **Skip missing dates**: Rejected - violates clarification decision (Option A selected)
- **Use first day of month**: Rejected - violates clarification decision

**Test Cases** (must verify):
```python
assert calculate_next_monthly_due_date(date(2024, 1, 31)) == date(2024, 2, 29)  # Leap year
assert calculate_next_monthly_due_date(date(2025, 1, 31)) == date(2025, 2, 28)  # Non-leap
assert calculate_next_monthly_due_date(date(2025, 3, 31)) == date(2025, 4, 30)  # 30-day month
assert calculate_next_monthly_due_date(date(2025, 1, 15)) == date(2025, 2, 15)  # No adjustment
```

---

## 5. Testing Framework Selection

### Decision: pytest

**Rationale**:
- **Superior fixtures**: Powerful dependency injection for test setup/teardown
- **Parameterized tests**: Easy to test multiple scenarios with `@pytest.mark.parametrize`
- **Better assertions**: Clear assertion failures without boilerplate
- **Coverage integration**: pytest-cov plugin for coverage reporting
- **Active ecosystem**: More plugins, better maintained than unittest
- **Constitution compliance**: Preferred by Phase II (FastAPI uses pytest)

**Key Features Used**:
```python
# Fixtures for reusable test setup
@pytest.fixture
def sample_task_list():
    return TaskList()

# Parameterized tests for multiple scenarios
@pytest.mark.parametrize("title,expected", [
    ("", False),           # Empty title invalid
    ("Buy milk", True),    # Valid title
    ("   ", False),        # Whitespace-only invalid
])
def test_task_title_validation(title, expected):
    assert validate_task_title(title) == expected

# Coverage configuration
# pytest.ini:
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "--cov=src --cov-report=html --cov-report=term-missing --cov-fail-under=80"
```

**Alternatives Considered**:
- **unittest**: Rejected - more verbose, weaker fixtures, less ecosystem support
- **nose/nose2**: Rejected - deprecated, superseded by pytest
- **doctest**: Rejected - insufficient for comprehensive test suites

**Test Organization**:
- **Unit tests**: Fast, isolated tests for individual functions/classes
- **Contract tests**: Verify interface compliance (service contracts)
- **Integration tests**: Test feature interactions (CLI flow, notification triggers)

**Coverage Target**: ≥80% per NFR-008 and constitution

---

## Technology Stack Summary

| Component | Technology | Type | Justification |
|-----------|-----------|------|---------------|
| Language | Python 3.13+ | P1 | Constitution-mandated, modern Python features |
| Package Manager | UV | P1 | Fast, modern, replaces pip+venv |
| Testing | pytest + pytest-cov | P1 | Superior fixtures, parameterization, coverage |
| Desktop Notifications | plyer | P2 | Cross-platform, simple API, pure Python |
| Voice Input | SpeechRecognition + pyaudio | P3 | Offline-capable, multiple engine support |
| Email | smtplib (stdlib) | P3 | No external dependencies, standard SMTP |
| Email Config | python-dotenv | P3 | Security best practice for credentials |
| Date Handling | calendar + datetime (stdlib) | P1 | Standard library, handles all edge cases |

**External Dependencies Added**:
```toml
# pyproject.toml [dependencies]
plyer = "^2.1.0"          # P2: Desktop notifications
SpeechRecognition = "^3.10.0"  # P3: Voice input
pyaudio = "^0.2.14"       # P3: Audio capture (voice input)
python-dotenv = "^1.0.0"  # P3: Environment variable management
pytest = "^7.4.0"         # Testing framework
pytest-cov = "^4.1.0"     # Coverage reporting
```

**Installation Command**:
```bash
uv add plyer SpeechRecognition pyaudio python-dotenv pytest pytest-cov
```

---

## ADR Recommendations

The following architectural decisions should be documented in ADRs during implementation:

1. **ADR-001**: Use plyer for cross-platform desktop notifications
2. **ADR-002**: Use SpeechRecognition with offline capability for voice input
3. **ADR-003**: Use environment variables (.env) for email configuration
4. **ADR-004**: Use pytest as testing framework for Phase I and beyond

---

**Research Status**: ✅ Complete - All technology unknowns resolved
**Next Step**: Proceed to Phase 1 (data-model.md, contracts/, quickstart.md)
