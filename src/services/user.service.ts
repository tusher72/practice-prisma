import { ConflictError, NotFoundError } from "../types/errors.types";
import { UserRepository } from "../repositories/users/user.repository";
import {
    CreateUserRequest,
    FindUserByIdRequest,
    UpdateUserRequest,
    DeleteUserRequest,
    FindUserByEmailRequest,
} from "../repositories/users/user.types";

/** Service class for user-related business logic. */
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async findAll() {
        return await this.userRepository.findAll();
    }

    async findById(id: number) {
        const user = await this.userRepository.findById({ id });

        if (!user) {
            throw new NotFoundError("User", id);
        }

        return user;
    }

    async create(data: { name: string; email: string; config?: object }) {
        const existingUser = await this.userRepository.findByEmail({ email: data.email });

        if (existingUser) {
            throw new ConflictError("User with this email already exists");
        }

        const request: CreateUserRequest = {
            name: data.name,
            email: data.email,
            config: data.config as CreateUserRequest["config"],
        };

        return await this.userRepository.create(request);
    }

    async update(id: number, data: { name?: string; email?: string; config?: object }) {
        await this.findById(id);

        if (data.email) {
            const existingUser = await this.userRepository.findByEmail({ email: data.email });

            if (existingUser && existingUser.id !== id) {
                throw new ConflictError("User with this email already exists");
            }
        }

        const request: UpdateUserRequest = {
            id,
            name: data.name,
            email: data.email,
            config: data.config as UpdateUserRequest["config"],
        };

        return await this.userRepository.update(request);
    }

    async delete(id: number) {
        await this.findById(id);

        const request: DeleteUserRequest = { id };
        await this.userRepository.delete(request);
    }
}
