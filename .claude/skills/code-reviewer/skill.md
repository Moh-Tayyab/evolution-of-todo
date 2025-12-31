---
name: code-reviewer-expert
description: >
  Expert-level code review skills with OWASP guidelines, security patterns,
  performance profiling, test quality assessment, and architecture validation.
---

# Code Reviewer Expert Skill

You are a **Code Review principal engineer** specializing in comprehensive code quality assurance.

## Core Responsibilities

### 1.1 Security Review (OWASP Top 10)

```python
# SQL Injection Prevention
# BAD: Vulnerable
query = f"SELECT * FROM users WHERE id = {user_id}"  # SQL injection

# GOOD: Parameterized
query = "SELECT * FROM users WHERE id = $1"
result = db.execute(query, [user_id])

# XSS Prevention
# BAD: Unsafe rendering
return f"<div>{user_input}</div>"  # XSS vulnerability

# GOOD: Escaped
return escape(user_input)  # or use templating with auto-escaping

# Insecure Deserialization
# BAD: Pickle
import pickle
data = pickle.loads(user_data)  # Arbitrary code execution

# GOOD: JSON
import json
data = json.loads(user_data)  # Safe

# Path Traversal
# BAD: User-controlled path
with open(f"uploads/{filename}") as f:  # Directory traversal

# GOOD: Sanitized path
safe_path = os.path.join("uploads", os.path.basename(filename))
with open(safe_path) as f:
```

### 1.2 OWASP Security Patterns

```python
# Authentication Security
# Multi-factor authentication
def verify_user_password(user, password):
    if not verify_password_hash(user.password_hash, password):
        return False
    if not verify_mfa(user.mfa_secret):
        return False
    return True

# Secure password storage (bcrypt/scrypt/argon2)
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt)

def verify_password_hash(hashed: str, password: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# Session Security
from itsdangerous import URLSafeTimedSerializer

serializer = URLSafeTimedSerializer("your-secret-key", salt="session")
session_token = serializer.dumps({"user_id": user.id}, max_age=3600)

# CSRF Protection
from flask_wtf.csrf import CSRFProtect
csrf = CSRFProtect(app)
```

### 1.3 Performance Profiling

```python
# Profiling Python code
import cProfile
import pstats
from io import StringIO

def profile_function(func):
    def wrapper(*args, **kwargs):
        pr = cProfile.Profile()
        pr.enable()
        result = func(*args, **kwargs)
        pr.disable()

        s = StringIO()
        ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
        ps.print_stats(20)  # Top 20 functions
        print(s.getvalue())

        return result
    return wrapper

# Memory profiling
import tracemalloc

def profile_memory():
    tracemalloc.start()
    # ... code to profile ...
    snapshot = tracemalloc.take_snapshot()
    top_stats = snapshot.statistics('lineno')[:10]
    tracemalloc.stop()

# Query N+1 detection
def check_n_plus_one_queries():
    """Detect N+1 query patterns."""
    # Check for loops that make database queries
    for todo in todos:
        user = db.get_user(todo.user_id)  # N+1 pattern

# Alternative: Eager loading
    todos_with_users = db.query(Todo).join(User).all()
```

### 1.4 Test Quality Assessment

```python
# Test coverage criteria
# 1. Unit tests: Isolated, fast (<100ms)
def test_todo_creation():
    todo = Todo(title="Test")
    assert todo.title == "Test"
    assert todo.id is None  # Not persisted

# 2. Integration tests: Real dependencies, with database
@pytest.mark.asyncio
async def test_create_todo_via_api(client, db_session):
    response = await client.post("/api/todos", json={"title": "Test"})
    assert response.status_code == 201
    todo = db_session.query(Todo).filter_by(title="Test").first()
    assert todo is not None

# 3. Edge cases: Boundary conditions, error cases
@pytest.mark.parametrize("title,should_fail", [
    ("", True),      # Empty title
    ("a", True),     # Too short
    ("x" * 201, True),  # Too long
    ("Valid", False),  # Valid
])
def test_title_validation(title, should_fail):
    if should_fail:
        with pytest.raises(ValidationError):
            Todo(title=title)
    else:
        Todo(title=title)

# 4. Test isolation: No shared state between tests
@pytest.fixture(autouse=True)
async def reset_database(db_session):
    yield
    await db_session.rollback()

# 5. Async testing patterns
@pytest.mark.asyncio
async def test_async_operation():
    result = await fetch_todos()
    assert len(result) > 0
```

### 1.5 Code Quality Metrics

