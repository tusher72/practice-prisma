import { Request, Response, NextFunction } from "express";

/**
 * Type definition for async Express request handlers.
 *
 * @typedef {Function} AsyncRequestHandler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void | Response>}
 */
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;

/**
 * Wraps an async route handler to automatically catch errors.
 *
 * Converts async route handlers into Express middleware that automatically
 * catches promise rejections and forwards them to the error handling middleware.
 *
 * @function asyncHandler
 * @param {AsyncRequestHandler} fn - Async route handler function
 * @returns {Function} Express middleware function
 *
 * @example
 * ```typescript
 * router.get("/users", asyncHandler(async (req, res) => {
 *   const users = await userService.findAll();
 *   res.json({ success: true, data: users });
 * }));
 * ```
 */
export function asyncHandler(fn: AsyncRequestHandler) {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
