# Test-Driven Development Workflow Skill

## Overview
Expertise for TDD (Test-Driven Development) methodology and workflows.

## Usage
Use for writing tests before implementation, testing frameworks, CI/CD integration.

## Core Concepts
- TDD Cycle: Red (failing test) -> Green (passing) -> Refactor
- Test Pyramid: E2E (fast) -> Integration (slow) -> Unit (isolated)
- Testing frameworks: Pytest, Jest, Playwright
- Fixtures: Reusable test data and helpers

## Examples

### Pytest
```python
def test_create_todo():
    todo = create_todo(title="Test")
    assert todo.id is not None
    assert todo.title == "Test"
```

### Jest
```typescript
describe('TodoList', () => {
  it('should render todos', () => {
    render(<TodoList todos={[]} />)
    expect(screen.getByText('No todos')).toBeInTheDocument()
  })
})
```

### Playwright
```typescript
test('add todo flow', async ({ page }) => {
  await page.goto('/')
  await page.fill('input', 'New todo')
  await page.click('button[type=submit]')
  await expect(page.locator('text=New todo')).toBeVisible()
})
```

## Best Practices
1. Test first: Write test before implementation
2. Fast tests: Unit tests should be < 100ms
3. Test one thing: Verify single behavior per test
4. Arrange-Act-Assert: Structure tests clearly
5. Mock dependencies: Don't test external APIs
6. Maintain tests: Update with code changes
7. Use fixtures: Reduce duplication
8. Edge cases: Test boundary conditions
9. Describe names: Explain what's tested
10. CI/CD: Run tests automatically

## Common Pitfalls
- Testing implementation: Tests should verify behavior, not internals
- Brittle tests: Tightly coupled to implementation details
- No cleanup: Leaving test data/resources
- Slow tests: Not optimizing test performance
- Missing edge cases: Empty/null/undefined inputs
- Flaky tests: Tests that fail intermittently

## Tools Used
- **Read/Grep Tools:** Examine code, find patterns, read existing implementations
- **Write/Edit Tools:** Create new code/commands, modify existing files
- **Bash:** Run scripts, execute commands, install dependencies

## Verification Process
After implementing changes:
1. **Syntax Check:** Verify code syntax (Python/TypeScript)
2. **Function Check:** Run commands/tests to verify they work
3. **Output Check:** Verify expected output matches actual
4. **Integration Check:** Test with existing codebase

## Error Patterns
Common errors to recognize:
- **Syntax errors:** Missing imports, incorrect syntax
- **Logic errors:** Wrong control flow, incorrect conditions
- **Integration errors:** Incompatible versions, missing dependencies
- **Runtime errors:** Exceptions during execution
- **Configuration errors:** Missing required files/settings
