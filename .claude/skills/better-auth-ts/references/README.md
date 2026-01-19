# Better Auth TypeScript References

Official documentation and resources for implementing Better Auth in TypeScript/JavaScript applications with React, Next.js, and Node.js.

## Official Resources

### Better Auth Documentation
- **Official Website**: https://better-auth.com
- **GitHub Repository**: https://github.com/better-auth/better-auth
- **Documentation**: https://better-auth.com/docs
- **API Reference**: https://better-auth.com/docs/api
- **Examples**: https://better-auth.com/docs/examples

### Installation
```bash
npm install better-auth
# or
yarn add better-auth
# or
pnpm add better-auth
```

## Core Concepts

### Authentication Methods
- **Credential Auth**: Email/password authentication
- **OAuth2**: Social login providers (Google, GitHub, Discord, etc.)
- **Magic Links**: Passwordless email authentication
- **Passkeys**: WebAuthn passwordless authentication
- **Multi-Factor Authentication**: TOTP/SMS 2FA

### Session Management
- **Session-Based**: Server-side sessions with secure cookies
- **JWT Tokens**: Stateless authentication with JSON Web Tokens
- **Session Cookies**: httpOnly, secure, sameSite configuration
- **Refresh Tokens**: Automatic token rotation

## Quick Start

### Backend Setup (Node.js/Express)
```typescript
import { betterAuth } from "better-auth";
import { express } from "better-auth/adapters";

const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});

app.use("/api/auth/*", express(auth));
```

### Frontend Setup (React)
```typescript
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: "http://localhost:3000/api/auth",
});

function App() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <LoginForm />;
  }

  return <Dashboard user={session.user} />;
}
```

## React Integration

### Auth Provider Setup
```typescript
import { AuthProvider } from "better-auth/react";

function App() {
  return (
    <AuthProvider baseURL="/api/auth">
      <YourApp />
    </AuthProvider>
  );
}
```

### Login Component
```typescript
import { useAuth } from "better-auth/react";

function LoginForm() {
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn.email({
      email: "user@example.com",
      password: "password123",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Protected Routes
```typescript
import { useAuth } from "better-auth/react";

function ProtectedRoute({ children }) {
  const { data: session, isPending } = useAuth();

  if (isPending) return <LoadingSpinner />;
  if (!session) return <Navigate to="/login" />;

  return children;
}
```

## Next.js Integration

### App Router Setup
```typescript
// app/api/auth/[...all]/route.ts
import { betterAuth } from "better-auth";
import { nextApp } from "better-auth/adapters";

export const { handler, auth } = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL,
  },
  plugins: [nextApp()],
});

export { handler as GET, handler as POST };
```

### Server Actions
```typescript
// app/actions/auth.ts
"use server";

import { auth } from "@/api/auth/[...all]/route";

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
```

### Middleware for Protection
```typescript
// middleware.ts
import { auth } from "@/api/auth/[...all]/route";

export default auth.middleware((req) => {
  if (!req.session && req.nextUrl.pathname.startsWith("/dashboard")) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*"];
};
```

## Server-Side Rendering (SSR)

### Getting Session on Server
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {session.user.name}!</div>;
}
```

### Passing Session to Client
```typescript
import { auth } from "@/lib/auth";
import { Session } from "better-auth/react";

export default async function Layout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Session value={session}>
      {children}
    </Session>
  );
}
```

## OAuth2 Social Providers

### Configuration
```typescript
const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    },
  },
});
```

### Social Login Button
```typescript
function SocialLoginButtons() {
  const { signIn } = useAuth();

  return (
    <>
      <button onClick={() => signIn.social({ provider: "google" })}>
        Continue with Google
      </button>
      <button onClick={() => signIn.social({ provider: "github" })}>
        Continue with GitHub
      </button>
    </>
  );
}
```

## Database Schema

### PostgreSQL Schema
```sql
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE session (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE account (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_id TEXT NOT NULL,
  UNIQUE(provider, account_id)
);
```

### Drizzle ORM Schema
```typescript
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## Two-Factor Authentication

### Enable 2FA
```typescript
const auth = betterAuth({
  twoFactor: {
    enabled: true,
  },
});
```

### Setup 2FA Component
```typescript
function TwoFactorSetup() {
  const { twoFactor } = useAuth();
  const [secret, setSecret] = useState("");

  const enable2FA = async () => {
    const result = await twoFactor.enable();
    setSecret(result.secret!);
  };

  return (
    <>
      <button onClick={enable2FA}>Enable 2FA</button>
      {secret && <QRCode value={secret} />}
    </>
  );
}
```

### Verify 2FA on Login
```typescript
function TwoFactorVerify() {
  const { twoFactor } = useAuth();

  const verify = async (code: string) => {
    await twoFactor.verify({ code });
  };

  return (
    <input
      type="text"
      placeholder="Enter 2FA code"
      onChange={(e) => verify(e.target.value)}
    />
  );
}
```

## Advanced Features

### Custom User Fields
```typescript
const auth = betterAuth({
  user: {
    additionalFields: {
      organization: {
        type: "string",
        required: false,
      },
      role: {
        type: "enum",
        options: ["admin", "user", "guest"],
        defaultValue: "user",
      },
    },
  },
});
```

### Role-Based Access Control (RBAC)
```typescript
const auth = betterAuth({
  advanced: {
    generateId: () => crypto.randomUUID(),
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  // Define roles and permissions
  authorization: {
    enabled: true,
    roles: {
      admin: ["read", "write", "delete"],
      user: ["read", "write"],
      guest: ["read"],
    },
  },
});
```

### Session Management
```typescript
function SessionManager() {
  const { signOut, data: session } = useAuth();

  const revokeAllSessions = async () => {
    await auth.api.revokeSessions({
      headers: {},
    });
  };

  const revokeCurrentSession = async () => {
    await signOut();
  };

  return (
    <>
      <p>Active sessions: {session?.user.sessions.length}</p>
      <button onClick={revokeAllSessions}>Revoke All</button>
      <button onClick={revokeCurrentSession}>Sign Out</button>
    </>
  );
}
```

## Email Templates

### Custom Email Verification
```typescript
const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: `
          <h1>Welcome, ${user.name}!</h1>
          <p>Click below to verify your email:</p>
          <a href="${url}">Verify Email</a>
        `,
      });
    },
  },
});
```

## Testing

### Testing with Vitest
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { auth } from "@/lib/auth";
import { testClient } from "better-auth/test";

describe("Authentication", () => {
  it("should sign up a new user", async () => {
    const client = testClient(auth);

    const result = await client.signUp.email({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe("test@example.com");
  });

  it("should sign in existing user", async () => {
    const client = testClient(auth);

    const result = await client.signIn.email({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.session).toBeDefined();
  });
});
```

