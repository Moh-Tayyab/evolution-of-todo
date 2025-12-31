---
name: shadcn-expert
description: >
  Expert-level shadcn/ui skills with forms, zod validation, composition patterns,
  accessibility, custom variants, data tables, and complex UI patterns.
---

# shadcn/ui Expert Skill

You are a **shadcn/ui principal engineer** specializing in accessible, type-safe React component architecture.

## Core Responsibilities

When generating or modifying shadcn components, ensure:

### 1.1 Form Architecture with react-hook-form + zod

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Reusable form component
interface TodoFormProps {
  initialData?: Partial<TodoFormValues>;
  onSubmit: (data: TodoFormValues) => Promise<void>;
  disabled?: boolean;
}

export function TodoForm({ initialData, onSubmit, disabled }: TodoFormProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      priority: undefined,
      dueDate: undefined,
    },
    mode: "onChange",
  });

  async function handleSubmit(values: TodoFormValues) {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter todo title"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is your todo's display title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter description"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={disabled}>
          {initialData ? "Update Todo" : "Create Todo"}
        </Button>
      </form>
    </Form>
  );
}
```

### 1.2 Data Table with TanStack Table

```tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Todo {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  createdAt: Date;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
}

// Priority badge component
const priorityVariants = {
  low: "bg-slate-100 text-slate-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

// Data table component
export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      {/* Column visibility dropdown could go here */}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Define columns
export const todoColumns: ColumnDef<Todo>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as "low" | "medium" | "high";
      return (
        <Badge variant="outline" className={priorityVariants[priority]}>
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "completed",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("completed") ? "default" : "secondary"}>
        {row.getValue("completed") ? "Done" : "Pending"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
];
```

### 1.3 Composition Patterns

```tsx
// Higher-order component pattern
interface WithLoadingProps<T> {
  isLoading: boolean;
  data: T | null;
  skeleton: React.ReactNode;
}

export function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  SkeletonComponent: React.FC
) {
  return function WithLoadingComponent({
    isLoading,
    data,
    skeleton,
    ...props
  }: WithLoadingProps<P> & Omit<P, keyof WithLoadingProps<P>>) {
    if (isLoading) return <SkeletonComponent />;
    if (!data) return null;
    return <WrappedComponent data={data} {...(props as P)} />;
  };
}

// Card with context
import { createContext, useContext, useState } from "react";

interface CardContextValue {
  expanded: boolean;
  toggleExpanded: () => void;
}

const CardContext = createContext<CardContextValue | null>(null);

export function ExpandableCard({
  children,
  defaultExpanded = false,
}: {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <CardContext.Provider value={{ expanded, toggleExpanded: () => setExpanded(!expanded) }}>
      <Card className="overflow-hidden">{children}</Card>
    </CardContext.Provider>
  );
}

export function ExpandableCardTrigger({ children }: { children: React.ReactNode }) {
  const context = useContext(CardContext);
  if (!context) throw new Error("Must be used within ExpandableCard");

  return (
    <div onClick={context.toggleExpanded} className="cursor-pointer">
      {children}
    </div>
  );
}
```

### 1.4 Custom Variants with class-variance-authority

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-amber-500 text-white hover:bg-amber-600",
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

### 1.5 Accessibility Patterns

```tsx
// Accessible dialog with focus management
import * as Dialog from "@radix-ui/react-dialog";

// Skip link for keyboard navigation
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
    >
      Skip to main content
    </a>
  );
}

// Live region for announcements
import { useLiveRegion } from "@/hooks/use-live-region";

function AsyncOperationStatus({ status }: { status: "idle" | "loading" | "success" | "error" }) {
  const announce = useLiveRegion();

  useEffect(() => {
    switch (status) {
      case "loading":
        announce("Loading todos...");
        break;
      case "success":
        announce("Todos loaded successfully");
        break;
      case "error":
        announce("Failed to load todos. Please try again.");
        break;
    }
  }, [status, announce]);

  return <div aria-live="polite" className="sr-only" />;
}

// Focus trap for modals
import { FocusTrap } from "@radix-ui/react-focus-trap";

export function AccessibleModal({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <FocusTrap>
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg">
            {children}
          </Dialog.Content>
        </FocusTrap>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### 1.6 Complex Form Patterns

```tsx
// Multi-step form with validation
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const steps = [
  { id: "personal", title: "Personal Info" },
  { id: "contact", title: "Contact Details" },
  { id: "preferences", title: "Preferences" },
] as const;

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    mode: "onChange",
  });

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm",
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form steps */}
      {currentStep === 0 && <PersonalStep form={form} />}
      {currentStep === 1 && <ContactStep form={form} />}
      {currentStep === 2 && <PreferencesStep form={form} />}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </Button>
        {currentStep === steps.length - 1 ? (
          <Button type="submit">Submit</Button>
        ) : (
          <Button type="button" onClick={nextStep}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 1.7 Theme System with CSS Variables

```tsx
// lib/theme.ts
export const theme = {
  light: {
    --background: "0 0% 100%",
    --foreground: "222.2 84% 4.9%",
    --card: "0 0% 100%",
    --card-foreground: "222.2 84% 4.9%",
    --popover: "0 0% 100%",
    --popover-foreground: "222.2 84% 4.9%",
    --primary: "221.2 83.2% 53.3%",
    --primary-foreground: "210 40% 98%",
    --secondary: "210 40% 96.1%",
    --secondary-foreground: "222.2 47.4% 11.2%",
    --muted: "210 40% 96.1%",
    --muted-foreground: "215.4 16.3% 46.9%",
    --accent: "210 40% 96.1%",
    --accent-foreground: "222.2 47.4% 11.2%",
    --destructive: "0 84.2% 60.2%",
    --destructive-foreground: "210 40% 98%",
    --border: "214.3 31.8% 91.4%",
    --input: "214.3 31.8% 91.4%",
    --ring: "221.2 83.2% 53.3%",
    --radius: "0.5rem",
  },
  dark: {
    // ... dark theme variables
  },
};

// Usage in components
<div className="bg-background text-foreground">
  <Card className="bg-card text-card-foreground">
    <CardHeader>
      <CardTitle className="text-primary">Title</CardTitle>
    </CardHeader>
  </Card>
</div>
```

---

## When to Use This Skill

- Building forms with react-hook-form + zod
- Creating data tables with TanStack Table
- Implementing accessible components (WCAG 2.1)
- Composing complex UI patterns
- Creating custom button/variant styles
- Managing theme with CSS variables
- Using Dialog, Select, Dropdown components
- Implementing real-time updates

---

## Anti-Patterns to Avoid

**Never:**
- Modify source components directly (copy and customize instead)
- Skip accessibility testing
- Use `any` types for form data
- Skip form validation
- Hardcode styles (use design tokens)
- Skip loading states
- Mix client/server component patterns incorrectly

**Always:**
- Use `class-variance-authority` for variants
- Follow accessibility patterns (aria-*, keyboard nav)
- Use Zod for schema validation
- Use `cn()` utility for class composition
- Create reusable form components
- Test with screen readers
- Follow the shadcn/ui copy-paste philosophy

---

## Tools Used

- **Read/Grep:** Examine components, find patterns
- **Write/Edit:** Create custom components
- **Bash:** Run dev servers, build apps
- **Context7 MCP:** Semantic search in Radix UI documentation

---

## Verification Process

1. **Type Check:** `tsc --noEmit`
2. **Lint:** `eslint --ext .ts,.tsx`
3. **A11y:** Test with axe DevTools
4. **Build:** `next build`
5. **Storybook:** Verify in Storybook if available
