# TDD Workflow References

Documentation and resources for Test-Driven Development workflow and best practices.

## Official Resources

### Testing Frameworks
- **Pytest**: https://docs.pytest.org/
- **Jest**: https://jestjs.io/
- **RSpec**: https://rspec.info/
- **Go Testing**: https://go.dev/testing/

## TDD Cycle

### Red-Green-Refactor
```
1. RED: Write a failing test
2. GREEN: Write minimal code to pass
3. REFACTOR: Improve code while tests pass
```

### Example Workflow
```python
# 1. RED: Write failing test
def test_add_numbers():
    result = add(2, 3)
    assert result == 5

# 2. GREEN: Write minimal implementation
def add(a, b):
    return a + b

# 3. REFACTOR: Improve code
def add(a, b):
    """Add two numbers together."""
    return a + b
```

## Unit Testing

### Pytest (Python)
```python
import pytest

def test_calculate_total():
    items = [10, 20, 30]
    result = calculate_total(items)
    assert result == 60

@pytest.mark.parametrize("input,expected", [
    ([1, 2, 3], 6),
    ([0, 0, 0], 0),
    ([-1, 1], 0),
])
def test_calculate_total_various_inputs(input, expected):
    assert calculate_total(input) == expected
```

### Jest (JavaScript)
```javascript
describe('Calculator', () => {
  test('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test.each([
    [[1, 2, 3], 6],
    [[0, 0, 0], 0],
    [[-1, 1], 0],
  ])('adds array of numbers (%p)', (input, expected) => {
    expect(sum(input)).toBe(expected);
  });
});
```

## Test Structure

### Arrange-Act-Assert
```python
def test_user_creation():
    # Arrange
    username = "testuser"
    email = "test@example.com"

    # Act
    user = User.create(username=username, email=email)

    # Assert
    assert user.username == username
    assert user.email == email
    assert user.id is not None
```

### Given-When-Then
```python
def test_user_login():
    # Given
    user = User.create("testuser", "test@example.com", "password123")

    # When
    result = user.authenticate("password123")

    # Then
    assert result is True
```

## Fixtures

### Pytest Fixtures
```python
import pytest

@pytest.fixture
def db_session():
    """Create a test database session."""
    session = create_test_session()
    yield session
    session.close()

@pytest.fixture
def sample_user(db_session):
    """Create a sample user."""
    return User.create("testuser", "test@example.com", "password123")

def test_user_update(sample_user):
    sample_user.name = "Updated"
    assert sample_user.name == "Updated"
```

### Jest Fixtures
```javascript
let calculator;

beforeEach(() => {
  calculator = new Calculator();
});

afterEach(() => {
  calculator.cleanup();
});

test('adds numbers', () => {
  expect(calculator.add(2, 3)).toBe(5);
});
```

## Test Organization

### Directory Structure
```
tests/
├── unit/
│   ├── test_models.py
│   ├── test_views.py
│   └── test_utils.py
├── integration/
│   ├── test_api.py
│   └── test_database.py
└── e2e/
    └── test_user_flow.py
```

### Test Naming
```python
# Good: Descriptive names
def test_user_can_login_with_valid_credentials():
    pass

def test_user_cannot_login_with_invalid_password():
    pass

# Bad: Vague names
def test_login():
    pass

def test_error():
    pass
```

## Mocking

### unittest.mock (Python)
```python
from unittest.mock import Mock, patch

def test_api_call():
    mock_response = Mock()
    mock_response.json.return_value = {"data": "test"}

    with patch('requests.get', return_value=mock_response):
        result = fetch_data("https://api.example.com")

    assert result == {"data": "test"}
```

### jest.mock (JavaScript)
```javascript
import { fetchData } from './api';

jest.mock('./api', () => ({
  fetchData: jest.fn(() => Promise.resolve({ data: 'test' })),
}));

test('fetches data', async () => {
  const result = await fetchData();
  expect(result).toEqual({ data: 'test' });
});
```

## Test-First Development

### Feature Example
```python
# Step 1: Write test (fails)
def test_user_can_reset_password():
    user = User.create("user", "user@example.com", "oldpass")
    user.reset_password("newpass")
    assert user.authenticate("newpass") is True
    assert user.authenticate("oldpass") is False

# Step 2: Implement feature (test passes)
class User:
    def reset_password(self, new_password):
        self.password_hash = hash_password(new_password)

# Step 3: Refactor (improve code)
class User:
    def reset_password(self, new_password):
        if not self.is_strong_password(new_password):
            raise ValueError("Password too weak")
        self.password_hash = hash_password(new_password)
        self.password_changed_at = datetime.now()
```

## Best Practices

### Test Characteristics
- **Fast**: Tests should run quickly
- **Isolated**: No dependencies between tests
- **Repeatable**: Same result every time
- **Self-validating**: Clear pass/fail
- **Timely**: Written with production code

### DO ✅
- Test one thing per test
- Use descriptive test names
- Test edge cases
- Keep tests simple
- Use fixtures for setup
- Mock external dependencies
- Maintain test coverage > 80%

### DON'T ❌
- Test implementation details
- Write fragile tests
- Test third-party libraries
- Make tests dependent on order
- Write complex test logic
- Skip writing tests

## Test Coverage

### Measure Coverage
```bash
# Python with coverage
pip install coverage
coverage run -m pytest
coverage report
coverage html  # Generate HTML report

# JavaScript with Jest
npm test -- --coverage
```

### Coverage Goals
- **Line Coverage**: % of lines executed
- **Branch Coverage**: % of code branches tested
- **Target**: 80%+ overall, 90%+ for critical paths

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: pytest
```

## Troubleshooting

### Flaky Tests
- Fix timeouts
- Remove dependencies on timing
- Use proper fixtures
- Mock external services

### Slow Tests
- Use test doubles
- Optimize database operations
- Run tests in parallel
- Cache expensive operations

## Resources

- **Pytest Docs**: https://docs.pytest.org/
- **Jest Docs**: https://jestjs.io/docs/getting-started
- **Test-Driven Development**: https://martinfowler.com/bliki/TestDrivenDevelopment.html
- **Testing Best Practices**: https://testing.google.com/
