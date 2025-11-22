import { z } from "zod";

/**
 * Schema for validating user creation requests.
 *
 * Validates:
 * - name: Non-empty string, 1-255 characters, trimmed
 * - email: Valid email format, trimmed and lowercased
 *
 * @constant {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Valid request body:
 * {
 *   name: "John Doe",
 *   email: "john@example.com"
 * }
 * ```
 */
export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(255).trim(),
        email: z.string().email().trim().toLowerCase(),
    }),
});

/**
 * Schema for validating user update requests.
 *
 * Validates:
 * - params.id: Numeric string converted to number
 * - body.name: Optional, non-empty string, 1-255 characters, trimmed
 * - body.email: Optional, valid email format, trimmed and lowercased
 * - Requires at least one field in body to be provided
 *
 * @constant {z.ZodObject}
 */
export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
    }),
    body: z
        .object({
            name: z.string().min(1).max(255).trim().optional(),
            email: z.string().email().trim().toLowerCase().optional(),
        })
        .refine((data: { name?: string; email?: string }) => Object.keys(data).length > 0, {
            message: "At least one field must be provided for update",
        }),
});

/**
 * Schema for validating get user by ID requests.
 *
 * Validates:
 * - params.id: Numeric string converted to number
 *
 * @constant {z.ZodObject}
 */
export const getUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
    }),
});

/**
 * Schema for validating user deletion requests.
 *
 * Validates:
 * - params.id: Numeric string converted to number
 *
 * @constant {z.ZodObject}
 */
export const deleteUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
    }),
});
