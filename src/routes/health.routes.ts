import { Router, Request, Response } from "express";

import { prisma } from "../config/database.config";
import { HttpStatusEnum } from "../enums/http-status.enum";
import { createAsyncHandler } from "../middleware/async-handler.middleware";
import logger from "../utils/logger.util";

/**
 * Creates and configures the health check router.
 *
 * Sets up health monitoring endpoints for application and database status.
 *
 * @function createHealthRouter
 * @returns {Router} Configured Express router for health check routes
 *
 * @example
 * ```typescript
 * const healthRouter = createHealthRouter();
 * app.use("/health", healthRouter);
 * ```
 */
export function createHealthRouter(): Router {
    const router = Router();

    router.get(
        "/",
        createAsyncHandler(async (_req: Request, res: Response) => {
            try {
                // Check database connection - Simple query to verify database is accessible
                await prisma.$queryRaw`SELECT 1`;

                res.json({
                    success: true,
                    status: "healthy",
                    timestamp: new Date().toISOString(), // Include timestamp for monitoring
                    services: {
                        database: "connected", // Indicate database is operational
                    },
                });
            } catch (error: unknown) {
                logger.error("Health check failed", error);
                res.status(HttpStatusEnum.SERVICE_UNAVAILABLE).json({
                    // Return 503 if database is unavailable
                    success: false,
                    status: "unhealthy",
                    timestamp: new Date().toISOString(),
                    services: {
                        database: "disconnected", // Indicate database connection failure
                    },
                });
            }
        }),
    );

    return router;
}
