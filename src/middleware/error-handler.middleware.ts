import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../types/errors.types";
import logger from "../utils/logger.util";
import env from "../config/env.config";
import { HttpStatusEnum } from "../enums/http-status.enum";
import { EnvironmentEnum } from "../enums/environment.enum";

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
 * @param {Error | AppError} err - The error object
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
export function errorHandler(err: Error | AppError, req: Request, res: Response, _next: NextFunction): void {
    // Log error
    logger.error("Error occurred", {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
    });

    // Handle known AppError
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                ...(env.NODE_ENV === EnvironmentEnum.DEVELOPMENT && { stack: err.stack }),
            },
        });
        return;
    }

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = err as Prisma.PrismaClientKnownRequestError;
        if (prismaError.code === "P2002") {
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

    // Handle validation errors
    if (err instanceof Prisma.PrismaClientValidationError) {
        res.status(HttpStatusEnum.BAD_REQUEST).json({
            success: false,
            error: {
                message: "Invalid input data",
                ...(env.NODE_ENV === EnvironmentEnum.DEVELOPMENT && { details: err.message }),
            },
        });
        return;
    }

    // Handle unknown errors
    res.status(HttpStatusEnum.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
            message: env.NODE_ENV === EnvironmentEnum.PRODUCTION ? "Internal server error" : err.message,
            ...(env.NODE_ENV === EnvironmentEnum.DEVELOPMENT && { stack: err.stack }),
        },
    });
}
