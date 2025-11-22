/** Type definitions for todo repository operations. */

/** User information interface (used in todo response). */
export interface UserInfo {
    id: number;
    name: string;
    email: string;
}

/** Todo response interface. */
export interface TodoResponse {
    id: number;
    title: string;
    completed: boolean;
    startedTime: Date | null;
    duration: number | null;
    isExpired: boolean;
    tags: string[];
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    user?: UserInfo | null;
}

/** Pagination metadata interface. */
export interface PaginationMetadata {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/** Paginated todos response interface. */
export interface PaginatedTodosResponse {
    data: TodoResponse[];
    pagination: PaginationMetadata;
}

/** Request interface for finding all todos with filters. */
export interface FindAllTodosRequest {
    userId?: number;
    completed?: boolean;
    tag?: string;
    page?: number;
    limit?: number;
}

/** Request interface for finding a todo by ID. */
export interface FindTodoByIdRequest {
    id: number;
}

/** Request interface for creating a todo. */
export interface CreateTodoRequest {
    title: string;
    completed?: boolean;
    userId?: number;
    startedTime?: Date;
    duration?: number;
    tags?: string[];
    isExpired?: boolean;
}

/** Request interface for updating a todo. */
export interface UpdateTodoRequest {
    id: number;
    title?: string;
    completed?: boolean;
    startedTime?: Date;
    duration?: number;
    tags?: string[];
    isExpired?: boolean;
}

/** Request interface for deleting a todo. */
export interface DeleteTodoRequest {
    id: number;
}

/** Request interface for counting todos. */
export interface CountTodosRequest {
    userId?: number;
    completed?: boolean;
    tag?: string;
}
