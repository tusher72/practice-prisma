import { PrismaClient, Prisma } from "@prisma/client";

import { NotFoundError } from "../types/errors.types";
import logger from "../utils/logger.util";

/**
 * Calculates if a todo is expired based on startedTime and duration.
 *
 * A todo is expired if:
 * - startedTime is set
 * - duration is set
 * - Current time is past startedTime + duration
 *
 * @function calculateExpiration
 * @param {Date | null} startedTime - When the todo was started
 * @param {number | null} duration - Duration in minutes
 * @returns {boolean} True if the todo is expired, false otherwise
 */
function calculateExpiration(startedTime: Date | null, duration: number | null): boolean {
    if (!startedTime || !duration) {
        return false; // Cannot calculate expiration without both values
    }
    const expirationTime = new Date(startedTime.getTime() + duration * 60 * 1000); // Add duration in milliseconds
    return new Date() > expirationTime; // Check if current time is past expiration
}

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
     * Supports filtering by userId, completion status, tags, and expiration status.
     * Automatically calculates and updates expiration status for todos.
     *
     * @async
     * @function findAll
     * @param {Object} [filters] - Optional filters and pagination options
     * @param {number} [filters.userId] - Filter todos by user ID
     * @param {boolean} [filters.completed] - Filter by completion status
     * @param {string} [filters.tag] - Filter todos by tag
     * @param {boolean} [filters.isExpired] - Filter by expiration status
     * @param {number} [filters.page=1] - Page number (1-indexed)
     * @param {number} [filters.limit=10] - Number of items per page
     * @returns {Promise<Object>} Object containing todos array and pagination metadata
     * @returns {Array} returns.data - Array of todo objects with user information and calculated expiration
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
     *   tag: "work",
     *   isExpired: false,
     *   page: 1,
     *   limit: 20
     * });
     * ```
     */
    async findAll(filters?: {
        userId?: number;
        completed?: boolean;
        tag?: string;
        isExpired?: boolean;
        page?: number;
        limit?: number;
    }) {
        try {
            const page = filters?.page || 1; // Default to first page
            const limit = filters?.limit || 10; // Default to 10 items per page
            const skip = (page - 1) * limit; // Calculate offset for pagination

            const where: Prisma.TodoWhereInput = {};
            if (filters?.userId !== undefined) {
                where.userId = filters.userId; // Add user filter if provided
            }
            if (filters?.completed !== undefined) {
                where.completed = filters.completed; // Add completion status filter if provided
            }
            if (filters?.tag !== undefined) {
                (where as any).tags = {
                    has: filters.tag, // Filter todos that contain the specified tag
                };
            }

            const [todos, total] = await Promise.all([
                // Fetch todos and total count in parallel for better performance
                this.prisma.todo.findMany({
                    where,
                    orderBy: { createdAt: "desc" }, // Show newest todos first
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true, // Include only necessary user fields
                            },
                        },
                    },
                    skip, // Skip items for pagination
                    take: limit, // Limit number of items returned
                }),
                this.prisma.todo.count({ where }), // Count total matching todos
            ]);

            // Calculate expiration status and filter if needed
            const processedTodos = todos.map((todo) => {
                const isExpired = calculateExpiration((todo as any).startedTime, (todo as any).duration);
                return {
                    ...todo,
                    isExpired, // Add calculated expiration status
                };
            });

            // Filter by expiration status if specified
            let filteredTodos = processedTodos;
            if (filters?.isExpired !== undefined) {
                filteredTodos = processedTodos.filter((todo) => todo.isExpired === filters.isExpired);
            }

            // Update expiration status in database for todos that have changed
            const todosToUpdate = processedTodos.filter((todo) => {
                const currentIsExpired = calculateExpiration((todo as any).startedTime, (todo as any).duration);
                const existingIsExpired = (todo as any).isExpired || false;
                return currentIsExpired !== existingIsExpired && (todo as any).startedTime && (todo as any).duration;
            });
            if (todosToUpdate.length > 0) {
                await Promise.all(
                    todosToUpdate.map((todo) =>
                        this.prisma.todo.update({
                            where: { id: todo.id },
                            data: { isExpired: (todo as any).isExpired } as any, // Type assertion needed until Prisma types are fully regenerated after migration
                        }),
                    ),
                );
            }

            return {
                data: filteredTodos,
                pagination: {
                    page,
                    limit,
                    total: filters?.isExpired === undefined ? total : filteredTodos.length,
                    totalPages: Math.ceil((filters?.isExpired === undefined ? total : filteredTodos.length) / limit), // Calculate total pages for pagination UI
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
     * Calculates and updates expiration status if the todo has startedTime and duration.
     *
     * @async
     * @function findById
     * @param {number} id - The todo's unique identifier
     * @returns {Promise<Object>} Todo object with associated user information and calculated expiration
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
                            email: true, // Include user details for display
                        },
                    },
                },
            });

            if (!todo) {
                throw new NotFoundError("Todo", id); // Return 404 if todo doesn't exist
            }

            // Calculate expiration status
            const isExpired = calculateExpiration((todo as any).startedTime, (todo as any).duration);
            const existingIsExpired = (todo as any).isExpired || false;

            // Update expiration status in database if it has changed
            if (isExpired !== existingIsExpired && (todo as any).startedTime && (todo as any).duration) {
                await this.prisma.todo.update({
                    where: { id },
                    data: { isExpired } as any, // Type assertion needed until Prisma types are fully regenerated after migration
                });
            }

            return {
                ...todo,
                isExpired, // Return todo with calculated expiration status
            };
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
     * exists if userId is provided. Calculates expiration status if startedTime and duration are provided.
     *
     * @async
     * @function create
     * @param {Object} data - Todo data for creation
     * @param {string} data.title - Todo title (required)
     * @param {boolean} [data.completed=false] - Completion status
     * @param {number} [data.userId] - Optional user ID to associate the todo with
     * @param {string} [data.startedTime] - Optional ISO date string for when the todo was started
     * @param {number} [data.duration] - Optional duration in minutes
     * @param {string[]} [data.tags] - Optional array of tag strings
     * @returns {Promise<Object>} Created todo object with user information and calculated expiration
     * @throws {NotFoundError} If userId is provided and user doesn't exist
     * @throws {Error} If database operation fails
     *
     * @example
     * ```typescript
     * const todo = await todoService.create({
     *   title: "Buy groceries",
     *   completed: false,
     *   userId: 1,
     *   startedTime: "2024-01-01T10:00:00Z",
     *   duration: 60,
     *   tags: ["shopping", "urgent"]
     * });
     * ```
     */
    async create(data: {
        title: string;
        completed?: boolean;
        userId?: number;
        startedTime?: string;
        duration?: number;
        tags?: string[];
    }) {
        try {
            // If userId is provided, verify user exists - Ensure referential integrity
            if (data.userId) {
                const user = await this.prisma.user.findUnique({
                    where: { id: data.userId },
                });

                if (!user) {
                    throw new NotFoundError("User", data.userId); // Return 404 if user doesn't exist
                }
            }

            // Parse startedTime if provided
            const startedTime = data.startedTime ? new Date(data.startedTime) : null;

            // Calculate expiration status
            const isExpired = calculateExpiration(startedTime, data.duration || null);

            const createData: any = {
                title: data.title,
                completed: data.completed || false, // Default to false if not provided
                startedTime,
                duration: data.duration || null,
                tags: data.tags || [],
                isExpired,
                ...(data.userId && {
                    // Conditionally connect to user if userId is provided
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
     * are updated (partial update). Recalculates expiration status if startedTime or duration are updated.
     *
     * @async
     * @function update
     * @param {number} id - The todo's unique identifier
     * @param {Prisma.TodoUpdateInput} data - Partial todo data to update
     * @param {string} [data.title] - Updated todo title
     * @param {boolean} [data.completed] - Updated completion status
     * @param {string} [data.startedTime] - Updated ISO date string for when the todo was started
     * @param {number} [data.duration] - Updated duration in minutes
     * @param {string[]} [data.tags] - Updated array of tag strings
     * @returns {Promise<Object>} Updated todo object with user information and calculated expiration
     * @throws {NotFoundError} If todo with the given ID doesn't exist
     * @throws {Error} If database operation fails
     *
     * @example
     * ```typescript
     * const updated = await todoService.update(1, {
     *   completed: true,
     *   duration: 120
     * });
     * ```
     */
    async update(id: number, data: Prisma.TodoUpdateInput) {
        try {
            const existingTodo = await this.findById(id); // Verify todo exists and get current values

            // Prepare update data with type assertion for new fields
            const updateData: any = { ...data };

            // If startedTime or duration is being updated, recalculate expiration
            if ((data as any).startedTime !== undefined || (data as any).duration !== undefined) {
                let startedTime: Date | null;
                if ((data as any).startedTime === undefined) {
                    startedTime = (existingTodo as any).startedTime;
                } else {
                    // Parse startedTime if it's a string, otherwise use as Date
                    startedTime =
                        typeof (data as any).startedTime === "string"
                            ? new Date((data as any).startedTime)
                            : ((data as any).startedTime as Date);
                }

                let duration: number | null;
                const durationValue = (data as any).duration;
                if (typeof durationValue === "number") {
                    duration = durationValue;
                } else {
                    duration = (existingTodo as any).duration;
                }

                updateData.isExpired = calculateExpiration(startedTime, duration);
            }

            return await this.prisma.todo.update({
                where: { id },
                data: updateData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true, // Include user details in response
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error; // Re-throw known errors without logging
            }
            logger.error(`Error updating todo with id ${id}`, error); // Log unexpected errors
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
            await this.findById(id); // Verify todo exists before deleting

            await this.prisma.todo.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error; // Re-throw known errors without logging
            }
            logger.error(`Error deleting todo with id ${id}`, error); // Log unexpected errors
            throw error;
        }
    }
}
