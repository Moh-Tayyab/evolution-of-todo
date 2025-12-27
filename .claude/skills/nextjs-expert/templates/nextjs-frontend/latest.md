# Next.js API Reference - App Router (Next.js 14+)

This document contains the official client-side API patterns for building Next.js applications. **This is the single source of truth** for all Next.js frontend integrations.

## Installation

Create a new Next.js project or add to existing:

```bash
# Create new project
pnpm create next-app@latest my-app --typescript --tailwind --app

# Add to existing project
pnpm add next react react-dom
pnpm add -D typescript @types/react @types/node
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D eslint eslint-config-next
```

## Overview

Next.js is a React framework that provides:
1. **App Router** - File-system based routing with Server Components
2. **Server Components** - Components that render on the server
3. **Client Components** - Interactive components that render in the browser
4. **Server Actions** - Type-safe mutations
5. **Streaming** - Progressive rendering for faster loads

## Routing

### File-Based Routing

```
app/
├── (auth)/              # Route group (no URL segment)
│   ├── login/
│   │   └── page.tsx     # /login
│   └── register/
│       └── page.tsx     # /register
├── blog/
│   ├── [slug]/          # Dynamic route
│   │   └── page.tsx     # /blog/:slug
│   └── page.tsx         # /blog
├── layout.tsx           # Root layout
└── page.tsx             # / (home page)
```

### Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  return <div>{post?.title}</div>;
}
```

### Catch-All Routes

```tsx
// app/docs/[...slug]/page.tsx
export default function DocsPage({
  params,
}: {
  params: { slug: string[] };
}) {
  // /docs/guide/intro -> slug = ["guide", "intro"]
  return <div>{params.slug.join('/')}</div>;
}
```

### Route Groups

Use parentheses to organize routes without affecting URL:

```
app/
├── (marketing)/         # /about, /contact (no /marketing/)
│   ├── about/
│   └── contact/
├── (dashboard)/         # /dashboard, /dashboard/settings
│   ├── layout.tsx
│   ├── page.tsx
│   └── settings/
```

## Server Components

### Basic Server Component

```tsx
// app/page.tsx
import { prisma } from '@/lib/prisma';

export default async function Page() {
  const posts = await prisma.post.findMany();

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

### Characteristics

- Run on server
- Direct access to databases, file system, env vars
- Cannot use hooks (`useState`, `useEffect`)
- Cannot use event handlers
- No JavaScript sent to client

## Client Components

### Basic Client Component

```tsx
"use client";

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

### Characteristics

- Run in browser
- Require `"use client"` directive
- Can use React hooks
- Can use browser APIs
- Hydration required

## Data Fetching

### Server-Side Fetching

```tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Cache for 1 hour
  }).then(r => r.json());

  return <div>{data}</div>;
}
```

### Fetch Options

| Option | Type | Description |
|--------|------|-------------|
| `cache: 'no-store'` | `string` | Disable caching |
| `next: { revalidate: 3600 }` | `object` | Revalidate after 1 hour |
| `next: { tags: ['posts'] }` | `object` | Tag for revalidation |

### Revalidation

```tsx
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate specific path
revalidatePath('/blog');

// Revalidate by tag
revalidateTag('posts');
```

## Server Actions

### Basic Server Action

```tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;

  // Create post in database
  const post = await prisma.post.create({
    data: { title },
  });

  revalidatePath('/blog');
  return post;
}
```

### Using Server Actions in Forms

```tsx
// app/blog/new/page.tsx
import { createPost } from '@/app/actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

## Route Handlers (API Routes)

### Basic Route Handler

```tsx
// app/api/posts/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = await prisma.post.findMany();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = await prisma.post.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}
```

### Dynamic Route Handler

```tsx
// app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}
```

## Layouts

### Root Layout

```tsx
// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My App',
  description: 'Description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Nested Layout

```tsx
// app/dashboard/layout.tsx
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

## Navigation

### Link Component

```tsx
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>
    </nav>
  );
}
```

### Programmatic Navigation

```tsx
"use client";

import { useRouter, usePathname } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
    router.refresh(); // Refresh server components
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Redirect

```tsx
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getServerSession();
  if (!session) {
    redirect('/login');
  }
  return <div>Protected content</div>;
}
```

## Special Files

### Loading State

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
}
```

### Error Boundary

```tsx
// app/blog/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found Page

```tsx
// app/blog/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h1>Post Not Found</h1>
      <a href="/blog">Back to Blog</a>
    </div>
  );
}
```

## Streaming

### Suspense

```tsx
import { Suspense } from 'react';

export default async function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading posts...</div>}>
        <Posts />
      </Suspense>
      <Suspense fallback={<div>Loading stats...</div>}>
        <Stats />
      </Suspense>
    </div>
  );
}
```

## Styling

### Tailwind CSS

```tsx
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      {children}
    </button>
  );
}
```

### CSS Modules

```tsx
import styles from './Button.module.css';

export function Button({ children }: { children: React.ReactNode }) {
  return <button className={styles.button}>{children}</button>;
}
```

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
}
```

## Performance Optimization

### Image Component

```tsx
import Image from 'next/image';

export function Avatar({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="Avatar"
      width={100}
      height={100}
      priority // For above-fold images
      className="rounded-full"
    />
  );
}
```

### Dynamic Imports

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable SSR if needed
});
```

## Environment Variables

### Server-Side Only

```bash
# .env
DATABASE_URL=postgresql://...
API_KEY=secret-key
```

```tsx
export default async function Page() {
  const dbUrl = process.env.DATABASE_URL;
  const apiKey = process.env.API_KEY;
  // ...
}
```

### Client-Side (Browser)

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SITE_URL=https://mysite.com
```

```tsx
"use client";

export function Component() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // ...
}
```

## TypeScript

### Type Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Middleware

### Basic Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Build & Deploy

### Build Commands

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint
```

## Version Information

This documentation reflects Next.js 14+ with App Router as of December 2024. For the latest updates, visit: https://nextjs.org/docs
