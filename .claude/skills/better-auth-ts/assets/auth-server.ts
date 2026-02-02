// Better Auth Server Configuration

import { betterAuth } from "better-auth";
import { pgAdapter } from "better-auth/adapters/postgres";
import { username, twoFactor, emailAndPassword } from "better-auth/plugins";

export const auth = betterAuth({
  database: pgAdapter(process.env.DATABASE_URL!),
  secret: process.env.BETTER_AUTH_SECRET!,

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // Social providers
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Plugins
  plugins: [
    username(),
    twoFactor(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
