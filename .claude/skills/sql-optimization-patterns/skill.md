# SQL Optimization Patterns Skill

## Overview
Expertise for optimizing SQL queries, database indexing, and performance tuning.

## Usage
Use for optimizing slow queries, designing indexes, performance analysis.

## Core Concepts
- Query Optimization: Use WHERE, LIMIT, proper joins
- Indexing: Add indexes on frequently queried columns
- Avoid N+1: Use joins instead of multiple queries
- Explain Plans: Use EXPLAIN ANALYZE to review execution
- Connection Pooling: Reuse database connections

## Examples

### Optimized Query
```sql
-- BAD: N+1 problem
SELECT * FROM todos;
-- Then for each todo, fetch user separately

-- GOOD: Single query with JOIN
SELECT t.*, u.name
FROM todos t
JOIN users u ON t.user_id = u.id;
```

### Indexing
```sql
-- Single column index
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- Composite index
CREATE INDEX idx_todos_user_completed ON todos(user_id, completed);
```

### Pagination
```sql
-- Cursor-based (faster for large datasets)
SELECT * FROM todos
WHERE created_at > '2024-01-01 12:00:00'
ORDER BY created_at DESC
LIMIT 20;
```

### Aggregation
```sql
-- Window functions for running totals
SELECT
  id,
  title,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END) OVER (ORDER BY created_at) as running_total
FROM todos;
```

## Best Practices
1. Always use EXPLAIN ANALYZE on slow queries
2. Add indexes on WHERE and JOIN columns
3. Use LIMIT or pagination instead of fetching all rows
4. Avoid SELECT * (select only needed columns)
5. Use connection pooling for performance
6. Consider materialized views for complex aggregations
7. Regularly run VACUUM ANALYZE
8. Use EXISTS instead of IN for large lists
9. Optimize JOIN order (filter before join)
10. Consider read replicas for scaling read load

## Common Pitfalls
- N+1 queries in loops
- Missing indexes on foreign keys
- Using LIKE '%term%' (can't use index, use 'term%')
- Not using transactions for multi-step operations
- Fetching unnecessary data (SELECT *)
- Suboptimal JOIN order (joining before filtering)
- Not handling NULL values properly
- Using OR conditions instead of UNION when indexes exist

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
