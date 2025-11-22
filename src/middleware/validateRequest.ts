import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../types/errors";

/**
 * Creates Express middleware for request validation.
 *
 * Validates the combined request data (body, query, params) against
 * the provided Zod schema. If validation fails, creates a ValidationError
 * with detailed field-level error information.
 *
 * @function validateRequest
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 *
 * @example
 * ```typescript
 * const createUserSchema = z.object({
 *   body: z.object({
 *     name: z.string().min(1),
 *     email: z.string().email()
 *   })
 * });
 *
 * router.post("/users", validateRequest(createUserSchema), asyncHandler(...));
 * ```
 */
export function validateRequest(schema: ZodSchema) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const validated = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Store validated and transformed values back into request
            if (validated.body) req.body = validated.body;
            if (validated.query) {
                // Merge validated query params into req.query
                Object.assign(req.query, validated.query);
            }
            if (validated.params) {
                // Merge validated params into req.params
                Object.assign(req.params, validated.params);
            }
            next();
        } catch (error: unknown) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                    code: err.code,
                }));
                next(new ValidationError("Validation failed", details));
            } else {
                next(error as Error);
            }
        }
    };
}
