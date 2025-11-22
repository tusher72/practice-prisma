import { z } from "zod";

/**
 * Schema for validating todo creation requests.
 *
 * Validates:
 * - body.title: Non-empty string, 1-500 characters, trimmed
 * - body.userId: Optional positive integer
 * - body.startedTime: Optional ISO date string
 * - body.duration: Optional positive integer (duration in minutes)
 * - body.tags: Optional array of strings (max 50 characters each)
 *
 * @constant {z.ZodObject}
 */
export const createTodoSchema = z.object({
    body: z.object({
        title: z.string().min(1).max(500).trim(),
        userId: z.number().int().positive().optional(),
        startedTime: z.string().datetime().optional(),
        duration: z.number().int().positive().optional(),
        tags: z.array(z.string().min(1).max(50)).optional(),
    }),
});

/**
 * Schema for validating todo update requests.
 *
 * Validates:
 * - params.id: Numeric string converted to number
 * - body.title: Optional, non-empty string, 1-500 characters, trimmed
 * - body.completed: Optional boolean
 * - body.startedTime: Optional ISO date string
 * - body.duration: Optional positive integer (duration in minutes)
 * - body.tags: Optional array of strings (max 50 characters each)
 * - Requires at least one field in body to be provided
 *
 * @constant {z.ZodObject}
 */
export const updateTodoSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
    }),
    body: z
        .object({
            title: z.string().min(1).max(500).trim().optional(),
            completed: z.boolean().optional(),
            startedTime: z.string().datetime().optional(),
            duration: z.number().int().positive().optional(),
            tags: z.array(z.string().min(1).max(50)).optional(),
        })
        .refine(
            (data: { title?: string; completed?: boolean; startedTime?: string; duration?: number; tags?: string[] }) =>
                Object.keys(data).length > 0,
            {
                message: "At least one field must be provided for update",
            },
        ),
});

/**
 * Schema for validating get todo by ID requests.
 *
 * Validates:
 * - params.id: Numeric string converted to number
 *
 * @constant {z.ZodObject}
 */
export const getTodoSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
    }),
});

/**
 * Schema for validating todo deletion requests.
 *
 * Validates:
 * - params.id: Numeric string converted to number
 *
 * @constant {z.ZodObject}
 */
export const deleteTodoSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/).transform(Number),
    }),
});

/**
 * Schema for validating get todos list requests with filtering and pagination.
 *
 * Validates:
 * - query.userId: Optional numeric string converted to number
 * - query.completed: Optional string "true"/"false" converted to boolean
 * - query.tag: Optional string to filter by tag
 * - query.isExpired: Optional string "true"/"false" converted to boolean
 * - query.page: Optional numeric string, defaults to "1"
 * - query.limit: Optional numeric string, defaults to "10"
 *
 * @constant {z.ZodObject}
 */
export const getTodosSchema = z.object({
    query: z.preprocess(
        (data) => {
            const query = data as Record<string, unknown>;
            const result: Record<string, unknown> = {};
            if (query.userId !== undefined && query.userId !== "") {
                result.userId = query.userId;
            }
            if (query.completed !== undefined && query.completed !== "") {
                result.completed = query.completed;
            }
            if (query.tag !== undefined && query.tag !== "") {
                result.tag = query.tag;
            }
            if (query.isExpired !== undefined && query.isExpired !== "") {
                result.isExpired = query.isExpired;
            }
            result.page = query.page && query.page !== "" ? query.page : "1";
            result.limit = query.limit && query.limit !== "" ? query.limit : "10";
            return result;
        },
        z.object({
            userId: z.string().regex(/^\d+$/).transform(Number).optional(),
            completed: z
                .string()
                .transform((val: string) => val === "true")
                .optional(),
            tag: z.string().min(1).max(50).optional(),
            isExpired: z
                .string()
                .transform((val: string) => val === "true")
                .optional(),
            page: z.string().regex(/^\d+$/).transform(Number),
            limit: z.string().regex(/^\d+$/).transform(Number),
        }),
    ),
});
