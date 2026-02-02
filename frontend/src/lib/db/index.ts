// @spec: specs/002-fullstack-web-app/plan.md
// Database connection for Better Auth with Drizzle ORM

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const db = drizzle(neon(process.env.DATABASE_URL), { schema });
