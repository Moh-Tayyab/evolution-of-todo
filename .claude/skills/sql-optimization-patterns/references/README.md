# SQL Optimization Patterns References

Documentation and resources for optimizing SQL queries and database performance.

## Official Resources

### PostgreSQL Documentation
- **Official Docs**: https://www.postgresql.org/docs/
- **Performance Tips**: https://www.postgresql.org/docs/current/performance-tips.html
- **EXPLAIN**: https://www.postgresql.org/docs/current/sql-explain.html

### MySQL Documentation
- **Official Docs**: https://dev.mysql.com/doc/
- **Optimization**: https://dev.mysql.com/doc/refman/8.0/en/optimization.html

## Query Optimization

### Index Usage
```sql
-- Create index
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_users_name_email ON users(name, email);

-- Partial index
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- Covering index
CREATE INDEX idx_orders_covering ON orders(user_id, status, created_at);
```

### Query Patterns
```sql
-- Good: Uses index
SELECT id, name FROM users WHERE email = 'user@example.com';

-- Bad: Function on column prevents index usage
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Good: SARGable
SELECT * FROM orders WHERE created_at >= '2024-01-01';

-- Bad: Non-SARGable
SELECT * FROM orders WHERE YEAR(created_at) = 2024;
```

### JOIN Optimization
```sql
-- Good: Indexed JOIN columns
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.email = 'user@example.com';

-- Use EXISTS instead of IN for subqueries
SELECT u.name FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

## Execution Plans

### Analyze Query Plan
```sql
-- PostgreSQL
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

-- MySQL
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';

-- Detailed analysis
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT * FROM orders WHERE user_id = 1;
```

### Key Metrics
- **Seq Scan**: Sequential scan (bad for large tables)
- **Index Scan**: Uses index (good)
- **Index Only Scan**: Best (no table access needed)
- **Hash Join**: Efficient for large datasets
- **Nested Loop**: Good for small tables

## Database Schema

### Normalization
```sql
-- Good: Normalized schema
users (id, name, email)
orders (id, user_id, total, created_at)
order_items (id, order_id, product_id, quantity)

-- Avoid: Denormalized (causes anomalies)
orders (id, user_name, user_email, user_id, total, created_at)
```

### Data Types
```sql
-- Good: Appropriate types
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  age INTEGER,
  created_at TIMESTAMP,
  active BOOLEAN
);

-- Bad: Overkill types
CREATE TABLE users (
  id BIGINT,
  name TEXT,
  email TEXT,
  age NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE,
  active CHAR(1)
);
```

## Performance Tuning

### Configuration (PostgreSQL)
```ini
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
```

### Connection Pooling
```python
# Using connection pool
from psycopg2 import pool

db_pool = pool.SimpleConnectionPool(
    1,  # min
    10, # max
    user='user',
    password='pass',
    host='localhost',
    database='db'
)

conn = db_pool.getconn()
# Use connection
db_pool.putconn(conn)
```

## Advanced Patterns

### CTE vs Subquery
```sql
-- CTE (more readable, can be materialized)
WITH user_orders AS (
  SELECT user_id, COUNT(*) as order_count
  FROM orders
  GROUP BY user_id
)
SELECT u.name, uo.order_count
FROM users u
JOIN user_orders uo ON u.id = uo.user_id;

-- Subquery (often optimized similarly)
SELECT u.name, uo.order_count
FROM users u
JOIN (
  SELECT user_id, COUNT(*) as order_count
  FROM orders
  GROUP BY user_id
) uo ON u.id = uo.user_id;
```

### Window Functions
```sql
-- Rank users by order count
SELECT
  name,
  COUNT(*) as order_count,
  RANK() OVER (ORDER BY COUNT(*) DESC) as rank
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```

### Materialized Views
```sql
-- Create materialized view
CREATE MATERIALIZED VIEW user_order_summary AS
SELECT
  u.id,
  u.name,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Refresh manually
REFRESH MATERIALIZED VIEW user_order_summary;

-- Refresh concurrently (PostgreSQL 9.4+)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_summary;
```

## N+1 Query Problem

### Problem
```sql
-- Bad: N+1 queries
SELECT * FROM users;  -- 1 query
-- Then for each user:
SELECT * FROM orders WHERE user_id = ?;  -- N queries
```

### Solution
```sql
-- Good: Single query with JOIN
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- Or use application-level joining
SELECT * FROM users WHERE id IN (1, 2, 3, ...);
SELECT * FROM orders WHERE user_id IN (1, 2, 3, ...);
```

## Common Pitfalls

### SELECT *
```sql
-- Bad: Retrieves all columns
SELECT * FROM users;

-- Good: Only needed columns
SELECT id, name FROM users;
```

### Missing WHERE clauses
```sql
-- Bad: Full table scan
SELECT * FROM orders;

-- Good: Filtered query
SELECT * FROM orders WHERE created_at >= '2024-01-01';
```

### Functions in WHERE
```sql
-- Bad: Prevents index usage
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Good: Uses index
SELECT * FROM users WHERE email = 'user@example.com';
```

## Monitoring

### Slow Queries (PostgreSQL)
```sql
-- Enable logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- ms
SELECT pg_reload_conf();

-- View slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Table Statistics
```sql
-- Analyze table
ANALYZE users;

-- Vacuum (reclaim space)
VACUUM users;

-- Vacuum and analyze
VACUUM ANALYZE users;

-- Auto-vacuum configuration
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
```

## Best Practices

- Use appropriate indexes
- Analyze query execution plans
- Avoid SELECT *
- Use appropriate data types
- Normalize your schema
- Use connection pooling
- Monitor slow queries
- Regular vacuum/analyze
- Use prepared statements
- Partition large tables
- Consider materialized views
- Cache frequent queries

## Resources

- **PostgreSQL Performance**: https://www.postgresql.org/docs/current/performance-tips.html
- **MySQL Optimization**: https://dev.mysql.com/doc/refman/8.0/en/optimization.html
- **EXPLAIN Visualizer**: https://www.postgresql.org/docs/current/sql-explain.html
