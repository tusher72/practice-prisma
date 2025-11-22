import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import env from "./env";
import logger from "../utils/logger";

/**
 * PostgreSQL connection pool configuration.
 *
 * Pool settings:
 * - max: 20 concurrent connections
 * - idleTimeoutMillis: 30 seconds (close idle connections)
 * - connectionTimeoutMillis: 2 seconds (timeout for new connections)
 *
 * @constant {Pool}
 */
const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

/**
 * Handles errors from idle database connections.
 *
 * This event listener catches unexpected errors on idle pool clients,
 * such as network disconnections or database restarts.
 *
 * @event Pool#error
 */
pool.on("error", (err) => {
    logger.error("Unexpected error on idle client", err);
});

/**
 * Prisma PostgreSQL adapter instance.
 *
 * Connects Prisma Client to the PostgreSQL connection pool,
 * enabling connection pooling and better resource management.
 *
 * @constant {PrismaPg}
 */
const adapter = new PrismaPg(pool);

/**
 * Prisma Client instance with PostgreSQL adapter.
 *
 * Configuration:
 * - Uses PrismaPg adapter for connection pooling
 * - Logs queries, errors, and warnings to the application logger
 * - Event-driven logging for better observability
 *
 * @constant {PrismaClient}
 */
export const prisma = new PrismaClient({
    adapter,
    log: [
        { level: "query", emit: "event" },
        { level: "error", emit: "event" },
        { level: "warn", emit: "event" },
    ],
});

/**
 * Logs all Prisma queries for debugging and performance monitoring.
 *
 * @event PrismaClient#query
 * @param {Object} e - Query event object
 * @param {string} e.query - SQL query string
 * @param {number} e.duration - Query execution time in milliseconds
 */
prisma.$on("query", (e) => {
    logger.debug("Query", { query: e.query, duration: `${e.duration}ms` });
});

/**
 * Logs Prisma errors for monitoring and debugging.
 *
 * @event PrismaClient#error
 * @param {Object} e - Error event object
 */
prisma.$on("error", (e) => {
    logger.error("Prisma error", e);
});

/**
 * Logs Prisma warnings for potential issues.
 *
 * @event PrismaClient#warn
 * @param {Object} e - Warning event object
 */
prisma.$on("warn", (e) => {
    logger.warn("Prisma warning", e);
});

/**
 * Establishes connection to the database.
 *
 * Connects Prisma Client to the PostgreSQL database and verifies
 * the connection is successful. Throws an error if connection fails.
 *
 * @async
 * @function connectDatabase
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} If database connection fails
 *
 * @example
 * ```typescript
 * await connectDatabase();
 * // Database is now connected and ready to use
 * ```
 */
export async function connectDatabase(): Promise<void> {
    try {
        await prisma.$connect();
        logger.info("Database connected successfully");
    } catch (error) {
        logger.error("Failed to connect to database", error);
        throw error;
    }
}

/**
 * Gracefully disconnects from the database.
 *
 * Closes all database connections and ends the connection pool.
 * Should be called during application shutdown to ensure clean
 * resource cleanup.
 *
 * @async
 * @function disconnectDatabase
 * @returns {Promise<void>} Resolves when disconnection is complete
 * @throws {Error} If disconnection fails
 *
 * @example
 * ```typescript
 * await disconnectDatabase();
 * // All database connections are now closed
 * ```
 */
export async function disconnectDatabase(): Promise<void> {
    try {
        await prisma.$disconnect();
        await pool.end();
        logger.info("Database disconnected successfully");
    } catch (error) {
        logger.error("Error disconnecting from database", error);
        throw error;
    }
}
