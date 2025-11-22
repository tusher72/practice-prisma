import { PrismaClient } from "@prisma/client";

import logger from "../utils/logger.util";
import {
    CreateUserRequest,
    DeleteUserRequest,
    FindAllUsersRequest,
    FindUserByEmailRequest,
    FindUserByIdRequest,
    UpdateUserRequest,
    UserResponse,
} from "./users/user.types";

/**
 * Repository class for user database operations.
 *
 * Handles all database queries and commands for user-related operations.
 * This layer abstracts database access from business logic.
 *
 * @class UserRepository
 */
export class UserRepository {
    /**
     * Creates a new UserRepository instance.
     *
     * @constructor
     * @param {PrismaClient} prisma - Prisma Client instance for database operations
     */
    constructor(private readonly prisma: PrismaClient) {}

    /**
     * Retrieves all users from the database.
     *
     * @async
     * @function findAll
     * @param {FindAllUsersRequest} _request - Request parameters (currently unused)
     * @returns {Promise<UserResponse[]>} Array of user objects with their todos
     * @throws {Error} If database query fails
     */
    async findAll(_request: FindAllUsersRequest = {}): Promise<UserResponse[]> {
        try {
            const users = await this.prisma.user.findMany({
                orderBy: { id: "desc" }, // Return newest users first
                include: {
                    todos: {
                        orderBy: { createdAt: "desc" }, // Include todos ordered by newest first
                    },
                },
            });
            return users as UserResponse[];
        } catch (error) {
            logger.error("Error fetching users from database", error);
            throw error;
        }
    }

    /**
     * Retrieves a single user by ID.
     *
     * @async
     * @function findById
     * @param {FindUserByIdRequest} request - Request containing user ID
     * @returns {Promise<UserResponse | null>} User object with associated todos, or null if not found
     * @throws {Error} If database query fails
     */
    async findById(request: FindUserByIdRequest): Promise<UserResponse | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: request.id },
                include: {
                    todos: {
                        orderBy: { createdAt: "desc" },
                    },
                },
            });
            return user as UserResponse | null;
        } catch (error) {
            logger.error(`Error fetching user with id ${request.id} from database`, error);
            throw error;
        }
    }

    /**
     * Retrieves a single user by email.
     *
     * @async
     * @function findByEmail
     * @param {FindUserByEmailRequest} request - Request containing user email
     * @returns {Promise<UserResponse | null>} User object, or null if not found
     * @throws {Error} If database query fails
     */
    async findByEmail(request: FindUserByEmailRequest): Promise<UserResponse | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: request.email },
            });
            return user as UserResponse | null;
        } catch (error) {
            logger.error(`Error fetching user with email ${request.email} from database`, error);
            throw error;
        }
    }

    /**
     * Creates a new user in the database.
     *
     * @async
     * @function create
     * @param {CreateUserRequest} request - User data for creation
     * @returns {Promise<UserResponse>} The newly created user object with todos
     * @throws {Error} If database operation fails
     */
    async create(request: CreateUserRequest): Promise<UserResponse> {
        try {
            const defaultConfig = {
                tags: [],
                active: "active",
                theme: {
                    primaryColor: "#3b82f6",
                    secondary: "#8b5cf6",
                    themeMode: "light",
                    containerStyle: "bordered",
                    radius: "md",
                    font: "Inter",
                },
            };

            const userData: any = {
                name: request.name,
                email: request.email,
                config: request.config || defaultConfig,
            };

            const user = await this.prisma.user.create({
                data: userData,
                include: {
                    todos: true, // Include todos in response for immediate access
                },
            });
            return user as UserResponse;
        } catch (error) {
            logger.error("Error creating user in database", error);
            throw error;
        }
    }

    /**
     * Updates an existing user in the database.
     *
     * @async
     * @function update
     * @param {UpdateUserRequest} request - User data to update
     * @returns {Promise<UserResponse>} The updated user object with todos
     * @throws {Error} If database operation fails
     */
    async update(request: UpdateUserRequest): Promise<UserResponse> {
        try {
            const updateData: any = {};
            if (request.name !== undefined) updateData.name = request.name;
            if (request.email !== undefined) updateData.email = request.email;
            if (request.config !== undefined) updateData.config = request.config;

            const user = await this.prisma.user.update({
                where: { id: request.id },
                data: updateData,
                include: {
                    todos: {
                        orderBy: { createdAt: "desc" }, // Return todos ordered by newest first
                    },
                },
            });
            return user as UserResponse;
        } catch (error) {
            logger.error(`Error updating user with id ${request.id} in database`, error);
            throw error;
        }
    }

    /**
     * Deletes a user from the database.
     *
     * @async
     * @function delete
     * @param {DeleteUserRequest} request - Request containing user ID
     * @returns {Promise<void>} Resolves when user is deleted
     * @throws {Error} If database operation fails
     */
    async delete(request: DeleteUserRequest): Promise<void> {
        try {
            await this.prisma.user.delete({
                where: { id: request.id },
            });
        } catch (error) {
            logger.error(`Error deleting user with id ${request.id} from database`, error);
            throw error;
        }
    }
}
