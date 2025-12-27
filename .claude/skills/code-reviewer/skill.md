# Code Reviewer Skill

## Overview
This skill provides expertise for conducting thorough code reviews. Use it for identifying bugs, security vulnerabilities, performance issues, and code quality improvements.

## Usage
Invoke this skill when you need help with:
- Reviewing code for bugs and errors
- Identifying security vulnerabilities
- Analyzing code quality and maintainability
- Suggesting performance optimizations
- Checking for best practices adherence

## Core Concepts

### Review Categories
1. **Correctness** - Does code work as intended?
2. **Security** - Are there vulnerabilities or risks?
3. **Performance** - Can it be optimized?
4. **Readability** - Is it easy to understand?
5. **Maintainability** - Can it be easily modified?

### Review Process
1. Understand code's purpose and context
2. Identify potential issues and risks
3. Suggest specific improvements with examples
4. Provide actionable feedback with priority levels
5. Reference best practices and standards

## Examples

### Security Review

```typescript
// BAD: SQL injection vulnerability
const query = `SELECT * FROM users WHERE id = ${userId}`;

// GOOD: Parameterized query
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);
```

### Performance Review

```typescript
// BAD: Inefficient N+1 queries
for (const todo of todos) {
  const user = await db.getUser(todo.userId);
}

// GOOD: Single query with join
const results = await db.query(`
  SELECT t.*, u.name
  FROM todos t
  JOIN users u ON t.user_id = u.id
`);
```

### Code Quality Review

```typescript
// BAD: Magic numbers
if (count > 100) {
  // do something
}

// GOOD: Named constants
const MAX_ITEMS = 100;
if (count > MAX_ITEMS) {
  // do something
}
```

## Best Practices

1. **Be constructive** - Focus on improvements, not criticism
2. **Provide examples** - Show both bad and good code
3. **Prioritize issues** - Security > correctness > performance > style
4. **Context-aware** - Consider project constraints and requirements
5. **Explain reasoning** - Help developers understand the "why"
6. **Suggest resources** - Link to relevant documentation
7. **Use consistent formatting** - Follow project's style guide
8. **Check tests** - Verify test coverage and quality
9. **Review edge cases** - Don't forget boundary conditions
10. **Follow-up friendly** - Make it easy to address feedback

## Common Issues to Look For

### SQL Injection
- Concatenated queries with user input
- Missing parameterization
- Unsanitized input

### Security Vulnerabilities
- Hardcoded credentials
- Missing authentication checks
- Insecure random number generation
- Exposed secrets in logs

### Performance Problems
- N+1 query patterns
- Missing database indexes
- Inefficient algorithms
- Blocking operations in async contexts
- Memory leaks

### Code Quality Issues
- Duplicate code
- Magic numbers and strings
- Poor naming conventions
- Missing error handling
- Inconsistent formatting
- Overly complex functions

### Testing Issues
- Missing edge case tests
- No negative test cases
- Insufficient assertions
- Test without cleanup

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