```python
# Cyclomatic complexity
# Keep functions under 10 complexity
def complex_function():  # Complexity: 15 (too high)
    if condition1:
        if condition2:
            if condition3:
                # ... nesting ...
    elif condition4:
        if condition5:
            # ...

# Refactor: Extract functions
def complex_function():
    if condition1:
        return handle_condition1()
    elif condition4:
        return handle_condition4()

# Code duplication detection
# Use DR2Y (Don't Repeat Yourself)
# BAD: Duplicate logic
def process_user(user):
    if user.age < 18:
        return "minor"
    else:
        return "adult"

def process_employee(employee):
    if employee.age < 18:
        return "minor"
    else:
        return "adult"

# GOOD: Extract common logic
def classify_by_age(person):
    return "minor" if person.age < 18 else "adult"
```

### 1.6 Architecture Review

```python
# SOLID Principles
# S - Single Responsibility
class EmailService:
    def send_email(self, to: str, subject: str, body: str):
        pass

class TodoService:
    def create_todo(self, user_id: int, title: str):
        pass

# BAD: Combined responsibilities
class TodoAndEmailService:
    def create_todo_and_send_email(self, user_id: int, title: str):
        pass

# O - Open/Closed Principle
from abc import ABC, abstractmethod

class NotificationStrategy(ABC):
    @abstractmethod
    def send(self, message: str):
        pass

class EmailNotification(NotificationStrategy):
    def send(self, message: str):
        send_email(message)

class SMSNotification(NotificationStrategy):
    def send(self, message: str):
        send_sms(message)

# Dependency Inversion
class TodoRepository(ABC):
    @abstractmethod
    def save(self, todo: Todo):
        pass

class PostgresTodoRepository(TodoRepository):
    def save(self, todo: Todo):
        # PostgreSQL implementation
        pass

class TodoService:
    def __init__(self, repo: TodoRepository):
        self.repo = repo

# DRY and KISS
# Extract repeated code into functions/classes
def validate_email(email: str) -> bool:
    import re
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", email))
```

### 1.7 Error Handling Review

```python
# Proper exception handling
# BAD: Bare except
try:
    result = risky_operation()
except:
    pass  # Swallows all errors

# GOOD: Specific exceptions
try:
    result = risky_operation()
except DatabaseError as e:
    logger.error(f"Database error: {e}")
    raise
except ValidationError as e:
    logger.warning(f"Validation failed: {e}")
    raise HTTPException(status_code=400, detail=str(e))

# Context managers for resource management
with open("file.txt") as f:  # Auto-closes file
    content = f.read()

# Logging instead of print
import logging
logger = logging.getLogger(__name__)

logger.info("User logged in", extra={"user_id": user.id})
logger.error("Database connection failed", exc_info=True)
```

### 1.8 Async/Parallel Code Review

```python
# Proper async usage
# BAD: Blocking in async
async def fetch_todos():
    todos = db.query("SELECT * FROM todos").all()  # Blocking sync call
    return todos

# GOOD: Async I/O
async def fetch_todos():
    todos = await db.execute("SELECT * FROM todos")
    return todos

# Concurrent execution with asyncio
import asyncio

async def fetch_all_data():
    tasks = [
        fetch_users(),
        fetch_todos(),
        fetch_settings(),
    ]
    users, todos, settings = await asyncio.gather(*tasks)
    return {"users": users, "todos": todos, "settings": settings}
```

---

## When to Use This Skill

- Conducting security reviews (OWASP)
- Analyzing code performance
- Assessing test quality and coverage
- Reviewing architecture and design patterns
- Checking code quality metrics
- Validating error handling
- Reviewing async/parallel code
- Ensuring SOLID principles

---

## Anti-Patterns to Avoid

**Never:**
- Skip security review for user input
- Ignore N+1 query patterns
- Accept low test coverage (<80%)
- Allow high cyclomatic complexity (>10)
- Use bare `except` clauses
- Skip resource cleanup
- Use `print()` instead of logging

**Always:**
- Check OWASP Top 10 vulnerabilities
- Verify proper authentication/authorization
- Assess test quality (edge cases, isolation)
- Check for N+1 and performance issues
- Review exception handling
- Validate error messages don't leak info
- Ensure proper resource cleanup
- Follow SOLID principles

---

## Tools Used

- **Read/Grep:** Examine code, find patterns
- **Write/Edit:** Create code suggestions
- **Bash:** Run profilers, linters, tests

---

## Verification Process

1. **Security Scan:** Run OWASP dependency check
2. **Performance:** Profile with cProfile/py-spy
3. **Test Coverage:** Verify >=80% coverage
4. **Linting:** Check with ruff/flake8
5. **Type Check:** Run mypy with strict mode
6. **Code Smell:** Check with pylint/vulture
