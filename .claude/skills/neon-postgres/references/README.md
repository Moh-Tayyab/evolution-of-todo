# Neon PostgreSQL References

Official documentation and resources for Neon Serverless PostgreSQL.

## Official Resources

### Neon Documentation
- **Official Website**: https://neon.tech/
- **Documentation**: https://neon.tech/docs
- **GitHub**: https://github.com/neondatabase/neon
- **Blog**: https://neon.tech/blog
- **Discord**: https://discord.gg/UCZwCUyaq

## Quick Start

### Sign Up
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy connection string

### Connection String
```
postgresql://user:password@ep-xyz.region.aws.neon.tech/dbname?sslmode=require
```

## Connection Examples

### Node.js (postgres)
```javascript
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

await client.connect();
```

### Node.js (Neon Serverless Driver)
```javascript
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const result = await sql`SELECT * FROM users`;
```

### Python
```python
import psycopg2
import os

conn = psycopg2.connect(
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    host=os.getenv('DB_HOST'),
    sslmode='require'
)
```

### Go
```go
import (
    "database/sql"
    _ "github.com/lib/pq"
)

db, err := sql.Open("postgres", "postgres://user:pass@host/db?sslmode=require")
```

## Neon Serverless Driver

### Installation
```bash
npm install @neondatabase/serverless
```

### Usage
```javascript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Query
const users = await sql`SELECT * FROM users`;

// Parameterized
const user = await sql`SELECT * FROM users WHERE id = ${userId}`;

// Insert
await sql`INSERT INTO users (name) VALUES (${name})`;

// Transaction
await sql.begin(async (sql) => {
    await sql`INSERT INTO users (name) VALUES (${name})`;
    await sql`INSERT INTO logs (user_id) VALUES (${userId})`;
});
```

## Branching

### Create Branch
```bash
# CLI
neon branches create my-feature --parent-id <parent-id>

# Or via API
POST /projects/:id/branches
```

### List Branches
```bash
neon branches list <project-id>
```

### Delete Branch
```bash
neon branches delete <branch-id>
```

### Switch Branch
```bash
neon branches switch --project-id <project-id> --branch-name my-feature
```

## Connection Pooling

### PgBouncer
```javascript
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL, {
    fetchOptions: {
        cache: 'no-store'
    }
});
```

### Connection String with Pooler
```
postgresql://user:password@pooler.region.aws.neon.tech/dbname?sslmode=require
```

## Database Operations

### Create Database
```sql
CREATE DATABASE myapp;
```

### Create Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);
```

## ORM Integration

### Drizzle ORM
```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle({ client: sql });
```

### Prisma
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### TypeORM
```typescript
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: true,
    entities: [User],
    synchronize: true,
});
```

## Auto-Suspend and Resume

### Configuration
- **Suspend After**: 1 hour of inactivity (default)
- **Auto-Resume**: Automatically activates on connection

### Disable Auto-Suspend
```bash
neon projects update <project-id> --suspend-timeout 0
```

## Backups and Restore

### Point-in-Time Recovery
```bash
# Restore to specific point
neon restores create --project-id <project-id> --timestamp "2024-01-01 12:00:00"
```

### Backup Retention
- Free tier: 7 days
- Paid plans: Up to 30 days

## Monitoring

### Metrics
- Compute time
- Data storage
- Data transferred
- Active branches
- Suspend/resume events

### Logs
```bash
neon logs --project-id <project-id>
```

## CLI Tool

### Installation
```bash
npm install -g neonctl
```

### Commands
```bash
neon login
neon projects list
neon branches create my-branch
neon databases create my-db
```

## Best Practices

### Connection Management
- Use serverless driver for serverless functions
- Use connection pooler for long-running applications
- Enable SSL for all connections

### Performance
- Use indexes for frequently queried columns
- Optimize query performance
- Monitor compute time usage
- Use read replicas for read-heavy workloads

### Security
- Rotate connection strings regularly
- Use environment variables for credentials
- Enable SSL connections
- Implement proper user permissions

## Pricing

### Free Tier
- 0.5 GB storage
- 100 compute hours/month
- 3 projects

### Paid Plans
- Scale: $19/month (10 GB, 300 hours)
- Business: $49/month (100 GB, 1000 hours)

## Resources

- **Neon Docs**: https://neon.tech/docs
- **Neon Blog**: https://neon.tech/blog
- **GitHub**: https://github.com/neondatabase
- **Discord**: https://discord.gg/UCZwCUyaq
