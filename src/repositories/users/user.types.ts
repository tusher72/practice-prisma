/** Type definitions for user repository operations. */

import type { TodoResponse } from "../todos/todo.types";

/** User theme configuration interface. */
export interface UserTheme {
    primaryColor: string;
    secondary: string;
    themeMode: string;
    containerStyle: string;
    radius: string;
    font: string;
}

/** User configuration interface. */
export interface UserConfig {
    tags: string[];
    active: string;
    theme: UserTheme;
}

/** User response interface. */
export interface UserResponse {
    id: number;
    email: string;
    name: string;
    config: UserConfig | null;
    todos?: TodoResponse[];
    createdAt?: Date;
    updatedAt?: Date;
}

/** Re-export TodoResponse for convenience. */
export type { TodoResponse } from "../todos/todo.types";

/** Request interface for finding all users. */
export interface FindAllUsersRequest {
    // No additional filters currently, but can be extended
}

/** Request interface for finding a user by ID. */
export interface FindUserByIdRequest {
    id: number;
}

/** Request interface for creating a user. */
export interface CreateUserRequest {
    name: string;
    email: string;
    config?: UserConfig;
}

/** Request interface for updating a user. */
export interface UpdateUserRequest {
    id: number;
    name?: string;
    email?: string;
    config?: UserConfig;
}

/** Request interface for deleting a user. */
export interface DeleteUserRequest {
    id: number;
}

/** Request interface for finding a user by email. */
export interface FindUserByEmailRequest {
    email: string;
}