## TypeScript Types

### User Type
```typescript
import type { Session, User } from "better-auth/types";

interface CustomUser extends User {
  organization?: string;
  role: "admin" | "user" | "guest";
}

function getCurrentUser(): CustomUser | null {
  // ...
}
```

### Auth Client Types
```typescript
import type { AuthClient } from "better-auth/react";

const authClient: AuthClient = createAuthClient({
  baseURL: "/api/auth",
});
```

## Deployment

### Environment Variables
```bash
# .env
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://user:pass@host/db

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

### Production Checklist
- [ ] Set strong `BETTER_AUTH_SECRET` (32+ characters)
- [ ] Configure `BETTER_AUTH_URL` to production domain
- [ ] Enable secure cookies (HTTPS only)
- [ ] Set up proper CORS origins
- [ ] Configure database connection pooling
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up email verification
- [ ] Configure OAuth redirect URLs
- [ ] Enable 2FA for sensitive operations
- [ ] Set up session timeout
- [ ] Monitor authentication logs
- [ ] Regular security audits

## Security Best Practices

### Cookie Configuration
```typescript
const auth = betterAuth({
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false, // Enable only if needed
    },
    secureCookies: process.env.NODE_ENV === "production",
  },
});
```

### Rate Limiting
```typescript
import rateLimit from "express-rate-limit";

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many attempts, please try again later.",
});

app.post("/api/auth/sign-in/email", authRateLimit);
```

### CSRF Protection
```typescript
const auth = betterAuth({
  advanced: {
    csrfProtection: {
      enabled: true,
    },
  },
});
```

## Troubleshooting

### Common Issues

**Issue: CORS errors on OAuth callback**
- Configure allowed origins in `betterAuth()` config
- Add callback URL to OAuth provider whitelist
- Ensure `BETTER_AUTH_URL` matches your domain

**Issue: Session not persisting**
- Check cookie settings (secure, httpOnly, sameSite)
- Verify `BETTER_AUTH_SECRET` is consistent
- Ensure database session records exist

**Issue: Email verification not sending**
- Verify SMTP configuration
- Check email provider's spam settings
- Test email template rendering

**Issue: TypeScript errors**
- Ensure `better-auth/types` is imported
- Check for version compatibility
- Run `npx tsc --noEmit` to verify types

## Community Resources

- **Discord**: https://discord.gg/better-auth
- **GitHub Discussions**: https://github.com/better-auth/better-auth/discussions
- **Twitter/X**: @betterauthjs
- **Blog**: https://better-auth.com/blog

## Related Libraries

- **Drizzle ORM**: https://orm.drizzle.team/
- **Prisma**: https://www.prisma.io/
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/

## Migration Guides

### From NextAuth.js
- [Migration Guide](https://better-auth.com/docs/migrate/nextauth)
- Key differences and equivalent APIs
- Database migration steps

### From Lucia Auth
- [Migration Guide](https://better-auth.com/docs/migrate/lucia)
- Configuration mapping
- Session handling differences
