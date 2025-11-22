import { PrismaClient, Prisma } from "@prisma/client";

import logger from "../utils/logger.util";
import {
    CountTodosRequest,
    CreateTodoRequest,
    DeleteTodoRequest,
    FindAllTodosRequest,
    FindTodoByIdRequest,
    PaginatedTodosResponse,
    TodoResponse,
    UpdateTodoRequest,
} from "./todos/todo.types";

/**
 * Repository class for todo database operations.
 *
 * Handles all database queries and commands for todo-related operations.
 * This layer abstracts database access from business logic.
 *
 * @class TodoRepository
 */
export class TodoRepository {
    /**
     * Creates a new TodoRepository instance.
     *
     * @constructor
     * @param {PrismaClient} prisma - Prisma Client instance for database operations
     */
    constructor(private readonly prisma: PrismaClient) {}

    /**
     * Retrieves todos from the database with optional filtering and pagination.
     *
     * @async
     * @function findAll
     * @param {FindAllTodosRequest} request - Request containing filters and pagination options
     * @returns {Promise<PaginatedTodosResponse>} Object containing todos array and pagination metadata
     * @throws {Error} If database query fails
     */
    async findAll(request: FindAllTodosRequest = {}): Promise<PaginatedTodosResponse> {
        try {
            const page = request.page || 1; // Default to first page
            const limit = request.limit || 10; // Default to 10 items per page
            const skip = (page - 1) * limit; // Calculate offset for pagination

            const where: Prisma.TodoWhereInput = {};
            if (request.userId !== undefined) {
                where.userId = request.userId; // Add user filter if provided
            }
            if (request.completed !== undefined) {
                where.completed = request.completed; // Add completion status filter if provided
            }
            if (request.tag !== undefined) {
                (where as any).tags = {
                    has: request.tag, // Filter todos that contain the specified tag
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

            return {
                data: todos as TodoResponse[],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit), // Calculate total pages for pagination UI
                },
            };
        } catch (error) {
            logger.error("Error fetching todos from database", error);
            throw error;
        }
    }

    /**
     * Retrieves a single todo by ID.
     *
     * @async
     * @function findById
     * @param {FindTodoByIdRequest} request - Request containing todo ID
     * @returns {Promise<TodoResponse | null>} Todo object with associated user information, or null if not found
     * @throws {Error} If database query fails
     */
    async findById(request: FindTodoByIdRequest): Promise<TodoResponse | null> {
        try {
            const todo = await this.prisma.todo.findUnique({
                where: { id: request.id },
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
            return todo as TodoResponse | null;
        } catch (error) {
            logger.error(`Error fetching todo with id ${request.id} from database`, error);
            throw error;
        }
    }

    /**
     * Creates a new todo in the database.
     *
     * @async
     * @function create
     * @param {CreateTodoRequest} request - Todo data for creation
     * @returns {Promise<TodoResponse>} The newly created todo object with user information
     * @throws {Error} If database operation fails
     */
    async create(request: CreateTodoRequest): Promise<TodoResponse> {
        try {
            const createData: any = {
                title: request.title,
                completed: request.completed || false, // Default to false if not provided
                startedTime: request.startedTime || null,
                duration: request.duration || null,
                tags: request.tags || [],
                isExpired: request.isExpired || false,
                ...(request.userId && {
                    // Conditionally connect to user if userId is provided
                    user: {
                        connect: { id: request.userId },
                    },
                }),
            };

            const todo = await this.prisma.todo.create({
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
            return todo as TodoResponse;
        } catch (error) {
            logger.error("Error creating todo in database", error);
            throw error;
        }
    }

    /**
     * Updates an existing todo in the database.
     *
     * @async
     * @function update
     * @param {UpdateTodoRequest} request - Todo data to update
     * @returns {Promise<TodoResponse>} The updated todo object with user information
     * @throws {Error} If database operation fails
     */
    async update(request: UpdateTodoRequest): Promise<TodoResponse> {
        try {
            const updateData: any = {};
            if (request.title !== undefined) updateData.title = request.title;
            if (request.completed !== undefined) updateData.completed = request.completed;
            if (request.startedTime !== undefined) updateData.startedTime = request.startedTime;
            if (request.duration !== undefined) updateData.duration = request.duration;
            if (request.tags !== undefined) updateData.tags = request.tags;
            if (request.isExpired !== undefined) updateData.isExpired = request.isExpired;

            const todo = await this.prisma.todo.update({
                where: { id: request.id },
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
            return todo as TodoResponse;
        } catch (error) {
            logger.error(`Error updating todo with id ${request.id} in database`, error);
            throw error;
        }
    }

    /**
     * Deletes a todo from the database.
     *
     * @async
     * @function delete
     * @param {DeleteTodoRequest} request - Request containing todo ID
     * @returns {Promise<void>} Resolves when todo is deleted
     * @throws {Error} If database operation fails
     */
    async delete(request: DeleteTodoRequest): Promise<void> {
        try {
            await this.prisma.todo.delete({
                where: { id: request.id },
            });
        } catch (error) {
            logger.error(`Error deleting todo with id ${request.id} from database`, error);
            throw error;
        }
    }

    /**
     * Counts todos matching the given filters.
     *
     * @async
     * @function count
     * @param {CountTodosRequest} request - Request containing filters
     * @returns {Promise<number>} Total count of matching todos
     * @throws {Error} If database query fails
     */
    async count(request: CountTodosRequest = {}): Promise<number> {
        try {
            const where: Prisma.TodoWhereInput = {};
            if (request.userId !== undefined) {
                where.userId = request.userId;
            }
            if (request.completed !== undefined) {
                where.completed = request.completed;
            }
            if (request.tag !== undefined) {
                (where as any).tags = {
                    has: request.tag,
                };
            }

            return await this.prisma.todo.count({ where });
        } catch (error) {
            logger.error("Error counting todos in database", error);
            throw error;
        }
    }
}
