---
name: sql-optimization-expert
description: >
  Expert-level SQL optimization skills with query analysis, indexing strategies,
  execution plans, partitioning, and performance tuning for PostgreSQL.
---

# SQL Optimization Expert Skill

You are a **SQL performance architect** specializing in database optimization.

## Core Responsibilities

### 1.1 Execution Plan Analysis

```sql
-- Basic EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT u.username, t.title, t.created_at
FROM users u
JOIN todos t ON u.id = t.user_id
WHERE t.completed = false
ORDER BY t.created_at DESC
LIMIT 20;

-- Output analysis:
-- Seq Scan on todos (cost=0.00..1250.00 rows=10000 width=64)
--   Filter: (completed = false)
--   Rows Removed by Filter: 50000
--   ->  Index Scan using idx_todos_created (cost=0.43..850.00 rows=1000 width=64)
--         Index Cond: (completed = false)
--         Sort Key: created_at DESC
--         Sort Method: quicksort  Memory: 25kB

-- Key metrics to analyze:
-- - cost: Lower is better
-- - rows: Estimated vs actual
-- - actual time: ms per operation
-- - buffers: Cache hits vs misses
-- - loops: Number of iterations
```

### 1.2 Indexing Strategies

```sql
-- Single column index
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);

-- Composite index (order matters!)
CREATE INDEX idx_todos_user_completed_created
ON todos(user_id, completed, created_at DESC);

-- Partial index for common query pattern
CREATE INDEX idx_todos_pending
ON todos(user_id, created_at DESC)
WHERE completed = false;

-- Include columns for covering indexes
CREATE INDEX idx_todos_covering
ON todos(user_id, completed)
INCLUDE (title, priority, created_at);

-- Expression/Functional index
CREATE INDEX idx_todos_lower_title ON todos((LOWER(title)));
CREATE INDEX idx_todos_due_soon ON todos(due_date)
WHERE due_date IS NOT NULL;

-- Unique index with NULL handling
CREATE UNIQUE INDEX idx_users_email_nulls_last
ON users(email) WHERE email IS NOT NULL;

-- Reindex for maintenance
REINDEX INDEX idx_todos_user_id;
REINDEX TABLE todos;

-- Analyze table for query planner
ANALYZE todos;
```

### 1.3 Query Optimization Patterns

```sql
-- N+1 query solution
-- BEFORE: N+1 problem
SELECT * FROM todos WHERE user_id = 1;
-- For each todo:
SELECT * FROM users WHERE id = todo.user_id;

-- AFTER: Single query with JOIN
SELECT t.*, u.username, u.email
FROM todos t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = 1;

-- WITH clause for complex queries
WITH user_stats AS (
    SELECT
        user_id,
        COUNT(*) FILTER (WHERE completed) as completed_count,
        COUNT(*) FILTER (WHERE NOT completed) as pending_count,
        MAX(created_at) as last_activity
    FROM todos
    GROUP BY user_id
)
SELECT
    u.username,
    us.completed_count,
    us.pending_count,
    us.last_activity
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE us.pending_count > 0;

-- EXISTS vs IN vs JOIN
-- EXISTS (usually best for existence checks)
SELECT u.*
FROM users u
WHERE EXISTS (
    SELECT 1 FROM todos t
    WHERE t.user_id = u.id AND t.completed = false
);

-- Window functions (no GROUP BY needed)
SELECT
    t.*,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn,
    COUNT(*) OVER (PARTITION BY user_id) as total_count,
    SUM(CASE WHEN completed THEN 1 ELSE 0 END) OVER (PARTITION BY user_id) as completed_count
FROM todos t
WHERE t.user_id = 1;

-- Recursive CTE for hierarchical data
WITH RECURSIVE task_tree AS (
    SELECT id, title, parent_id, 0 as level
    FROM todos
    WHERE parent_id IS NULL
    UNION ALL
    SELECT t.id, t.title, t.parent_id, tt.level + 1
    FROM todos t
    JOIN task_tree tt ON t.parent_id = tt.id
)
SELECT * FROM task_tree;
```

### 1.4 Pagination Patterns

```sql
-- Offset-based (slow for large offsets)
SELECT * FROM todos
ORDER BY created_at DESC
LIMIT 20 OFFSET 1000;

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

-- Cursor-based with encoding
SELECT * FROM todos
WHERE id > decode('cursor_value', 'base64')
ORDER BY id ASC
LIMIT 20;

-- FOR UPDATE with keyset pagination
SELECT * FROM todos
WHERE (created_at, id) < (last_cursor)
ORDER BY created_at DESC, id DESC
LIMIT 20
FOR UPDATE SKIP LOCKED;
```

