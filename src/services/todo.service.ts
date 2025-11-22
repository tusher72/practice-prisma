import { NotFoundError } from "../types/errors.types";
import { TodoRepository } from "../repositories/todos/todo.repository";
import { UserRepository } from "../repositories/users/user.repository";
import { calculateExpiration } from "../utils/todo.util";
import {
    CreateTodoRequest,
    UpdateTodoRequest,
    DeleteTodoRequest,
    FindAllTodosRequest,
} from "../repositories/todos/todo.types";

/** Service class for todo-related business logic. */
export class TodoService {
    constructor(
        private readonly todoRepository: TodoRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async findAll(filters?: {
        userId?: number;
        completed?: boolean;
        tag?: string;
        isExpired?: boolean;
        page?: number;
        limit?: number;
    }) {
        const repositoryRequest: FindAllTodosRequest = {
            userId: filters?.userId,
            completed: filters?.completed,
            tag: filters?.tag,
            page: filters?.page,
            limit: filters?.limit,
        };

        const result = await this.todoRepository.findAll(repositoryRequest);

        const processedTodos = result.data.map((todo) => {
            const isExpired = calculateExpiration(todo.startedTime, todo.duration);
            return {
                ...todo,
                isExpired,
            };
        });

        let filteredTodos = processedTodos;
        if (filters?.isExpired !== undefined) {
            filteredTodos = processedTodos.filter((todo) => todo.isExpired === filters.isExpired);
        }

        const todosToUpdate = processedTodos.filter((todo) => {
            const currentIsExpired = calculateExpiration(todo.startedTime, todo.duration);
            const existingIsExpired = todo.isExpired || false;
            return currentIsExpired !== existingIsExpired && todo.startedTime && todo.duration;
        });

        if (todosToUpdate.length > 0) {
            await Promise.all(
                todosToUpdate.map((todo) =>
                    this.todoRepository.update({
                        id: todo.id,
                        isExpired: todo.isExpired,
                    }),
                ),
            );
        }

        return {
            data: filteredTodos,
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: filters?.isExpired === undefined ? result.pagination.total : filteredTodos.length,
                totalPages: Math.ceil(
                    (filters?.isExpired === undefined ? result.pagination.total : filteredTodos.length) /
                        result.pagination.limit,
                ),
            },
        };
    }

    async findById(id: number) {
        const todo = await this.todoRepository.findById({ id });

        if (!todo) {
            throw new NotFoundError("Todo", id);
        }

        const isExpired = calculateExpiration(todo.startedTime, todo.duration);
        const existingIsExpired = todo.isExpired || false;

        if (isExpired !== existingIsExpired && todo.startedTime && todo.duration) {
            await this.todoRepository.update({
                id: todo.id,
                isExpired,
            });
        }

        return {
            ...todo,
            isExpired,
        };
    }

    async create(data: {
        title: string;
        completed?: boolean;
        userId?: number;
        startedTime?: string;
        duration?: number;
        tags?: string[];
    }) {
        if (data.userId) {
            const user = await this.userRepository.findById({ id: data.userId });

            if (!user) {
                throw new NotFoundError("User", data.userId);
            }
        }

        const startedTime = data.startedTime ? new Date(data.startedTime) : undefined;
        const isExpired = calculateExpiration(startedTime || null, data.duration || null);

        const request: CreateTodoRequest = {
            title: data.title,
            completed: data.completed,
            userId: data.userId,
            startedTime,
            duration: data.duration,
            tags: data.tags,
            isExpired,
        };

        return await this.todoRepository.create(request);
    }

    async update(
        id: number,
        data: { title?: string; completed?: boolean; startedTime?: Date | string; duration?: number; tags?: string[] },
    ) {
        const existingTodo = await this.findById(id);

        const updateRequest: UpdateTodoRequest = {
            id,
            title: data.title,
            completed: data.completed,
            tags: data.tags,
        };

        if (data.startedTime !== undefined) {
            updateRequest.startedTime =
                typeof data.startedTime === "string" ? new Date(data.startedTime) : data.startedTime;
        }

        if (data.duration !== undefined) {
            updateRequest.duration = data.duration;
        }

        if (data.startedTime !== undefined || data.duration !== undefined) {
            const startedTime =
                updateRequest.startedTime !== undefined ? updateRequest.startedTime : existingTodo.startedTime;
            const duration = updateRequest.duration !== undefined ? updateRequest.duration : existingTodo.duration;

            updateRequest.isExpired = calculateExpiration(startedTime, duration);
        }

        return await this.todoRepository.update(updateRequest);
    }

    async delete(id: number) {
        await this.findById(id);

        const request: DeleteTodoRequest = { id };
        await this.todoRepository.delete(request);
    }
}
