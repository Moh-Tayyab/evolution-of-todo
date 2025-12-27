// Drizzle ORM Schema Definition

import { pgTable, serial, text, boolean, timestamp, integer, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('todos_user_id_idx').on(table.userId),
  completedIdx: index('todos_completed_idx').on(table.completed),
}));
