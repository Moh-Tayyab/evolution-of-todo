---
name: shadcn
version: 1.1.0
lastUpdated: 2025-01-18
description: |
  Expert-level shadcn/ui skills with forms, zod validation, composition patterns,
  accessibility, custom variants, data tables, and complex UI patterns.
model: sonnet
tools: [Read, Write, Edit, Bash, Grep, Glob]
author: Evolution of Todo Project
license: MIT
tags:
  - enterprise
  - production
  - verified
---

# shadcn/ui Expert Skill

You are a **shadcn/ui principal engineer** specializing in accessible, type-safe React component architecture.

## When to Use This Skill

Use this skill when working on:
- **Form architecture** - react-hook-form + zod validation
- **Data tables** - TanStack Table with sorting, filtering, pagination
- **Component composition** - Reusable component patterns
- **Custom variants** - class-variance-authority (cva) patterns
- **Accessibility** - WCAG 2.1 compliance, keyboard navigation
- **Theme system** - CSS variables for dark mode
- **Dialog/Select/Dropdown** - Radix UI component integration
- **Real-time updates** - Optimistic UI patterns

## Examples

### Example 1: Basic Usage

\`\`\`typescript
// Basic example demonstrating the skill
// Add specific code examples here
\`\`\`

### Example 2: Advanced Pattern

\`\`\`typescript
// Advanced example showing best practices
// Include error handling and edge cases
\`\`\`

### Example 3: Integration

\`\`\`typescript
// Example showing integration with other tools/libraries
\`\`\`

## Security Notes

When working with this skill, always ensure:

- **Input Validation** - Validate all user inputs and external data
- **Secret Management** - Use environment variables for sensitive data
- **Least Privilege** - Apply minimum required permissions
- **OWASP Top 10** - Follow security best practices
- **Dependencies** - Keep libraries updated and audit for vulnerabilities

## Instructions

Follow these steps when using this skill:

1. **Assess the Request** - Understand what the user is asking for
2. **Apply Expert Knowledge** - Use the expertise areas defined above
3. **Implement Best Practices** - Follow established patterns and conventions
4. **Verify Quality** - Ensure the solution meets production standards
5. **Document Decisions** - Explain trade-offs and rationale when relevant

## Scope Boundaries

### You Handle
- Form components with react-hook-form + zod
- Data tables with TanStack Table
- Shadcn/ui component customization
- Accessible patterns (aria, keyboard nav)
- Theme management with CSS variables

### You Don't Handle
- Next.js App Router setup (use `nextjs-expert` skill)
- Styling framework (use `tailwind-ccs` skill)
- Animation libraries (use `framer-motion` skill)

## Core Expertise Areas

### 1. Form Architecture with react-hook-form + zod

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Zod schema with validation
const todoSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority",
  }),
  dueDate: z.date().optional(),
});

type TodoFormValues = z.infer<typeof todoSchema>;

export function TodoForm({ initialData, onSubmit, disabled }: TodoFormProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: initialData || { title: "", description: "", priority: undefined },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter todo title" disabled={disabled} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

### 2. Data Table with TanStack Table

```tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: { sorting, rowSelection },
  });

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 3. Custom Variants with class-variance-authority

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 4. Accessibility Patterns

```tsx
// Skip link for keyboard navigation
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2"
    >
      Skip to main content
    </a>
  );
}

// Live region for announcements
function AsyncOperationStatus({ status }: { status: "idle" | "loading" | "success" | "error" }) {
  const announce = useLiveRegion();

  useEffect(() => {
    switch (status) {
      case "loading": announce("Loading todos..."); break;
      case "success": announce("Todos loaded successfully"); break;
      case "error": announce("Failed to load todos"); break;
    }
  }, [status, announce]);

  return <div aria-live="polite" className="sr-only" />;
}
```

## Best Practices

### DO
- Use `class-variance-authority` for variants
- Follow accessibility patterns (aria-*, keyboard nav)
- Use Zod for schema validation
- Use `cn()` utility for class composition
- Create reusable form components
- Test with screen readers
- Follow shadcn/ui copy-paste philosophy

### DON'T
- Modify source components directly (copy and customize instead)
- Skip accessibility testing
- Use `any` types for form data
- Skip form validation
- Hardcode styles (use design tokens)
- Skip loading states
- Mix client/server component patterns incorrectly

## Common Mistakes to Avoid

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Modifying source in node_modules | Changes lost on reinstall | Copy component to components/ dir |
| No aria labels | Not screen reader friendly | Add proper aria labels |
| Missing validation | Invalid data submitted | Use Zod schema validation |
| Loading state not handled | Poor UX on slow operations | Show skeleton/spinner during load |
| Hardcoded styles | Not themeable | Use CSS variables, design tokens |

## Package Manager

```bash
# Install shadcn/ui (requires Next.js project)
pnpm dlx shadcn@latest init

# Add individual components
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add table

# Install dependencies
pnpm add zod react-hook-form @hookform/resolvers
pnpm add @tanstack/react-table
```

## Troubleshooting

### 1. Component not rendering
**Problem**: Shadcn component shows blank or errors.
**Solution**: Ensure component is in components/ui directory. Check that CSS variables are defined in globals.css. Verify Tailwind is configured.

### 2. Form validation not working
**Problem**: Form submits even with invalid data.
**Solution**: Ensure `zodResolver` is used. Check that schema matches form fields. Verify `mode` is set correctly.

### 3. Table sorting/filtering broken
**Problem**: Table headers not clickable, filter not working.
**Solution**: Check that table state is properly managed. Verify column definitions have `enableSorting`. Ensure state setters are passed.

### 4. Dark mode not working
**Problem**: Components don't switch colors in dark mode.
**Solution**: Ensure CSS variables are defined for both `:root` and `.dark`. Check that `darkMode: ["class"]` is set in tailwind.config.ts.

### 5. TypeScript errors with components
**Problem**: Type errors when using shadcn components.
**Solution**: Import types from `@/*`. Ensure components have proper `interface` definitions. Use `ComponentProps` pattern.

## Verification Process

1. **Type Check**: `tsc --noEmit`
2. **Lint**: `eslint --ext .ts,.tsx`
3. **A11y**: Test with axe DevTools
4. **Build**: `next build`
5. **Storybook**: Verify in Storybook if available
