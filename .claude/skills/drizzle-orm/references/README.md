# Drizzle ORM References

Official documentation and resources for Drizzle ORM.

## Official Resources

### Drizzle Documentation
- **Website**: https://orm.drizzle.team/
- **GitHub**: https://github.com/drizzle-team/drizzle-orm
- **Documentation**: https://orm.drizzle.team/docs/overview
- **Discord**: https://discord.gg/drizzle-orm

## Quick Start

### Installation
```bash
npm install drizzle-orm
npm install -D drizzle-kit

# Database driver
npm install postgres   # PostgreSQL
npm install better-sqlite3  # SQLite
npm install mysql2  # MySQL
```

### Basic Setup
```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Schema Definition
```typescript
// src/db/schema.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Database Connection
```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);
```

## Querying

### Insert
```typescript
import { users } from './schema';
import { db } from './db';

const newUser = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
}).returning();
```

### Select
```typescript
const allUsers = await db.select().from(users);

// With conditions
const john = await db.select().from(users).where(eq(users.name, 'John'));
```

### Update
```typescript
await db.update(users)
  .set({ name: 'Jane Doe' })
  .where(eq(users.id, 1));
```

### Delete
```typescript
await db.delete(users).where(eq(users.id, 1));
```

## Relationships

### One to Many
```typescript
import { pgTable, serial, text, foreignKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  title: text('title').notNull(),
});
```

### Many to Many
```typescript
export const usersToPosts = pgTable('users_to_posts', {
  userId: serial('user_id').references(() => users.id),
  postId: serial('post_id').references(() => posts.id),
});
```

### Queries with Joins
```typescript
import { eq } from 'drizzle-orm';

const result = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId));
```

## Migrations

### Generate Migration
```bash
drizzle-kit generate:pg
```

### Run Migration
```typescript
import { migrate } from 'drizzle-orm/postgres-js/migrator';

await migrate(db, { migrationsFolder: 'drizzle' });
```

### Migration File Example
```typescript
// drizzle/0001_create_users.sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);
```

## Validation

### Zod Schema Generation
```typescript
import { createInsertSchema } from 'drizzle-zod';
import { users } from './schema';

const insertUserSchema = createInsertSchema(users);

type NewUser = z.infer<typeof insertUserSchema>;
```

## Transactions

```typescript
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: 'Alice', email: 'alice@example.com' });
  await tx.insert(posts).values({ userId: 1, title: 'First Post' });
});
```

## Drizzle Kit

### Push (Development)
```bash
drizzle-kit push:pg
```

### Studio (UI)
```bash
drizzle-kit studio
```

### Introspection
```bash
drizzle-kit introspect:pg
```

## Best Practices

### Schema Organization
```typescript
// schemas/users.ts
export const users = pgTable('users', { /* ... */ });

// schemas/posts.ts
export const posts = pgTable('posts', { /* ... */ });

// schemas/index.ts
export * from './users';
export * from './posts';
```

### Type Safety
```typescript
import { InferSelectModel } from 'drizzle-orm';
import { users } from './schema';

type User = InferSelectModel<typeof users>;
type NewUser = InferInsertModel<typeof users>;
```

### Indexes
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));
```

## Neon Serverless Postgres

```typescript
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
```

## Resources

- **Drizzle ORM Docs**: https://orm.drizzle.team/docs/overview
- **Drizzle Kit**: https://kit.drizzle.team/
- **Examples**: https://orm.drizzle.team/docs/overview
- **Discord Community**: https://discord.gg/drizzle-orm