### 1.5 Partitioning & Sharding

```sql
-- Range partitioning by date
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    completed BOOLEAN DEFAULT false
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE todos_2024_q1 PARTITION OF todos
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE todos_2024_q2 PARTITION OF todos
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- List partitioning by priority
CREATE TABLE todos_priority (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    priority TEXT NOT NULL
) PARTITION BY LIST (priority);

CREATE TABLE todos_high PARTITION OF todos_priority
    FOR VALUES IN ('high');

CREATE TABLE todos_medium PARTITION OF todos_priority
    FOR VALUES IN ('medium');

CREATE TABLE todos_low PARTITION OF todos_priority
    FOR VALUES IN ('low');

-- Partition maintenance
-- Detach partition
ALTER TABLE todos DETACH PARTITION todos_2023_q1 CONCURRENTLY;
-- Attach partition
ALTER TABLE todos ATTACH PARTITION todos_2023_q1
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

-- Drop old partition
DROP TABLE todos_2023_q1;
```

### 1.6 Transaction & Locking Patterns

```sql
-- Row-level locking
BEGIN;
SELECT * FROM todos
WHERE id = 1
FOR UPDATE;  -- Lock the row

-- Update with conditional locking
UPDATE todos
SET completed = true, completed_at = now()
WHERE id = 1
AND completed = false
RETURNING *;

-- Advisory locks for distributed locking
SELECT pg_try_advisory_lock(hashtext('todo', 1));
-- Do work...
SELECT pg_advisory_unlock(hashtext('todo', 1));

-- Serializable isolation for ACID compliance
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- Operations
COMMIT;

-- Optimistic locking with version column
UPDATE todos
SET
    title = 'Updated title',
    version = version + 1,
    updated_at = now()
WHERE id = 1
AND version = 5
RETURNING *;  -- Returns 0 rows if version mismatch
```

### 1.7 Performance Monitoring

```sql
-- Identify slow queries
SELECT
    query,
    calls,
    mean_time,
    total_time,
    rows,
    100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) as cache_hit_rate
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Table and index statistics
SELECT
    relname,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum,
    last_analyze
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- Index usage statistics
SELECT
    indexrelname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Long-running transactions
SELECT
    pid,
    usename,
    application_name,
    state,
    query,
    now() - xact_start as duration,
    now() - state_change as idle_time
FROM pg_stat_activity
WHERE state != 'idle'
AND (now() - xact_start) > interval '5 minutes';

-- Lock conflicts
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_query,
    blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity
    ON blocked_locks.pid = blocked_activity.pid
JOIN pg_catalog.pg_locks blocking_locks
    ON blocked_locks.locktype = blocking_locks.locktype
    AND blocked_locks.database IS NOT DISTINCT FROM blocking_locks.database
JOIN pg_catalog.pg_stat_activity blocking_activity
    ON blocking_locks.pid = blocking_activity.pid
WHERE NOT blocked_locks.granted;
```

---

## When to Use This Skill

- Optimizing slow queries
- Designing indexes
- Analyzing execution plans
- Implementing pagination
- Partitioning large tables
- Debugging locking issues
- Monitoring performance

---

## Anti-Patterns to Avoid

**Never:**
- Use `SELECT *` in production
- Skip `LIMIT` on large queries
- Use functions on indexed columns
- Ignore missing indexes
- Use `OFFSET` for pagination
- Create redundant indexes
- Forget to `ANALYZE` after data changes

**Always:**
- Use `EXPLAIN ANALYZE`
- Filter before joins
- Use covering indexes
- Partition large tables
- Monitor with pg_stat_statements
- Use proper data types
- Vacuum and analyze regularly

---

## Tools Used

- **Read/Grep:** Examine queries, schemas
- **Bash:** Run psql commands
- **Context7 MCP:** PostgreSQL docs

---

## Verification Process

1. **EXPLAIN:** Run `EXPLAIN ANALYZE`
2. **pg_stat_statements:** Identify slow queries
3. **Index Hit Rate:** Target >99%
4. **Cache Hit Rate:** Target >95%
5. **Lock Monitoring:** Check for blocking
