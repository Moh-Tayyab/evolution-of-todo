# Next.js Expert References

Official documentation and resources for Next.js, the React framework for production.

## Official Resources

### Next.js Documentation
- **Official Website**: https://nextjs.org/
- **GitHub**: https://github.com/vercel/next.js
- **Documentation**: https://nextjs.org/docs
- **Learn**: https://nextjs.org/learn
- **Blog**: https://nextjs.org/blog

## Installation

```bash
npx create-next-app@latest my-app
# or
yarn create next-app my-app
# or
pnpm create next-app my-app
```

## App Router (Next.js 13+)

### File Structure
```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page
├── about/
│   └── page.tsx        # /about route
├── blog/
│   ├── page.tsx        # /blog route
│   ├── [slug]/         # Dynamic route
│   │   └── page.tsx    # /blog/[slug]
│   └── layout.tsx      # Blog layout
└── api/
    └── hello/
        └── route.ts    # /api/hello
```

### Server Component
```tsx
// app/page.tsx
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data.title}</div>;
}
```

### Client Component
```tsx
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Layouts
```tsx
// app/layout.tsx
import './globals.css';

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

## Data Fetching

### Server-side Fetching
```tsx
// Fetch on server, cache by default
const data = await fetch('https://api.example.com/data');

// No cache
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});

// Revalidate every 60 seconds
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }
});

// Revalidate at specific time
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: new Date('2024-01-01') }
});
```

### Parallel Routes
```tsx
export default async function Page() {
  const [users, posts] = await Promise.all([
    fetch('https://api.example.com/users').then(r => r.json()),
    fetch('https://api.example.com/posts').then(r => r.json()),
  ]);

  return <Main users={users} posts={posts} />;
}
```

## Server Actions

### Form Handling
```tsx
// app/actions.ts
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  // Database operation
  return { success: true };
}

// app/users/page.tsx
import { createUser } from '../actions';

export default function Page() {
  return (
    <form action={createUser}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Revalidation
```tsx
import { revalidatePath } from 'next/cache';

export async function updatePost() {
  // Update logic
  revalidatePath('/blog');
  revalidatePath('/blog/[slug]');
}
```

## API Routes

### Route Handlers
```tsx
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

### Dynamic Routes
```tsx
// app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const post = await getPost(params.id);
  return NextResponse.json(post);
}
```

## Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

## Styling

### Tailwind CSS
```tsx
export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <h1 className="text-4xl font-bold">Hello</h1>
    </div>
  );
}
```

### CSS Modules
```tsx
import styles from './page.module.css';

export default function Page() {
  return <h1 className={styles.title}>Hello</h1>;
}
```

## Images

```tsx
import Image from 'next/image';

export default function Page() {
  return (
    <Image
      src="/hero.png"
      alt="Hero"
      width={800}
      height={600}
      priority
    />
  );
}
```

## Fonts

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return <html className={inter.className}>{children}</html>;
}
```

## Metadata

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My App',
  description: 'My app description',
  openGraph: {
    title: 'My App',
    description: 'My app description',
    images: ['/og-image.png'],
  },
};

export default function Page() {
  return <div>Content</div>;
}
```

## Static Assets

```
public/
├── images/
├── fonts/
└── favicon.ico
```

## Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://...
API_KEY=secret_key

# .env.production (committed)
NEXT_PUBLIC_API_URL=https://api.example.com
```

```tsx
const dbUrl = process.env.DATABASE_URL;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Deployment

### Vercel
```bash
vercel
```

### Docker
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Best Practices

- Use Server Components by default
- Use Client Components only when needed
- Fetch data on the server when possible
- Use Server Actions for mutations
- Implement proper caching strategies
- Optimize images with next/image
- Use proper metadata for SEO
- Handle errors gracefully
- Implement proper loading states
- Use App Router for new projects

## Performance

### Static Generation
```tsx
// Generate static pages at build time
export const dynamic = 'force-static';
```

### ISR (Incremental Static Regeneration)
```tsx
export const revalidate = 60; // seconds
```

### Streaming
```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SlowComponent />
    </Suspense>
  );
}
```

## Resources

- **Next.js Learn**: https://nextjs.org/learn
- **Next.js Docs**: https://nextjs.org/docs
- **Create Next App**: https://nextjs.org/docs/app/api-reference/create-next-app
