// Neon PostgreSQL Connection with Drizzle

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Create neon connection
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Helper function for transactions
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  // For HTTP mode, transactions are limited
  // Consider using pool mode for complex transactions
  return await callback(db);
}

// Helper for prepared queries
export function prepareQuery(query: string, params: any[]) {
  return {
    sql,
    params
  };
}
