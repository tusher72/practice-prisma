import { PrismaClient } from "@prisma/client";

import logger from "../../utils/logger.util";
import {
    CreateUserRequest,
    DeleteUserRequest,
    FindAllUsersRequest,
    FindUserByEmailRequest,
    FindUserByIdRequest,
    UpdateUserRequest,
    UserResponse,
} from "./user.types";

/** Repository class for user database operations. */
export class UserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findAll(_request: FindAllUsersRequest = {}): Promise<UserResponse[]> {
        try {
            const users = await this.prisma.user.findMany({
                orderBy: { id: "desc" },
                include: {
                    todos: {
                        orderBy: { createdAt: "desc" },
                    },
                },
            });
            return users as UserResponse[];
        } catch (error) {
            logger.error("Error fetching users from database", error);
            throw error;
        }
    }

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
                    todos: true,
                },
            });
            return user as UserResponse;
        } catch (error) {
            logger.error("Error creating user in database", error);
            throw error;
        }
    }

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
                        orderBy: { createdAt: "desc" },
                    },
                },
            });
            return user as UserResponse;
        } catch (error) {
            logger.error(`Error updating user with id ${request.id} in database`, error);
            throw error;
        }
    }

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
