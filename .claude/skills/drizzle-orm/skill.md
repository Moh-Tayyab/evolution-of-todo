---
name: drizzle-orm-expert
description: >
  Expert-level Drizzle ORM skills with schema design, relations v2, transactions,
  migrations, performance optimization, and production patterns.
---

# Drizzle ORM Expert Skill

You are a **Drizzle ORM principal engineer** specializing in type-safe database operations.

## Core Responsibilities

### 1.1 Schema Definition Architecture

```typescript
// db/schema.ts
import { pgTable, serial, text, timestamp, boolean, integer, uuid, jsonb, index, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for priority
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);

// Users table with comprehensive constraints
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio').default(''),
  isActive: boolean('is_active').default(true).notNull(),
  role: text('role').default('user').notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  // Indexes for performance
  index('users_email_idx').on(table.email),
  index('users_created_at_idx').on(table.createdAt),
  index('users_role_idx').on(table.role),
  // Check constraints
  check('username_length', sql`length(username) >= 3`),
]);

// Todos table with foreign key
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priority: priorityEnum('priority').default('medium').notNull(),
  completed: boolean('completed').default(false).notNull(),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('todos_user_id_idx').on(table.userId),
  index('todos_completed_idx').on(table.completed),
  index('todos_priority_idx').on(table.priority),
  index('todos_created_at_idx').on(table.createdAt),
  // Composite index for common query pattern
  index('todos_user_completed_created_idx').on(table.userId, table.completed, table.createdAt),
]);

// Tags table for many-to-many
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').default('#3b82f6'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Junction table for todos <-> tags
export const todoTags = pgTable('todo_tags', {
  todoId: integer('todo_id').references(() => todos.id, { onDelete: 'cascade' }).notNull(),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
  uniqueIndex('todo_tags_unique_idx').on(table.todoId, table.tagId),
]);

// JSONB column for flexible metadata
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  theme: text('theme').default('system'),
  notifications: jsonb('notifications').$type<{
    email: boolean;
    push: boolean;
    frequency: 'instant' | 'daily' | 'weekly';
  }>().default({ email: true, push: true, frequency: 'instant' }),
  layout: jsonb('layout').$type<{
    sidebar: boolean;
    compact: boolean;
  }>().default({ sidebar: true, compact: false }),
});
```

### 1.2 Relations V2 Architecture

```typescript
// db/relations.ts
import { relations } from 'drizzle-orm';
import { users, todos, tags, todoTags, userPreferences } from './schema';

// User relations
export const usersRelations = relations(users, ({ many, one }) => ({
  todos: many(todos),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
}));

// Todo relations
export const todosRelations = relations(todos, ({ one, many }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
    relationName: 'user_todos',
  }),
  tags: many(tags, {
    relationName: 'todo_tags_relation',
  }),
}));

// Tag relations (through junction)
export const tagsRelations = relations(tags, ({ many }) => ({
  todos: many(todos, {
    relationName: 'todo_tags_relation',
  }),
}));

// Junction table relation
export const todoTagsRelations = relations(todoTags, ({ one }) => ({
  todo: one(todos, {
    fields: [todoTags.todoId],
    references: [todos.id],
  }),
  tag: one(tags, {
    fields: [todoTags.tagId],
    references: [tags.id],
  }),
}));

// Preferences relation
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// Type-safe relation queries
export async function getUserWithTodos(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      todos: {
        where: eq(todos.completed, false),
        orderBy: [desc(todos.createdAt)],
        limit: 10,
      },
      preferences: true,
    },
  });
  return result;
}

export async function getTodoWithTags(todoId: number) {
  const result = await db.query.todos.findFirst({
    where: eq(todos.id, todoId),
    with: {
      tags: true,
      user: {
        columns: { id: true, username: true, email: true },
      },
    },
  });
  return result;
}

export async function getTodosByTag(tagName: string) {
  const result = await db.query.tags.findFirst({
    where: eq(tags.name, tagName),
    with: {
      todos: {
        with: {
          todo: true,
        },
      },
    },
  });
  return result?.todos.map(t => t.todo);
}
```

### 1.3 CRUD Operations

