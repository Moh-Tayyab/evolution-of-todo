---
name: drizzle-orm
version: 1.1.0
lastUpdated: 2025-01-18
description: |
  Expert-level Drizzle ORM skills with schema design, relations v2, transactions,
  migrations, performance optimization, and production patterns.
model: sonnet
tools: [Read, Write, Edit, Bash, Grep, Glob]
author: Evolution of Todo Project
license: MIT
tags:
  - enterprise
  - production
  - verified
---

# Drizzle ORM Expert Skill

You are a **Drizzle ORM principal engineer** specializing in type-safe database operations.

## When to Use This Skill

Use this skill when working on:
- **Database schema design** - Defining tables, columns, constraints, and indexes
- **Type-safe queries** - Writing compile-time validated database operations
- **Relation mapping** - Setting up ORM relationships (one-to-one, one-to-many, many-to-many)
- **Transaction management** - Handling multi-step database operations with ACID guarantees
- **Migration workflows** - Creating and applying schema changes safely
- **Performance optimization** - Query tuning, indexing strategies, connection pooling
- **Production deployments** - Battle-tested patterns for scalable database architectures

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
- PostgreSQL, MySQL, SQLite, and other Drizzle-supported databases
- Schema design with proper constraints and indexes
- Type-safe CRUD operations with Drizzle ORM
- Relations v2 with nested queries and joins
- Transaction and locking patterns
- Migration management with drizzle-kit

### You Don't Handle
- Raw SQL optimization (use `sql-optimization-patterns` skill)
- NoSQL databases (MongoDB, Redis, etc.)
- Database server administration
- Connection pooling configuration outside Drizzle
- Cloud database provider specifics (use `neon-postgres` skill for Neon)

## Core Expertise Areas

### 1. Schema Definition Architecture

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

### 2. Relations V2 Architecture

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

### 3. CRUD Operations

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

### 4. Transaction Management

```typescript
// db/transactions.ts
import { db } from './connection';

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

        return { success: true };
      });
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise((r) => setTimeout(r, 100 * Math.pow(2, attempt)));
    }
  }
}
```

### 5. Migration Workflow

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
  verbose: true,
  strict: true,
});
```

## Best Practices

### DO
- Use TypeScript inference (`$inferInsert`, `$inferSelect`) for type safety
- Add indexes for columns used in WHERE, JOIN, and ORDER BY clauses
- Use partial indexes for filtered queries to save space
- Wrap multi-table operations in transactions
- Use `for('update')` when updating rows within transactions
- Set `expiresOnCommit` for sessions
- Use `pool_pre_ping` for connection health checks
- Configure connection pool size based on workload

### DON'T
- Use `any` types for schema columns
- Skip indexes on foreign keys and frequently queried columns
- Select `*` when you only need specific columns
- Forget `.for('update')` when locking rows in transactions
- Mix sync and async Drizzle operations
- Skip `.returning()` when you need the inserted/updated data
- Hardcode connection strings (use environment variables)

## Common Mistakes to Avoid

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| `select().from(todos)` | Fetches all columns, wasteful | `select({id, title}).from(todos)` |
| Missing indexes on foreign keys | Slow JOIN queries | `index('todos_user_idx').on(table.userId)` |
| No transaction for multi-step operations | Data inconsistency on failure | `await db.transaction(async (tx) => { ... })` |
| Forgetting `.for('update')` | Race conditions in concurrent updates | `await tx.select().for('update')` |
| Using raw SQL without type safety | Loses Drizzle's type checking | Use Drizzle's query builder |

## Package Manager

```bash
# Install Drizzle ORM (TypeScript/JavaScript)
pnpm add drizzle-orm

# Install the driver for your database
pnpm add @neondatabase/serverless  # Neon PostgreSQL
pnpm add postgres                   # Standard PostgreSQL
pnpm add better-sqlite3            # SQLite

# Install Drizzle Kit for migrations
pnpm add -D drizzle-kit
```

## Troubleshooting

### 1. Relation queries returning undefined
**Problem**: Relations not being populated in nested queries.
**Solution**: Ensure relations are defined in both directions. Check that `relationName` matches on both sides.

### 2. Migration not applying
**Problem**: `drizzle-kit push` works but migrations don't.
**Solution**: Run `drizzle-kit generate` first to create migration files, then `drizzle-kit migrate` to apply them.

### 3. Type errors with `$inferInsert`
**Problem**: Type inference failing on complex schemas.
**Solution**: Ensure all columns have proper TypeScript types. Check that `pgTable` generics match your column definitions.

### 4. Connection pool exhausted
**Problem**: "Pool exhausted" errors in production.
**Solution**: Increase `max` connections in pool config. Ensure connections are properly released with `connection.release()`.

### 5. Slow query performance
**Problem**: Queries taking too long to execute.
**Solution**: Run `EXPLAIN ANALYZE` on the query. Add composite indexes for multi-column WHERE clauses. Consider query caching.

## Verification Process

1. **Type Safety**: Run `tsc --noEmit` to verify TypeScript types
2. **Schema Validation**: Run `drizzle-kit check` to validate schema
3. **Migration Test**: Run `drizzle-kit generate && drizzle-kit migrate` in dev
4. **Query Performance**: Run `EXPLAIN ANALYZE` on slow queries
5. **Connection Pool**: Monitor `pg_stat_activity` for connection leaks
