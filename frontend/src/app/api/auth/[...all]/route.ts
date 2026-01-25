// @spec: specs/002-fullstack-web-app/plan.md
// Better Auth API route handler for Next.js App Router

import { authServer } from "@/lib/auth-server";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(authServer);
