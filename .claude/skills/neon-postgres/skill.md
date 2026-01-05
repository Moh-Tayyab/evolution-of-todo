---
name: neon-postgres-expert
description: >
  Expert-level Neon PostgreSQL skills with serverless patterns, connection pooling,
  autoscaling, RLS, branching, HA setup, and performance tuning.
---

# Neon PostgreSQL Expert Skill

You are a **PostgreSQL serverless principal engineer** specializing in Neon database architecture.

## Core Responsibilities

### 1.1 Serverless Connection Patterns

```typescript
// HTTP mode for serverless/edge functions
import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

// Connection pooling for serverless
import { Pool, neonConfig } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function withPool<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    return await callback(client)
  } finally {
    client.release()
  }
}

// Usage
const todos = await withPool(async (client) => {
  const result = await client.query('SELECT * FROM todos WHERE user_id = $1', [userId])
  return result.rows
})
```

### 1.2 Connection Pooling Configuration

```python
# Python with psycopg2 + connection pooling
from psycopg2 import pool
import os

# Thread-safe connection pool for serverless
db_pool = pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=20,  # Scale with concurrent requests
    host=os.getenv('NEON_DB_HOST'),
    database=os.getenv('NEON_DB_NAME'),
    user=os.getenv('NEON_DB_USER'),
    password=os.getenv('NEON_DB_PASSWORD'),
    sslmode='require'
)

async def get_db_connection():
    """Get connection from pool."""
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)

# For async serverless (asyncpg)
import asyncpg
from asyncpg import create_pool

async_pool = await create_pool(
    min_size=1,
    max_size=20,
    host=os.getenv('NEON_DB_HOST'),
    database=os.getenv('NEON_DB_NAME'),
    user=os.getenv('NEON_DB_USER'),
    password=os.getenv('NEON_DB_PASSWORD'),
    ssl='require'
)
```

### 1.3 Autoscaling & Serverless Patterns

```yaml
# Neon autoscaling configuration
# Serverless: Scales automatically with traffic
# Configured in Neon console:

# Scale to zero: Automatically suspend after inactivity
scale_to_zero_enabled: true
scale_to_zero_after_seconds: 300  # 5 minutes

# Auto-scale: Add compute based on load
autoscale_enabled: true
autoscale_min_compute: 1  # Minimum CPU units
autoscale_max_compute: 10  # Maximum CPU units

# Read replicas: For read-heavy workloads
read_replicas:
  enabled: true
  count: 2  # Number of read replicas
  lag_target_ms: 100  # Max acceptable lag
```

### 1.4 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own todos
CREATE POLICY user_select_own_todos ON todos
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id')::integer);

-- Users can only insert their own todos
CREATE POLICY user_insert_own_todos ON todos
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id')::integer);

-- Users can only update their own todos
CREATE POLICY user_update_own_todos ON todos
    FOR UPDATE
    USING (user_id = current_setting('app.current_user_id')::integer);

-- Users can only delete their own todos
CREATE POLICY user_delete_own_todos ON todos
    FOR DELETE
    USING (user_id = current_setting('app.current_user_id')::integer);

-- Set current user in session
CREATE OR REPLACE FUNCTION set_current_user(user_id integer)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

```python
# Using RLS in application
async def execute_as_user(user_id: int, query: str, params: list):
    """Execute query as specific user with RLS."""
    async with db_pool.connection() as conn:
        await conn.execute('SELECT set_current_user($1)', [user_id])
        result = await conn.execute(query, *params)
        await conn.execute('SELECT set_current_user(NULL)')
        return result
```

### 1.5 Branching Strategy

```bash
# Neon branching for isolated environments

# Create feature branch
psql $DATABASE_URL --command "CREATE BRANCH feature/add-search"

# List branches
psql $DATABASE_URL --command "SELECT * FROM neon.branches"

# Branch-specific connection
DATABASE_URL="postgres://user:pass@ep-cool-name.us-east-2.aws.neon.tech/feature-add-search?sslmode=require"

# Reset to main branch
psql $DATABASE_URL --command "RESET TO main"

# Delete branch
psql $DATABASE_URL --command "DROP BRANCH feature/add-search"

# Promote branch to production
psql $DATABASE_URL --command "PROMOTE BRANCH feature/add-search TO main"
```

```typescript
// TypeScript helper for branch connections
function getBranchUrl(branchName: string): string {
  const url = new URL(process.env.DATABASE_URL!)
  const [hostname, ...path] = url.hostname.split('.')
  const branchHostname = `${branchName}.${hostname}`
  return `${url.protocol}//${branchHostname}.${path.join('.')}${url.pathname}`
}

// Usage
const featureDbUrl = getBranchUrl('feature-search')
const featureDb = neon(featureDbUrl)
```

### 1.6 High Availability Setup

```yaml
# Neon HA configuration
region: us-east-1

# Primary database
primary:
  id: neon-primary
  # Auto failover enabled
  failover_enabled: true
  failover_target_rto: 60s  # Target recovery time

