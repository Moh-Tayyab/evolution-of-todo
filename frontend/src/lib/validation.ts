// @spec: specs/002-fullstack-web-app/spec.md
// Zod validation schemas for form validation

import { z } from "zod";

/**
 * Password validation schema.
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
  .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
  .regex(/[0-9]/, "Password must contain at least 1 number");

/**
 * Email validation schema.
 */
export const emailSchema = z.string().email("Invalid email address");

/**
 * Sign up form validation schema.
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, "Name is required").optional(),
});

/**
 * Sign in form validation schema.
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Task creation form validation schema.
 */
export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  tag_ids: z.array(z.string()).optional(),
});

/**
 * Task update form validation schema (all fields optional).
 */
export const taskUpdateSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or less")
      .optional(),
    description: z
      .string()
      .max(2000, "Description must be 2000 characters or less")
      .optional()
      .nullable(),
    priority: z.enum(["high", "medium", "low"]).optional(),
    completed: z.boolean().optional(),
    tag_ids: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * Tag creation form validation schema.
 */
export const tagCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be 50 characters or less"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #FF5733)")
    .optional(),
});

/**
 * Tag update form validation schema (all fields optional).
 */
export const tagUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be 50 characters or less")
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #FF5733)")
    .optional()
    .nullable(),
});

/**
 * Infer TypeScript types from Zod schemas.
 */
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type TaskCreateFormData = z.infer<typeof taskCreateSchema>;
export type TaskUpdateFormData = z.infer<typeof taskUpdateSchema>;
export type TagCreateFormData = z.infer<typeof tagCreateSchema>;
export type TagUpdateFormData = z.infer<typeof tagUpdateSchema>;

// Type aliases for compatibility
export type TagCreateInput = TagCreateFormData;
export type TagUpdateInput = TagUpdateFormData;
