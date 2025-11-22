import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { HttpStatusEnum } from "../enums/http-status.enum";
import { createAsyncHandler } from "../middleware/async-handler.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import { UserService } from "../services/user.service";
import { createUserSchema, updateUserSchema, getUserSchema, deleteUserSchema } from "../validators/user.validator";

/**
 * Creates and configures the users router.
 *
 * Sets up all user-related routes with validation and error handling.
 *
 * @function createUsersRouter
 * @param {PrismaClient} prisma - Prisma Client instance for database operations
 * @returns {Router} Configured Express router for user routes
 *
 * @example
 * ```typescript
 * const usersRouter = createUsersRouter(prisma);
 * app.use("/users", usersRouter);
 * ```
 */
export function createUsersRouter(prisma: PrismaClient): Router {
    const router = Router();
    const userService = new UserService(prisma);

    router.get(
        "/",
        createAsyncHandler(async (_req: Request, res: Response) => {
            const users = await userService.findAll();
            res.json({
                success: true,
                data: users,
            });
        }),
    );

    router.get(
        "/:id",
        validateRequest(getUserSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            const id = req.params.id as unknown as number;
            const user = await userService.findById(id);
            res.json({
                success: true,
                data: user,
            });
        }),
    );

    router.post(
        "/",
        validateRequest(createUserSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            const user = await userService.create(req.body);
            res.status(HttpStatusEnum.CREATED).json({
                success: true,
                data: user,
            });
        }),
    );

    router.patch(
        "/:id",
        validateRequest(updateUserSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            const id = req.params.id as unknown as number;
            const user = await userService.update(id, req.body);
            res.json({
                success: true,
                data: user,
            });
        }),
    );

    router.delete(
        "/:id",
        validateRequest(deleteUserSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            const id = req.params.id as unknown as number;
            await userService.delete(id);
            res.status(HttpStatusEnum.NO_CONTENT).end();
        }),
    );

    return router;
}
