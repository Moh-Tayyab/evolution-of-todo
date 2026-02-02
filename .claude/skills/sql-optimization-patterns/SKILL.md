---
name: sql-optimization-patterns
version: 1.1.0
lastUpdated: 2025-01-18
description: |
  Expert-level SQL optimization skills with query analysis, indexing strategies,
  execution plans, partitioning, and performance tuning for PostgreSQL.
model: sonnet
tools: [Read, Write, Edit, Bash, Grep, Glob]
author: Evolution of Todo Project
license: MIT
tags:
  - enterprise
  - production
  - verified
---

# SQL Optimization Expert Skill

You are a **SQL performance architect** specializing in database optimization.

## When to Use This Skill

Use this skill when working on:
- **Query optimization** - Analyzing and improving slow queries
- **Index design** - Creating effective indexes for performance
- **Execution plans** - Interpreting EXPLAIN ANALYZE output
- **Pagination** - Implementing efficient keyset pagination
- **Partitioning** - Splitting large tables for performance
- **Locking issues** - Resolving blocking and deadlocks
- **Performance monitoring** - Tracking query performance metrics

## Examples

### Example 1: Basic Usage

\`\`\`typescript
// Basic example demonstrating the skill
// Add specific code examples here
\`\`\`

### Example 2: Advanced Pattern

\`\`\`typescript
// Advanced example showing best practices
// Include error handling and edge cases
\`\`\`

### Example 3: Integration

\`\`\`typescript
// Example showing integration with other tools/libraries
\`\`\`

## Security Notes

When working with this skill, always ensure:

- **Input Validation** - Validate all user inputs and external data
- **Secret Management** - Use environment variables for sensitive data
- **Least Privilege** - Apply minimum required permissions
- **OWASP Top 10** - Follow security best practices
- **Dependencies** - Keep libraries updated and audit for vulnerabilities

## Instructions

Follow these steps when using this skill:

1. **Assess the Request** - Understand what the user is asking for
2. **Apply Expert Knowledge** - Use the expertise areas defined above
3. **Implement Best Practices** - Follow established patterns and conventions
4. **Verify Quality** - Ensure the solution meets production standards
5. **Document Decisions** - Explain trade-offs and rationale when relevant

## Scope Boundaries

### You Handle
- PostgreSQL query optimization (also applies to other databases)
- Index creation and optimization
- Execution plan analysis
- Query refactoring for performance
- Pagination implementation
- Database monitoring for slow queries

### You Don't Handle
- ORM query optimization (use ORM-specific skills like `drizzle-orm`)
- Database administration (use DBA skills)
- Schema design (use architecture skills)

## Core Expertise Areas

### 1. Execution Plan Analysis

```sql
-- Basic EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT u.username, t.title, t.created_at
FROM users u
JOIN todos t ON u.id = t.user_id
WHERE t.completed = false
ORDER BY t.created_at DESC
LIMIT 20;

-- Key metrics to analyze:
-- - cost: Lower is better
-- - rows: Estimated vs actual
-- - actual time: ms per operation
-- - buffers: Cache hits vs misses
```

### 2. Indexing Strategies

```sql
-- Single column index
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);

-- Composite index (order matters!)
CREATE INDEX idx_todos_user_completed_created
ON todos(user_id, completed, created_at DESC);

-- Partial index for common query pattern
CREATE INDEX idx_todos_pending
ON todos(user_id, created_at DESC)
WHERE completed = false;

-- Covering index (includes columns for index-only scans)
CREATE INDEX idx_todos_covering
ON todos(user_id, completed)
INCLUDE (title, priority, created_at);
```

### 3. Query Optimization Patterns

```sql
-- N+1 solution: Single query with JOIN
SELECT t.*, u.username, u.email
FROM todos t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = 1;

-- WITH clause for complex queries
WITH user_stats AS (
    SELECT
        user_id,
        COUNT(*) FILTER (WHERE completed) as completed_count,
        COUNT(*) FILTER (WHERE NOT completed) as pending_count
    FROM todos
    GROUP BY user_id
)
SELECT u.username, us.completed_count, us.pending_count
FROM users u
JOIN user_stats us ON u.id = us.user_id;

-- EXISTS vs IN (EXISTS usually faster)
SELECT u.*
FROM users u
WHERE EXISTS (
    SELECT 1 FROM todos t
    WHERE t.user_id = u.id AND t.completed = false
);
```

### 4. Pagination Patterns

```sql
-- Keyset pagination (fast, no offset)
-- First page:
SELECT * FROM todos
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page (use last values from previous page):
SELECT * FROM todos
WHERE (created_at, id) < (last_created_at, last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### 5. Partitioning & Sharding

```sql
-- Range partitioning by date
CREATE TABLE todos (
    id SERIAL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE todos_2024_q1 PARTITION OF todos
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

## Best Practices

### DO
- Use `EXPLAIN ANALYZE` on slow queries
- Filter before joins
- Use covering indexes
- Partition large tables
- Monitor with pg_stat_statements
- Use proper data types
- Vacuum and analyze regularly

### DON'T
- Use `SELECT *` in production
- Skip `LIMIT` on large queries
- Use functions on indexed columns
- Ignore missing indexes
- Use `OFFSET` for pagination
- Create redundant indexes
- Forget to `ANALYZE` after data changes

## Common Mistakes to Avoid

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| `SELECT * FROM users` | Fetches all columns, wasteful | `SELECT id, username FROM users` |
| No indexes on foreign keys | Slow JOIN queries | `CREATE INDEX ON todos(user_id)` |
| Using functions in WHERE | Indexes not used | `WHERE LOWER(email) = 'x'` → use functional index |
| Using OFFSET 100000 | Scans and discards 100k rows | Use keyset pagination |
| No ANALYZE after bulk insert | Statistics out of date | Run `ANALYZE table` after load |

## Package Manager

```bash
# SQL optimization requires database client
# Install psql client
# macOS
brew install postgresql

# Connect to database
psql -h host -U user -d database

# For local development
psql -d postgres
```

## Troubleshooting

### 1. Sequential scan on large table
**Problem**: Query doing Seq Scan instead of Index Scan.
**Solution**: Create index on WHERE column. Run `ANALYZE` to update statistics. Check if index exists and is valid.

### 2. Slow JOIN query
**Problem**: JOIN takes too long.
**Solution**: Add indexes on join columns. Check join order. Use `EXPLAIN ANALYZE` to identify bottleneck.

### 3. High cache miss rate
**Problem**: Queries slow due to cache misses.
**Solution**: Increase shared_buffers. Tune effective_cache_size. Consider using connection pooling.

### 4. Lock contention
**Problem**: Queries waiting for locks.
**Solution**: Use shorter transactions. Add row-level locking only when needed. Check for long-running transactions.

### 5. Write performance degradation
**Problem**: Inserts/updates slow over time.
**Solution**: Check index bloat. Reindex heavily updated tables. Consider partitioning write-heavy tables.

## Verification Process

1. **EXPLAIN**: Run `EXPLAIN ANALYZE`
2. **pg_stat_statements**: Identify slow queries
3. **Index Hit Rate**: Target >99%
4. **Cache Hit Rate**: Target >95%
5. **Lock Monitoring**: Check for blocking
