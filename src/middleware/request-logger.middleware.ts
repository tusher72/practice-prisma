import { Request, Response, NextFunction } from "express";

import logger from "../utils/logger.util";

/**
 * Express middleware for logging HTTP requests.
 *
 * Captures request timing and logs request/response information
 * after the response is sent. This ensures accurate duration
 * measurements and doesn't block the response.
 *
 * @function requestLogger
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 *
 * @example
 * ```typescript
 * app.use(requestLogger);
 * ```
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now(); // Record start time for duration calculation

    res.on("finish", () => {
        // Log after response is sent - Ensures accurate duration and doesn't block response
        const duration = Date.now() - start; // Calculate request processing time
        logger.info("HTTP Request", {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`, // Include duration for performance monitoring
            ip: req.ip, // Log client IP for security and analytics
            userAgent: req.get("user-agent"), // Log user agent for debugging
        });
    });

    next(); // Continue to next middleware
}
