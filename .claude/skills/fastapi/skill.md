# FastAPI Skill

## Overview
Expertise for FastAPI, modern Python web framework for high-performance APIs.

## Usage
Use for endpoint creation, Pydantic validation, async operations, middleware.

## Core Concepts
- Async/await: Always use for I/O
- Pydantic: Validate all inputs
- Dependency injection: Use Depends()
- Error handling: HTTPException with proper codes

## Examples
```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/todos/")
async def create_todo(todo: TodoCreate):
    # Process todo
    return todo
```

## Tools Used
- **Read/Grep Tools:** Examine code, find patterns, read existing implementations
- **Write/Edit Tools:** Create new endpoints, modify existing code
- **Bash:** Run tests, start servers, install dependencies

## Verification Process
After making changes, verify:
1. **Health Check:** Call `/api/health` endpoint
2. **Test Endpoints:** Use `curl` or Postman for all CRUD operations
3. **Check OpenAPI Docs:** Visit `/docs` for auto-generated documentation
4. **Run Tests:** Execute `pytest` and verify all pass
5. **Database Verification:** Confirm data persistence after operations

## Error Patterns
Common errors to recognize:
- **Import errors:** `ModuleNotFoundError` - missing dependencies
- **Type errors:** `ValidationError` from Pydantic - invalid input data
- **HTTP errors:** `422 Unprocessable Entity` - validation failure
- **Database errors:** `IntegrityError` - constraint violations
- **Async errors:** `RuntimeWarning` - missing await on async operations

## Best Practices
1. Always use async/await
2. Validate with Pydantic models
3. Use proper HTTP status codes
4. Add OpenAPI documentation
5. Test with pytest

## Tools Used
- **Read/Grep Tools:** Examine code, find patterns, read existing implementations
- **Write/Edit Tools:** Create new schemas/endpoints, modify existing code
- **Bash:** Run servers, execute migrations, install dependencies
- **Context7 MCP:** Semantic search in PostgreSQL/Python/Helm documentation

## Verification Process
After implementing changes:
1. **Health Check:** Verify application is running (`/health` endpoint or similar)
2. **Database Check:** Run query to verify database connection
3. **Migration Check:** Confirm migrations applied successfully
4. **Integration Check:** Test API calls work end-to-end
5. **Log Review:** Check for errors in application logs

## Error Patterns
Common errors to recognize:
- **Connection errors:** Database/API unreachable, network timeouts
- **Schema errors:** Invalid table/column names, constraint violations
- **Type errors:** Invalid data types, missing fields
- **Authentication errors:** Invalid tokens, expired sessions
- **Configuration errors:** Missing environment variables, invalid config
