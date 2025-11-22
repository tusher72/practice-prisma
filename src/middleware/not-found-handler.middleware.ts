import { Request, Response } from "express";
import { HttpStatusEnum } from "../enums/http-status.enum";

/**
 * Express middleware for handling 404 Not Found errors.
 *
 * Returns a standardized 404 error response for routes that
 * don't match any registered route handlers.
 *
 * @function notFoundHandler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Register after all routes
 * app.use(notFoundHandler);
 * ```
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(HttpStatusEnum.NOT_FOUND).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
}
