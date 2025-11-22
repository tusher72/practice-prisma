import { HttpStatusEnum } from "../enums/httpStatus";

/**
 * Base application error class.
 *
 * All custom application errors extend this class. It provides:
 * - HTTP status code for API responses
 * - Operational error flag to distinguish operational vs programming errors
 * - Proper error stack trace capture
 *
 * @class AppError
 * @extends {Error}
 *
 * @property {HttpStatus} statusCode - HTTP status code for the error
 * @property {string} message - Error message
 * @property {boolean} isOperational - Whether this is an operational error (default: true)
 *
 * @example
 * ```typescript
 * throw new AppError(HttpStatus.BAD_REQUEST, "Invalid input provided");
 * ```
 */
export class AppError extends Error {
    constructor(
        public statusCode: HttpStatusEnum,
        public message: string,
        public isOperational = true,
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation error for invalid input data.
 *
 * Used when request validation fails (e.g., invalid schema, missing required fields).
 * Automatically sets HTTP status code to 400 (Bad Request).
 *
 * @class ValidationError
 * @extends {AppError}
 *
 * @property {unknown} [details] - Optional validation error details (e.g., field-level errors)
 *
 * @example
 * ```typescript
 * throw new ValidationError("Email is required", { field: "email" });
 * ```
 */
export class ValidationError extends AppError {
    constructor(
        message: string,
        public details?: unknown,
    ) {
        super(HttpStatusEnum.BAD_REQUEST, message);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Resource not found error.
 *
 * Used when a requested resource (user, todo, etc.) cannot be found.
 * Automatically sets HTTP status code to 404 (Not Found).
 *
 * @class NotFoundError
 * @extends {AppError}
 *
 * @param {string} resource - Name of the resource type (e.g., "User", "Todo")
 * @param {string | number} [identifier] - Optional identifier of the missing resource
 *
 * @example
 * ```typescript
 * throw new NotFoundError("User", 123);
 * // Error message: "User with id 123 not found"
 * ```
 */
export class NotFoundError extends AppError {
    constructor(resource: string, identifier?: string | number) {
        super(
            HttpStatusEnum.NOT_FOUND,
            identifier ? `${resource} with id ${identifier} not found` : `${resource} not found`,
        );
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Conflict error for duplicate or conflicting data.
 *
 * Used when a request conflicts with the current state of the resource
 * (e.g., duplicate email, unique constraint violation).
 * Automatically sets HTTP status code to 409 (Conflict).
 *
 * @class ConflictError
 * @extends {AppError}
 *
 * @example
 * ```typescript
 * throw new ConflictError("User with this email already exists");
 * ```
 */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(HttpStatusEnum.CONFLICT, message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
