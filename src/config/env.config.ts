import { z } from "zod";
import "dotenv/config";

import { EnvironmentEnum } from "../enums/environment.enum";

/**
 * Zod schema for environment variable validation.
 *
 * Validates and transforms environment variables with:
 * - Type coercion (strings to numbers)
 * - Default values for optional variables
 * - Enum validation for NODE_ENV
 * - URL validation for DATABASE_URL
 *
 * @constant {z.ZodObject}
 */
const ENV_SCHEMA = z.object({
    NODE_ENV: z
        .enum([EnvironmentEnum.DEVELOPMENT, EnvironmentEnum.PRODUCTION, EnvironmentEnum.TEST])
        .default(EnvironmentEnum.DEVELOPMENT),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().url().optional(),
    DB_HOST: z.string().default("localhost"),
    DB_PORT: z.coerce.number().int().positive().default(5432),
    FORWARD_DB_PORT: z.coerce.number().int().positive().optional(),
    DB_USERNAME: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_DATABASE: z.string().optional(),
    CORS_ORIGIN: z.string().default("*"),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

/**
 * Constructs the database connection URL from environment variables.
 *
 * Priority:
 * 1. Uses DATABASE_URL if provided directly
 * 2. Otherwise constructs from individual DB_* variables
 *
 * @function buildDatabaseUrl
 * @returns {string} PostgreSQL connection string
 * @private
 */
function buildDatabaseUrl(): string {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL; // Use provided DATABASE_URL if available
    }

    // Construct connection string from individual environment variables
    const username = process.env.DB_USERNAME || "postgres"; // Default to postgres user
    const password = process.env.DB_PASSWORD || "secret"; // Default password for development
    const host = process.env.DB_HOST || "localhost"; // Default to localhost
    const port = process.env.FORWARD_DB_PORT || process.env.DB_PORT || 5432; // Prefer forwarded port for Docker
    const database = process.env.DB_DATABASE || "postgres"; // Default database name

    return `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`; // Build PostgreSQL connection string
}

/**
 * Validated and parsed environment configuration.
 *
 * This object contains all environment variables validated against the schema.
 * Accessing this ensures type safety and that all required values are present.
 *
 * @constant {z.infer<typeof envSchema>}
 * @throws {z.ZodError} If environment variables don't match the schema
 */
const env = ENV_SCHEMA.parse({
    ...process.env,
    DATABASE_URL: buildDatabaseUrl(),
});

export default env;
