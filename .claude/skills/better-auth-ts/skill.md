# Better Auth TypeScript Skill

## Overview
This skill provides expertise for Better Auth integration with TypeScript applications (Next.js, React).

## Usage
Invoke this skill when you need help with:
- Setting up Better Auth with Next.js
- Client-side authentication flows
- Server-side auth configuration
- Implementing OAuth providers
- Managing user sessions
- Adding auth plugins (2FA, magic links, etc.)

## Core Concepts

### Server Configuration

```typescript
import { betterAuth } from "better-auth";
import { username, twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  database: pgAdapter(db),
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  socialProviders: {
    github: { clientId: process.env.GITHUB_CLIENT_ID! },
  },
  plugins: [username(), twoFactor()],
});
```

### Client Setup

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

### Session Management

```typescript
'use client'

import { useAuth } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useAuth();
  
  if (isPending) return <LoadingSpinner />;
  if (!session) return <LoginForm />;
  
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

## Examples

### Sign Up with Email

```typescript
'use client'

import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSignUp = async () => {
    await authClient.signUp.email({
      email, password, name: "John Doe",
    });
  };
  
  return (
    <form onSubmit={handleSignUp}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Social Sign In

```typescript
const handleGitHubSignIn = async () => {
  await authClient.signIn.social({
    provider: "github",
    callbackURL: "/dashboard",
  });
};
```

### Two-Factor Authentication

```typescript
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({ twoFactorPage: "/two-factor" }),
  ],
});

await authClient.twoFactor.enableTotp({ code: "123456" });
```

## Best Practices

1. **Environment variables** - Use .env for sensitive values
2. **Server-only secrets** - Never expose to client
3. **Session verification** - Always verify on protected routes
4. **OAuth callbacks** - Use proper callback URLs
5. **Error handling** - Provide clear error messages
6. **Loading states** - Show loading during auth operations
7. **Redirect flows** - Handle correctly after auth
8. **Logout everywhere** - Invalidate all sessions
9. **Email verification** - Require for new accounts
10. **Rate limiting** - Protect auth endpoints

## Common Pitfalls

### Exposing Secrets

```typescript
// BAD - Secret exposed
const authClient = createAuthClient({
  baseURL: "https://api.example.com",
  secret: process.env.SECRET_KEY,
});

// GOOD - Secret only on server
export const auth = betterAuth({
  secret: process.env.SECRET_KEY,
});
```

### Missing Session Check

```typescript
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return <Dashboard />;
}
```

## Tools Used
- **Read/Grep Tools:** Examine code, find patterns, read existing implementations
- **Write/Edit Tools:** Create new schemas/endpoints, modify existing code
- **Bash:** Run servers, execute migrations, install dependencies
- **Context7 MCP:** Semantic search in PostgreSQL/Python/Helm documentation

## Verification Process
After implementing changes:
1. **Health Check:** Verify application is running (`/health` endpoint or similar)
2. **Database Check:** Run query to verify database connection
3. **Migration Check:** Confirm migrations applied successfully
4. **Integration Check:** Test API calls work end-to-end
5. **Log Review:** Check for errors in application logs

## Error Patterns
Common errors to recognize:
- **Connection errors:** Database/API unreachable, network timeouts
- **Schema errors:** Invalid table/column names, constraint violations
- **Type errors:** Invalid data types, missing fields
- **Authentication errors:** Invalid tokens, expired sessions
- **Configuration errors:** Missing environment variables, invalid config
