# Neon PostgreSQL Skill

## Overview
Expertise for Neon PostgreSQL serverless database platform.

## Usage
Use for connecting to Neon, serverless operations, branching, migration.

## Core Concepts
- Connection: HTTP mode for serverless/edge functions
- Pooling: Reuse connections efficiently
- Branching: Create branches for testing
- Migration: Use Drizzle Kit or SQL migrations

## Examples

### Connection Setup
```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

### Query
```typescript
const todos = await db.select().from(todos)
const completed = await db.select().from(todos).where(eq(todos.completed, true))
```

### Branching
```bash
# Create branch
psql $DATABASE_URL --command "CREATE BRANCH test_branch"

# Reset to main
psql $DATABASE_URL --command "RESET TO main"

# Delete branch
psql $DATABASE_URL --command "DROP BRANCH test_branch"
```

## Best Practices
1. Use HTTP mode for serverless/edge functions
2. Implement connection pooling
3. Handle connection timeouts gracefully
4. Use transactions for multi-step operations
5. Store models as JSON to avoid migrations
6. Monitor query performance with EXPLAIN ANALYZE
7. Use environment variables, never hardcode DATABASE_URL
8. Set appropriate connection limits
9. Use Neon branches for testing
10. Implement proper error handling

## Common Pitfalls
- Using synchronous operations in serverless context
- Not releasing connections (memory leaks)
- Hardcoding credentials in code
- Missing error handling for connection failures
- Not using connection pooling in high-throughput scenarios

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