```typescript
// db/operations.ts
import { and, eq, ne, desc, asc, like, ilike, inArray, gte, lte, between } from 'drizzle-orm';

// Create operations
export async function createTodo(data: typeof todos.$inferInsert) {
  const [todo] = await db.insert(todos).values(data).returning();
  return todo;
}

export async function createTodoWithTags(
  todoData: typeof todos.$inferInsert,
  tagNames: string[]
) {
  return await db.transaction(async (tx) => {
    // Create todo
    const [todo] = await tx.insert(todos).values(todoData).returning();

    // Get or create tags
    const tagsData = await Promise.all(
      tagNames.map(async (name) => {
        const [tag] = await tx
          .select()
          .from(tags)
          .where(eq(tags.name, name))
          .limit(1);
        return tag || (await tx.insert(tags).values({ name }).returning())[0];
      })
    );

    // Create junction entries
    await tx.insert(todoTags).values(
      tagsData.map((tag) => ({
        todoId: todo.id,
        tagId: tag.id,
      }))
    );

    return todo;
  });
}

// Read operations
export async function getTodoById(id: number) {
  const [todo] = await db.select().from(todos).where(eq(todos.id, id));
  return todo;
}

export async function getUserTodos(
  userId: number,
  options?: {
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    limit?: number;
    offset?: number;
  }
) {
  const conditions = [eq(todos.userId, userId)];

  if (options?.completed !== undefined) {
    conditions.push(eq(todos.completed, options.completed));
  }
  if (options?.priority) {
    conditions.push(eq(todos.priority, options.priority));
  }

  return await db
    .select()
    .from(todos)
    .where(and(...conditions))
    .orderBy(desc(todos.createdAt))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0);
}

export async function searchTodos(query: string, userId: number) {
  return await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.userId, userId),
        or(
          ilike(todos.title, `%${query}%`),
          ilike(todos.description, `%${query}%`)
        )
      )
    )
    .orderBy(desc(todos.createdAt));
}

export async function getOverdueTodos(userId: number) {
  return await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.userId, userId),
        eq(todos.completed, false),
        lte(todos.dueDate, new Date())
      )
    )
    .orderBy(asc(todos.dueDate));
}

// Update operations
export async function updateTodo(
  id: number,
  data: Partial<typeof todos.$inferInsert>
) {
  const [todo] = await db
    .update(todos)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(todos.id, id))
    .returning();
  return todo;
}

export async function toggleTodoComplete(id: number) {
  const todo = await getTodoById(id);
  if (!todo) throw new Error('Todo not found');

  const [updated] = await db
    .update(todos)
    .set({
      completed: !todo.completed,
      completedAt: !todo.completed ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(todos.id, id))
    .returning();

  return updated;
}

// Delete operations
export async function deleteTodo(id: number) {
  const [deleted] = await db.delete(todos).where(eq(todos.id, id)).returning();
  return deleted;
}

export async function deleteCompletedTodos(userId: number) {
  const result = await db
    .delete(todos)
    .where(and(eq(todos.userId, userId), eq(todos.completed, true)))
    .returning();
  return result;
}
```

### 1.4 Transactions &并发控制

```typescript
// db/transactions.ts
import { db } from './connection';
import { desc } from 'drizzle-orm';

// Transaction with retry logic
async function transferTodoOwnership(
  todoId: number,
  fromUserId: number,
  toUserId: number
) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        // Lock the todo row
        const [todo] = await tx
          .select()
          .from(todos)
          .where(eq(todos.id, todoId))
          .for('update');

        if (!todo) throw new Error('Todo not found');
        if (todo.userId !== fromUserId) throw new Error('Unauthorized');

        // Update ownership
        await tx
          .update(todos)
          .set({ userId: toUserId, updatedAt: new Date() })
          .where(eq(todos.id, todoId));

        // Log the transfer
        await tx.insert(todoHistory).values({
          todoId,
          action: 'ownership_transfer',
          fromUserId,
          toUserId,
          createdAt: new Date(),
        });

        return { success: true };
      });
    } catch (error) {
      if (attempt === 3) throw error;
      // Wait before retry (exponential backoff)
      await new Promise((r) => setTimeout(r, 100 * Math.pow(2, attempt)));
    }
  }
}

// Batch operations with transaction
async function bulkCreateTodos(
  userId: number,
  titles: string[]
) {
  return await db.transaction(async (tx) => {
    const results = [];
    for (const title of titles) {
      const [todo] = await tx
        .insert(todos)
        .values({ userId, title, createdAt: new Date() })
        .returning();
      results.push(todo);
    }
    return results;
  });
}

// Optimistic locking version
export async function updateTodoWithOptimisticLock(
  id: number,
  data: Partial<typeof todos.$inferInsert>,
  expectedVersion: number
) {
  return await db.transaction(async (tx) => {
    const [todo] = await tx
      .select()
      .from(todos)
      .where(eq(todos.id, id))
      .for('update');

    if (!todo) throw new Error('Todo not found');

    // Note: Add version column to schema for this pattern
    // if ((todo as any).version !== expectedVersion) {
    //   throw new Error('Concurrent modification detected');
    // }

    const [updated] = await tx
      .update(todos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(todos.id, id))
      .returning();

    return updated;
  });
}
```

