import winston from "winston";

import env from "../config/env.config";
import { EnvironmentEnum } from "../enums/environment.enum";

/**
 * Winston logger instance configured for the application.
 *
 * Configuration:
 * - Log level: 'info' in production, 'debug' in development
 * - Format: JSON with timestamps and error stacks
 * - Transports:
 *   - File: logs/error.log (errors only)
 *   - File: logs/combined.log (all logs)
 *   - Console: Colorized output in development
 *
 * @constant {winston.Logger}
 */
const logger = winston.createLogger({
    level: env.NODE_ENV === EnvironmentEnum.PRODUCTION ? "info" : "debug",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
    ),
    defaultMeta: { service: "practice-prisma" },
    transports: [
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
});

if (env.NODE_ENV !== EnvironmentEnum.PRODUCTION) {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    ({ timestamp, level, message, ...meta }: winston.Logform.TransformableInfo) =>
                        `${timestamp} [${level}]: ${message} ${
                            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
                        }`,
                ),
            ),
        }),
    );
}

export default logger;
