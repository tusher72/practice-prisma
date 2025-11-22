import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDatabase, disconnectDatabase, prisma } from "./config/database.config";
import env from "./config/env.config";
import logger from "./utils/logger.util";
import { errorHandler } from "./middleware/error-handler.middleware";
import { notFoundHandler } from "./middleware/not-found-handler.middleware";
import { requestLogger } from "./middleware/request-logger.middleware";
import { createUsersRouter } from "./routes/users.routes";
import { createTodosRouter } from "./routes/todos.routes";
import { createHealthRouter } from "./routes/health.routes";

// Express application instance.
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(
    cors({
        origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
        credentials: true,
    }),
);

/**
 * Rate limiting middleware configuration.
 * Limits the number of requests per IP address within a time window
 * to prevent abuse and ensure fair resource usage.
 *
 * Configuration:
 * - Window: 15 minutes (900000ms) by default
 * - Max requests: 100 per window by default
 * @constant {rateLimit.RateLimitRequestHandler}
 */
const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        error: {
            message: "Too many requests from this IP, please try again later.",
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use(requestLogger);

// Routes
app.use("/health", createHealthRouter());
app.use("/users", createUsersRouter(prisma));
app.use("/todos", createTodosRouter(prisma));

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

/**
 * HTTP server instance.
 * Listens on the configured port and connects to the database on startup.
 * @constant {Server}
 */
const server = app.listen(env.PORT, async () => {
    try {
        await connectDatabase();
        logger.info(`Server listening on http://localhost:${env.PORT}`);
        logger.info(`Environment: ${env.NODE_ENV}`);
    } catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
});

/**
 * Graceful shutdown handler.
 * Handles application shutdown by:
 * 1. Closing the HTTP server (stops accepting new connections)
 * 2. Disconnecting from the database
 * 3. Exiting the process
 *
 * Includes a 10-second timeout to force shutdown if graceful
 * shutdown takes too long.
 * @async
 * @function handleShutdown
 * @param {string} signal - The signal that triggered shutdown (SIGTERM, SIGINT, etc.)
 * @returns {Promise<void>}
 */
const handleShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        logger.info("HTTP server closed");

        try {
            await disconnectDatabase();
            logger.info("Graceful shutdown completed");
            process.exit(0);
        } catch (error) {
            logger.error("Error during shutdown", error);
            process.exit(1);
        }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", async (): Promise<void> => await handleShutdown("SIGTERM"));
process.on("SIGINT", async (): Promise<void> => await handleShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason: Error): Promise<void> => {
    logger.error("Unhandled Promise Rejection", reason);
    await handleShutdown("unhandledRejection");
});

// Handle uncaught exceptions
process.on("uncaughtException", async (error: Error): Promise<void> => {
    logger.error("Uncaught Exception", error);
    await handleShutdown("uncaughtException");
});

export default app;
