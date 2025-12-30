# Frontend AI Instructions - Next.js Todo Application

## Context

This file contains frontend-specific AI instructions for the Next.js Todo application.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS
- **Auth**: Better Auth (JWT plugin)
- **Validation**: Zod
- **State Management**: React hooks (useState, useEffect, useReducer)
- **Testing**: Jest, React Testing Library

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Landing (redirect logic)
│   │   ├── signin/page.tsx      # Sign in page
│   │   ├── signup/page.tsx      # Sign up page
│   │   └── dashboard/page.tsx  # Protected task dashboard
│   ├── components/
│   │   ├── auth/               # Auth components
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── SignOutButton.tsx
│   │   ├── tasks/              # Task components
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── DeleteConfirmation.tsx
│   │   │   ├── PrioritySelector.tsx
│   │   │   ├── TagInput.tsx
│   │   │   └── TagChip.tsx
│   │   ├── search/            # Search/Filter/Sort components
│   │   │   ├── SearchInput.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── SortSelector.tsx
│   │   │   └── ActiveFilters.tsx
│   │   └── layout/            # Layout components
│   │       ├── Header.tsx
│   │       └── ProtectedRoute.tsx
│   ├── lib/                   # Utilities
│   │   ├── auth.ts            # Better Auth client config
│   │   ├── api.ts             # API client with JWT
│   │   └── validation.ts      # Zod schemas
│   └── types/                 # TypeScript types
│       └── index.ts
└── tests/
    ├── components/             # Component tests
    └── integration/           # Integration tests
```

## Key Patterns

### Component Organization

1. **Separate concerns**: Keep presentation logic separate from business logic
2. **Reusable components**: Extract common UI patterns
3. **Loading states**: Show spinners during async operations
4. **Error handling**: Display user-friendly error messages

### API Client Pattern

```typescript
import { authClient } from './auth';

export const apiClient = {
  async getTasks(userId: string, params?: TaskListParams) {
    const token = await authClient.getToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${userId}/tasks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  }
};
```

### Optimistic Updates

```typescript
const handleToggle = async (taskId: string) => {
  // Optimistic update
  setTasks(prev =>
    prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    )
  );

  try {
    await apiClient.toggleTask(userId, taskId);
  } catch (error) {
    // Rollback on error
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    );
    showToast('Failed to toggle task', 'error');
  }
};
```

## Code Standards

1. **@spec comments**: Every source file must include `@spec:` comments
2. **Type safety**: Strict TypeScript, no `any`
3. **Components**: Functional components with hooks
4. **Styling**: Tailwind CSS utility classes
5. **Accessibility**: Semantic HTML, keyboard navigation

## Data Types

### Task
```typescript
interface Task {
  id: string;           // UUID
  user_id: string;      // UUID
  title: string;        // max 200 chars
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  tags: Tag[];
  created_at: string;   // ISO 8601
  updated_at: string;
}
```

### Tag
```typescript
interface Tag {
  id: string;           // UUID
  user_id: string;      // UUID
  name: string;         // max 50 chars
  color: string | null; // hex color #RRGGBB
  created_at: string;
}
```

## Validation (Zod)

```typescript
import { z } from 'zod';

export const taskCreateSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z.string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  priority: z.enum(['high', 'medium', 'low'])
    .optional()
    .default('medium'),
});
```

## Authentication Flow

### Sign Up
1. User fills SignUpForm
2. Frontend validates with Zod
3. Call `authClient.signUp.email()`
4. Better Auth creates user account
5. Redirect to dashboard

### Sign In
1. User fills SignInForm
2. Frontend validates with Zod
3. Call `authClient.signIn.email()`
4. Better Auth returns JWT token
5. Redirect to dashboard

### Protected Routes
1. ProtectedRoute component checks authentication
2. If not authenticated, redirect to `/signin`
3. API client attaches JWT to requests

## State Management

### Local State
- Use `useState` for simple component state (loading, error, form data)
- Use `useReducer` for complex state (tasks list with filters)

### Global State
- Use React Context for auth state
- Keep user data minimal (userId, token)

## Performance

1. **Debounce search**: 300ms delay before API call
2. **Optimistic updates**: Update UI before API response
3. **Memoization**: Use `useMemo` for expensive computations
4. **Pagination**: Not needed (100 task limit)

## Accessibility

1. **Semantic HTML**: Use proper HTML elements
2. **Keyboard navigation**: All actions accessible via keyboard
3. **ARIA labels**: Add labels for screen readers
4. **Focus management**: Manage focus on modals

## Responsive Design

Breakpoints (Tailwind):
- Mobile: `sm:` (640px)
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)
- Wide: `xl:` (1280px)

Target range: 320px - 1920px

## Testing

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import { TaskItem } from './TaskItem';

test('renders task title', () => {
  render(<TaskItem task={mockTask} />);
  expect(screen.getByText('Test task')).toBeInTheDocument();
});
```

### Coverage
- Target: ≥70% coverage
- Use `npm run test:coverage`

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `BETTER_AUTH_URL`: Better Auth service URL

## Styling Guidelines

### Tailwind Classes
- Use utility-first approach
- Extract common patterns to constants if needed
- Use `clsx` and `tailwind-merge` for conditional classes

### Colors
- Priority: Red (high), Yellow (medium), Gray (low)
- Tags: Use custom colors from user or default palette
- UI: Blue primary, gray neutral

### Spacing
- Consistent 4px/8px grid
- Use padding for content, margin for separation

## Error Handling

1. **User-facing errors**: Toast notifications with clear messages
2. **Network errors**: Retry logic with exponential backoff
3. **Validation errors**: Inline form error messages
4. **401/403**: Redirect to signin on auth errors

## Code Conventions

1. **Imports**: Group imports (React, third-party, local)
2. **Component props**: Define interfaces at top of file
3. **Hooks**: Custom hooks in `lib/hooks.ts` if complex
4. **Constants**: Define in `lib/constants.ts`
