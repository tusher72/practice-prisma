import { PrismaClient, Prisma } from "@prisma/client";

import { NotFoundError } from "../types/errors.types";
import logger from "../utils/logger.util";

/**
 * Service class for todo-related operations.
 *
 * Provides methods for creating, reading, updating, and deleting todos
 * with support for pagination, filtering, and user associations.
 *
 * @class TodoService
 */
export class TodoService {
    /**
     * Creates a new TodoService instance.
     *
     * @constructor
     * @param {PrismaClient} prisma - Prisma Client instance for database operations
     */
    constructor(private readonly prisma: PrismaClient) {}

    /**
     * Retrieves todos from the database with optional filtering and pagination.
     *
     * Supports filtering by userId and completion status, and pagination
     * with configurable page size. Returns todos with associated user information.
     *
     * @async
     * @function findAll
     * @param {Object} [filters] - Optional filters and pagination options
     * @param {number} [filters.userId] - Filter todos by user ID
     * @param {boolean} [filters.completed] - Filter by completion status
     * @param {number} [filters.page=1] - Page number (1-indexed)
     * @param {number} [filters.limit=10] - Number of items per page
     * @returns {Promise<Object>} Object containing todos array and pagination metadata
     * @returns {Array} returns.data - Array of todo objects with user information
     * @returns {Object} returns.pagination - Pagination metadata
     * @returns {number} returns.pagination.page - Current page number
     * @returns {number} returns.pagination.limit - Items per page
     * @returns {number} returns.pagination.total - Total number of todos
     * @returns {number} returns.pagination.totalPages - Total number of pages
     * @throws {Error} If database query fails
     *
     * @example
     * ```typescript
     * const result = await todoService.findAll({
     *   userId: 1,
     *   completed: false,
     *   page: 1,
     *   limit: 20
     * });
     * ```
     */
    async findAll(filters?: { userId?: number; completed?: boolean; page?: number; limit?: number }) {
        try {
            const page = filters?.page || 1;
            const limit = filters?.limit || 10;
            const skip = (page - 1) * limit;

            const where: Prisma.TodoWhereInput = {};
            if (filters?.userId !== undefined) {
                where.userId = filters.userId;
            }
            if (filters?.completed !== undefined) {
                where.completed = filters.completed;
            }

            const [todos, total] = await Promise.all([
                this.prisma.todo.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    skip,
                    take: limit,
                }),
                this.prisma.todo.count({ where }),
            ]);

            return {
                data: todos,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            logger.error("Error fetching todos", error);
            throw error;
        }
    }

    /**
     * Retrieves a single todo by ID.
     *
     * @async
     * @function findById
     * @param {number} id - The todo's unique identifier
     * @returns {Promise<Object>} Todo object with associated user information
     * @throws {NotFoundError} If todo with the given ID doesn't exist
     * @throws {Error} If database query fails
     *
     * @example
     * ```typescript
     * const todo = await todoService.findById(1);
     * ```
     */
    async findById(id: number) {
        try {
            const todo = await this.prisma.todo.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            if (!todo) {
                throw new NotFoundError("Todo", id);
            }

            return todo;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error fetching todo with id ${id}`, error);
            throw error;
        }
    }

    /**
     * Creates a new todo in the database.
     *
     * Optionally associates the todo with a user. Validates that the user
     * exists if userId is provided.
     *
     * @async
     * @function create
     * @param {Object} data - Todo data for creation
     * @param {string} data.title - Todo title (required)
     * @param {boolean} [data.completed=false] - Completion status
     * @param {number} [data.userId] - Optional user ID to associate the todo with
     * @returns {Promise<Object>} Created todo object with user information
     * @throws {NotFoundError} If userId is provided and user doesn't exist
     * @throws {Error} If database operation fails
     *
     * @example
     * ```typescript
     * const todo = await todoService.create({
     *   title: "Buy groceries",
     *   completed: false,
     *   userId: 1
     * });
     * ```
     */
    async create(data: { title: string; completed?: boolean; userId?: number }) {
        try {
            // If userId is provided, verify user exists
            if (data.userId) {
                const user = await this.prisma.user.findUnique({
                    where: { id: data.userId },
                });

                if (!user) {
                    throw new NotFoundError("User", data.userId);
                }
            }

            const createData: Prisma.TodoCreateInput = {
                title: data.title,
                completed: data.completed || false,
                ...(data.userId && {
                    user: {
                        connect: { id: data.userId },
                    },
                }),
            };

            return await this.prisma.todo.create({
                data: createData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error("Error creating todo", error);
            throw error;
        }
    }

    /**
     * Updates an existing todo in the database.
     *
     * Validates that the todo exists before updating. Only provided fields
     * are updated (partial update).
     *
     * @async
     * @function update
     * @param {number} id - The todo's unique identifier
     * @param {Prisma.TodoUpdateInput} data - Partial todo data to update
     * @param {string} [data.title] - Updated todo title
     * @param {boolean} [data.completed] - Updated completion status
     * @returns {Promise<Object>} Updated todo object with user information
     * @throws {NotFoundError} If todo with the given ID doesn't exist
     * @throws {Error} If database operation fails
     *
     * @example
     * ```typescript
     * const updated = await todoService.update(1, {
     *   completed: true
     * });
     * ```
     */
    async update(id: number, data: Prisma.TodoUpdateInput) {
        try {
            await this.findById(id);

            return await this.prisma.todo.update({
                where: { id },
                data,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error updating todo with id ${id}`, error);
            throw error;
        }
    }

    /**
     * Deletes a todo from the database.
     *
     * Validates that the todo exists before deletion.
     *
     * @async
     * @function delete
     * @param {number} id - The todo's unique identifier
     * @returns {Promise<void>} Resolves when todo is deleted
     * @throws {NotFoundError} If todo with the given ID doesn't exist
     * @throws {Error} If database operation fails
     *
     * @example
     * ```typescript
     * await todoService.delete(1);
     * ```
     */
    async delete(id: number) {
        try {
            await this.findById(id);

            await this.prisma.todo.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error(`Error deleting todo with id ${id}`, error);
            throw error;
        }
    }
}