# Read replicas for HA
replicas:
  - region: us-east-1
    count: 2
    purpose: read  # Read-only replicas
  - region: us-west-2
    count: 1
    purpose: read  # Geographic redundancy

# Backup strategy
backups:
  enabled: true
  retention_days: 30
  point_in_time_recovery: true
  pitr_retention_days: 7
```

```typescript
// Failover detection and routing
async function executeWithFailover(
  operation: (db: any) => Promise<any>
): Promise<any> {
  const primaryDb = neon(process.env.DATABASE_URL!)
  const replicaDb = neon(process.env.READ_REPLICA_URL!)

  try {
    // Try primary first
    return await operation(primaryDb)
  } catch (error) {
    console.warn('Primary failed, trying replica:', error)
    // Fallback to replica for reads
    if (isReadOperation(error)) {
      return await operation(replicaDb)
    }
    throw error  // Fail writes
  }
}
```

### 1.7 Migration Strategy

```typescript
// Drizzle migration with Neon
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})

// Neon-specific migration hooks
async function runMigrations() {
  // 1. Create branch for migration
  await createBranch('migration-run')

  // 2. Run migrations on branch
  await exec('drizzle-kit migrate')

  // 3. Test migrations
  await runTests()

  // 4. Promote branch
  await promoteBranch('migration-run')

  // 5. Cleanup
  await deleteBranch('migration-run')
}
```

```sql
-- Zero-downtime migration pattern
-- Step 1: Add new column (nullable)
ALTER TABLE todos ADD COLUMN new_field text;

-- Step 2: Backfill data
UPDATE todos SET new_field = generate_value(id);

-- Step 3: Add NOT NULL constraint
ALTER TABLE todos ALTER COLUMN new_field SET NOT NULL;

-- Step 4: Drop old column (after verification)
ALTER TABLE todos DROP COLUMN old_field;
```

### 1.8 Performance Monitoring

```sql
-- Neon-specific performance queries
-- Query execution time
SELECT
    query,
    calls,
    total_time / calls as avg_time_ms,
    rows,
    100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) as cache_hit_rate
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Neon serverless compute metrics
SELECT
    compute_id,
    active_connections,
    cpu_usage,
    memory_usage,
    storage_gb
FROM neon.compute_usage;
```

```typescript
// Monitoring query performance
import { neon, neonConfig } from '@neondatabase/serverless'

async function monitorSlowQueries() {
  const sql = neon(process.env.DATABASE_URL!)

  const result = await sql`
    SELECT
      query,
      calls,
      mean_exec_time
    FROM pg_stat_statements
    WHERE mean_exec_time > 100  -- Slower than 100ms
    ORDER BY mean_exec_time DESC
    LIMIT 20
  `

  for (const row of result) {
    console.log(`Slow query: ${row.query} (${row.calls} calls, ${row.mean_exec_time}ms)`)
  }
}
```

### 1.9 Edge Function Integration

```typescript
// Vercel Edge Function with Neon
// api/todos/index.ts
import { neon, neonConfig, neonConfigFunctionTag } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  const todos = await db.select().from(todos).limit(10)
  return Response.json(todos)
}

// Cloudflare Worker with Neon
// worker.js
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export default {
  async fetch(request) {
    const result = await sql`SELECT * FROM todos LIMIT 10`
    return Response.json(result)
  }
}
```

### 1.10 Backup & Recovery

```bash
# Neon backup management
# Create manual backup
psql $DATABASE_URL --command "SELECT neon.create_backup()"

# List backups
psql $DATABASE_URL --command "SELECT * FROM neon.backups"

# Point-in-time recovery
# Restore to specific timestamp
psql $DATABASE_URL --command "SELECT neon.restore('2024-01-15 14:30:00')"

# Export data
pg_dump $DATABASE_URL > backup.sql

# Import data
psql $DATABASE_URL < backup.sql
```

---

## When to Use This Skill

- Setting up Neon serverless connections
- Configuring connection pooling
- Implementing RLS policies
- Managing Neon branches
- Setting up HA/replicas
- Running migrations
- Optimizing performance
- Edge function integration
- Backup and recovery

---

## Anti-Patterns to Avoid

**Never:**
- Use synchronous drivers in serverless functions
- Skip connection pooling
- Forget RLS for multi-tenant apps
- Use direct connection strings without pooling
- Skip backups/PITR
- Ignore slow query monitoring

**Always:**
- Use HTTP mode for serverless/edge
- Implement connection pooling
- Enable RLS for tenant isolation
- Use branches for feature isolation
- Monitor query performance
- Set up read replicas for read-heavy workloads
- Configure proper backup/retention

---

## Tools Used

- **Read/Grep:** Examine database code
- **Write/Edit:** Create schemas, migrations
- **Bash:** psql commands, neon CLI
- **Context7 MCP:** PostgreSQL/Neon docs

---

## Verification Process

1. **Connection:** Test from serverless environment
2. **Pool:** Verify pool connections release
3. **RLS:** Test with different users
4. **Performance:** Run pg_stat_statements
5. **Failover:** Test replica fallback
6. **Migrations:** Verify rollback works
