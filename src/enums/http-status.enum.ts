/**
 * HTTP status codes enum.
 *
 * Provides type-safe access to HTTP status codes used throughout the application.
 * Based on RFC 7231 and RFC 7235.
 *
 * @enum {number}
 */
export enum HttpStatusEnum {
    // 2xx Success
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,

    // 4xx Client Error
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,

    // 5xx Server Error
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
}
