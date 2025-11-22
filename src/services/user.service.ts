import { PrismaClient, Prisma } from "@prisma/client";

import { ConflictError, NotFoundError } from "../types/errors.types";
import logger from "../utils/logger.util";

/**
 * Service class for user-related operations.
 *
 * Provides methods for creating, reading, updating, and deleting users.
 * All methods include proper error handling and logging.
 *
 * @class UserService
 */
export class UserService {
    /**
     * Creates a new UserService instance.
     *
     * @constructor
     * @param {PrismaClient} prisma - Prisma Client instance for database operations
     */
    constructor(private readonly prisma: PrismaClient) {}

    /**
     * Retrieves all users from the database.
     *
     * Returns users ordered by ID in descending order (newest first),
     * including all associated todos ordered by creation date.
     *
     * @async
     * @function findAll
     * @returns {Promise<Array>} Array of user objects with their todos
     * @throws {Error} If database query fails
     *
     * @example
     * ```typescript
     * const users = await userService.findAll();
     * ```
     */
    async findAll() {
        try {
            return await this.prisma.user.findMany({
                orderBy: { id: "desc" }, // Return newest users first
                include: {
                    todos: {
                        orderBy: { createdAt: "desc" }, // Include todos ordered by newest first
                    },
                },
            });
        } catch (error) {
            logger.error("Error fetching users", error);
            throw error;
        }
    }

    /**
     * Retrieves a single user by ID.
     *
     * @async
     * @function findById
     * @param {number} id - The user's unique identifier
     * @returns {Promise<Object>} User object with associated todos
     * @throws {NotFoundError} If user with the given ID doesn't exist
     * @throws {Error} If database query fails
     *
     * @example
     * ```typescript
     * const user = await userService.findById(1);
     * ```
     */
    async findById(id: number) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                include: {
                    todos: {
                        orderBy: { createdAt: "desc" },
                    },
                },
            });

            if (!user) {
                throw new NotFoundError("User", id);
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error fetching user with id ${id}`, error);
            throw error;
        }
    }

    /**
     * Creates a new user in the database.
     *
     * Validates email uniqueness before creation. Throws ConflictError
     * if a user with the same email already exists.
     *
     * @async
     * @function create
     * @param {Prisma.UserCreateInput} data - User data for creation
     * @param {string} data.name - User's full name
     * @param {string} data.email - User's email address (must be unique)
     * @returns {Promise<Object>} Created user object with todos
     * @throws {ConflictError} If user with the same email already exists
     * @throws {Error} If database operation fails
     *
     * @example
     * ```typescript
     * const user = await userService.create({
     *   name: "John Doe",
     *   email: "john@example.com"
     * });
     * ```
     */
    async create(data: Prisma.UserCreateInput) {
        try {
            // Check if email already exists - Prevent duplicate email addresses
            const existingUser = await this.prisma.user.findUnique({
                where: { email: data.email },
            });

            if (existingUser) {
                throw new ConflictError("User with this email already exists"); // Return 409 Conflict
            }

            return await this.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                },
                include: {
                    todos: true, // Include todos in response for immediate access
                },
            });
        } catch (error) {
            if (error instanceof ConflictError) {
                throw error; // Re-throw known errors without logging
            }
            logger.error("Error creating user", error); // Log unexpected errors
            throw error;
        }
    }

    /**
     * Updates an existing user in the database.
     *
     * Validates that the user exists and checks for email conflicts
     * if the email is being updated. Only provided fields are updated.
     *
     * @async
     * @function update
     * @param {number} id - The user's unique identifier
     * @param {Prisma.UserUpdateInput} data - Partial user data to update
     * @param {string} [data.name] - Updated user name
     * @param {string} [data.email] - Updated email address (must be unique)
     * @returns {Promise<Object>} Updated user object with todos
     * @throws {NotFoundError} If user with the given ID doesn't exist
     * @throws {ConflictError} If updated email conflicts with another user
     * @throws {Error} If database operation fails
     *
     * @example
     * ```typescript
     * const updated = await userService.update(1, {
     *   name: "Jane Doe"
     * });
     * ```
     */
    async update(id: number, data: Prisma.UserUpdateInput) {
        try {
            // Check if user exists - Throws NotFoundError if user doesn't exist
            await this.findById(id);

            // If email is being updated, check for conflicts - Prevent duplicate emails
            if (data.email) {
                const existingUser = await this.prisma.user.findUnique({
                    where: { email: data.email as string },
                });

                if (existingUser && existingUser.id !== id) {
                    throw new ConflictError("User with this email already exists"); // Return 409 if email belongs to another user
                }
            }

            return await this.prisma.user.update({
                where: { id },
                data,
                include: {
                    todos: {
                        orderBy: { createdAt: "desc" }, // Return todos ordered by newest first
                    },
                },
            });
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ConflictError) {
                throw error;
            }
            logger.error(`Error updating user with id ${id}`, error);
            throw error;
        }
    }

    /**
     * Deletes a user from the database.
     *
     * Validates that the user exists before deletion. This operation
     * will cascade delete all associated todos due to database constraints.
     *
     * @async
     * @function delete
     * @param {number} id - The user's unique identifier
     * @returns {Promise<void>} Resolves when user is deleted
     * @throws {NotFoundError} If user with the given ID doesn't exist
     * @throws {Error} If database operation fails
     *
     * @example
     * ```typescript
     * await userService.delete(1);
     * ```
     */
    async delete(id: number) {
        try {
            await this.findById(id); // Verify user exists before deleting

            await this.prisma.user.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error; // Re-throw known errors without logging
            }
            logger.error(`Error deleting user with id ${id}`, error); // Log unexpected errors
            throw error;
        }
    }
}
