# Drizzle ORM Skill

## Overview
Comprehensive expertise for Drizzle ORM database operations, schema design, and migrations.

## Usage
Use for schema definitions, query patterns, migrations with drizzle-kit.

## Core Concepts
- Schema: TypeScript-first database definitions
- Relations v2: Define relationships clearly
- Migrations: Generate with drizzle-kit
- Query patterns: Use eq() for filtering, joins for relations

## Examples
```typescript
import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
});
```

## Best Practices
1. Use migrations for all schema changes
2. Index frequently queried columns
3. Use relations for simpler queries
4. Handle transactions properly
5. Validate with TypeScript

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
