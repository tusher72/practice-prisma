import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDatabase, disconnectDatabase, prisma } from "./config/database.config";
import env from "./config/env.config";
import { errorHandler } from "./middleware/error-handler.middleware";
import { notFoundHandler } from "./middleware/not-found-handler.middleware";
import { requestLogger } from "./middleware/request-logger.middleware";
import { createHealthRouter } from "./routes/health.routes";
import { createTodosRouter } from "./routes/todos.routes";
import { createUsersRouter } from "./routes/users.routes";
import logger from "./utils/logger.util";

// Express application instance.
const app = express();

// Security middleware - Sets secure HTTP headers to protect against common vulnerabilities
app.use(helmet());

// CORS middleware - Enables cross-origin resource sharing with configurable allowed origins
app.use(
    cors({
        origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","), // Support multiple origins or wildcard
        credentials: true, // Allow cookies and authentication headers
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

// Body parsing middleware - Parse JSON and URL-encoded request bodies with size limits
app.use(express.json({ limit: "10mb" })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Support nested objects in form data

// Request logging - Log all HTTP requests for monitoring and debugging
app.use(requestLogger);

// Routes - Register application routes in order of specificity
app.use("/health", createHealthRouter()); // Health check endpoints
app.use("/users", createUsersRouter(prisma)); // User CRUD operations
app.use("/todos", createTodosRouter(prisma)); // Todo CRUD operations

// 404 handler - Catch all unmatched routes and return standardized error
app.use(notFoundHandler);

// Error handler (must be last) - Centralized error handling for all routes
app.use(errorHandler);

/**
 * HTTP server instance.
 * Listens on the configured port and connects to the database on startup.
 * @constant {Server}
 */
const server = app.listen(env.PORT, async () => {
    try {
        await connectDatabase(); // Establish database connection before accepting requests
        logger.info(`Server listening on http://localhost:${env.PORT}`);
        logger.info(`Environment: ${env.NODE_ENV}`);
    } catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1); // Exit with error code if startup fails
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
        // Stop accepting new connections but allow existing requests to complete
        logger.info("HTTP server closed");

        try {
            await disconnectDatabase(); // Close database connections gracefully
            logger.info("Graceful shutdown completed");
            process.exit(0); // Exit successfully
        } catch (error) {
            logger.error("Error during shutdown", error);
            process.exit(1); // Exit with error if shutdown fails
        }
    });

    // Force shutdown after 10 seconds - Prevents hanging if graceful shutdown stalls
    setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", async (): Promise<void> => await handleShutdown("SIGTERM"));
process.on("SIGINT", async (): Promise<void> => await handleShutdown("SIGINT"));

// Handle unhandled promise rejections - Catch async errors that weren't properly handled
process.on("unhandledRejection", async (reason: Error): Promise<void> => {
    logger.error("Unhandled Promise Rejection", reason);
    await handleShutdown("unhandledRejection"); // Gracefully shutdown to prevent data corruption
});

// Handle uncaught exceptions - Catch synchronous errors that weren't caught
process.on("uncaughtException", async (error: Error): Promise<void> => {
    logger.error("Uncaught Exception", error);
    await handleShutdown("uncaughtException"); // Gracefully shutdown to prevent data corruption
});

export default app;