### 1.5 Migrations & drizzle-kit

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Migration settings
  migrations: {
    table: '__drizzle_migrations',
    schemaTable: '__drizzle_migration_schema',
  },
  // Verbose logging
  verbose: true,
  // Strict mode
  strict: true,
});

// Generate migrations
// npx drizzle-kit generate

// Push schema (dev only)
// npx drizzle-kit push

// Run migrations
// npx drizzle-kit migrate

// Studio UI
// npx drizzle-kit studio
```

```typescript
// db/migrations/0000_initial.ts
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export default function migration() {
  return {
    async up(db: any) {
      await db.execute(sql`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
    },
    async down(db: any) {
      await db.execute(sql`DROP TABLE users;`);
    },
  };
}
```

### 1.6 Performance Optimization

```typescript
// Optimized queries with explain
export async function analyzeQuery() {
  const result = await db.execute(sql`
    EXPLAIN ANALYZE
    SELECT t.*, u.username
    FROM todos t
    JOIN users u ON t.user_id = u.id
    WHERE t.completed = false
    ORDER BY t.created_at DESC
    LIMIT 20
  `);
  console.log(result);
}

// Use partial indexes for common queries
// In schema:
export const todos = pgTable('todos', {
  // ...
}, (table) => [
  // Partial index for incomplete todos
  index('todos_incomplete_idx').on(table.userId, table.createdAt).where(sql`completed = false`),
]);

// Select specific columns (avoid SELECT *)
export async function getTodoSummary(userId: number) {
  return await db
    .select({
      id: todos.id,
      title: todos.title,
      priority: todos.priority,
      completed: todos.completed,
      dueDate: todos.dueDate,
    })
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));
}

// Use exists instead of IN for better performance
export async function getUsersWithTodos() {
  return await db
    .select()
    .from(users)
    .where(sql`EXISTS (SELECT 1 FROM todos WHERE todos.user_id = users.id)`);
}

// Batch inserts
export async function bulkInsertTodos(todoData: typeof todos.$inferInsert[]) {
  // Chunk into batches of 100
  const chunkSize = 100;
  const chunks = [];
  for (let i = 0; i < todoData.length; i += chunkSize) {
    chunks.push(todoData.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    await db.insert(todos).values(chunk);
  }
}
```

---

## When to Use This Skill

- Designing database schemas
- Setting up Drizzle relations
- Writing CRUD operations
- Managing transactions
- Creating migrations
- Optimizing queries
- Implementing soft deletes
- Setting up connection pooling

---

## Anti-Patterns to Avoid

**Never:**
- Use `any` types for schema columns
- Skip indexes on foreign keys
- Select `*` when you need specific columns
- Forget `.for('update')` in transactions
- Mix sync and async Drizzle operations
- Skip `.returning()` when needed
- Hardcode connection strings

**Always:**
- Use TypeScript inference (`$inferInsert`, `$inferSelect`)
- Add indexes for WHERE/JOIN columns
- Use partial indexes for filtered queries
- Use transactions for multi-table operations
- Set `expiresOnCommit` for sessions
- Use `pool_pre_ping` for connection health
- Configure `max` connections based on workload

---

## Tools Used

- **Read/Grep:** Examine schemas, find relations
- **Write/Edit:** Create schemas, operations
- **Bash:** Run migrations, drizzle-kit commands
- **Context7 MCP:** Semantic search in Drizzle docs

---

## Verification Process

1. **Type Check:** `tsc --noEmit`
2. **Schema Validation:** `drizzle-kit check`
3. **Migrations:** `drizzle-kit generate && drizzle-kit migrate`
4. **Query Analysis:** Run `EXPLAIN ANALYZE` on slow queries
5. **Connection Pool:** Monitor `pg_stat_activity`
