import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

import env from "../config/env.config";
import { EnvironmentEnum } from "../enums/environment.enum";
import { HttpStatusEnum } from "../enums/http-status.enum";
import { AppError } from "../types/errors.types";
import logger from "../utils/logger.util";

/**
 * Express error handling middleware.
 *
 * Handles errors in the following order:
 * 1. AppError instances (custom application errors)
 * 2. Prisma known request errors (P2002: unique constraint, P2025: not found)
 * 3. Prisma validation errors
 * 4. Unknown errors (generic 500 error)
 *
 * Error responses follow a standardized format:
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "message": "Error message",
 *     "stack": "..." // Only in development
 *   }
 * }
 * ```
 *
 * @function errorHandler
 * @param {Error | AppError} error - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused)
 * @returns {void}
 *
 * @example
 * ```typescript
 * app.use(errorHandler);
 * ```
 */
export function errorHandler(error: Error | AppError, req: Request, res: Response, _next: NextFunction): void {
    // Log error - Capture error details for debugging and monitoring
    logger.error("Error occurred", {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    // Handle known AppError - Custom application errors with predefined status codes
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message,
                ...(env.NODE_ENV === EnvironmentEnum.DEVELOPMENT && { stack: error.stack }), // Include stack trace only in development
            },
        });
        return;
    }

    // Handle Prisma errors - Map database errors to appropriate HTTP status codes
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = error;
        if (prismaError.code === "P2002") {
            // Unique constraint violation - Return 409 Conflict
            res.status(HttpStatusEnum.CONFLICT).json({
                success: false,
                error: {
                    message: "A record with this value already exists",
                    code: prismaError.code,
                },
            });
            return;
        }

        if (prismaError.code === "P2025") {
            // Record not found - Return 404 Not Found
            res.status(HttpStatusEnum.NOT_FOUND).json({
                success: false,
                error: {
                    message: "Record not found",
                    code: prismaError.code,
                },
            });
            return;
        }
    }

    // Handle validation errors - Invalid data format or structure
    if (error instanceof Prisma.PrismaClientValidationError) {
        res.status(HttpStatusEnum.BAD_REQUEST).json({
            success: false,
            error: {
                message: "Invalid input data",
                ...(env.NODE_ENV === EnvironmentEnum.DEVELOPMENT && { details: error.message }), // Include details only in development
            },
        });
        return;
    }

    // Handle unknown errors - Fallback for unexpected error types
    res.status(HttpStatusEnum.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
            message: env.NODE_ENV === EnvironmentEnum.PRODUCTION ? "Internal server error" : error.message, // Hide error details in production
            ...(env.NODE_ENV === EnvironmentEnum.DEVELOPMENT && { stack: error.stack }), // Include stack trace only in development
        },
    });
}
