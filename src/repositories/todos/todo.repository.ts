import { PrismaClient, Prisma } from "@prisma/client";

import logger from "../../utils/logger.util";
import {
    CountTodosRequest,
    CreateTodoRequest,
    DeleteTodoRequest,
    FindAllTodosRequest,
    FindTodoByIdRequest,
    PaginatedTodosResponse,
    TodoResponse,
    UpdateTodoRequest,
} from "./todo.types";

/** Repository class for todo database operations. */
export class TodoRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findAll(request: FindAllTodosRequest = {}): Promise<PaginatedTodosResponse> {
        try {
            const page = request.page || 1;
            const limit = request.limit || 10;
            const skip = (page - 1) * limit;

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
                data: todos as TodoResponse[],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            logger.error("Error fetching todos from database", error);
            throw error;
        }
    }

    async findById(request: FindTodoByIdRequest): Promise<TodoResponse | null> {
        try {
            const todo = await this.prisma.todo.findUnique({
                where: { id: request.id },
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
            return todo as TodoResponse | null;
        } catch (error) {
            logger.error(`Error fetching todo with id ${request.id} from database`, error);
            throw error;
        }
    }

    async create(request: CreateTodoRequest): Promise<TodoResponse> {
        try {
            const createData: any = {
                title: request.title,
                completed: request.completed || false,
                startedTime: request.startedTime || null,
                duration: request.duration || null,
                tags: request.tags || [],
                isExpired: request.isExpired || false,
                ...(request.userId && {
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
                            email: true,
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
