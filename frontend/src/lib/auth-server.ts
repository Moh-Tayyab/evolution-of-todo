// @spec: specs/002-fullstack-web-app/plan.md
// Better Auth server configuration (JWT from FastAPI backend, no database needed)

import { betterAuth } from "better-auth";

export const authServer = betterAuth({
  // We don't need database adapter since we're using JWT from FastAPI backend
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    cookiePrefix: "todo_app",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  socialLogins: [],
});
