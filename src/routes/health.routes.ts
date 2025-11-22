import { Router, Request, Response } from "express";
import { prisma } from "../config/database.config";
import { asyncHandler } from "../middleware/async-handler.middleware";
import logger from "../utils/logger.util";
import { HttpStatusEnum } from "../enums/http-status.enum";

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
        asyncHandler(async (_req: Request, res: Response) => {
            try {
                // Check database connection
                await prisma.$queryRaw`SELECT 1`;

                res.json({
                    success: true,
                    status: "healthy",
                    timestamp: new Date().toISOString(),
                    services: {
                        database: "connected",
                    },
                });
            } catch (error: unknown) {
                logger.error("Health check failed", error);
                res.status(HttpStatusEnum.SERVICE_UNAVAILABLE).json({
                    success: false,
                    status: "unhealthy",
                    timestamp: new Date().toISOString(),
                    services: {
                        database: "disconnected",
                    },
                });
            }
        }),
    );

    return router;
}
