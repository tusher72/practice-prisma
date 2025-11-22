import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { UserService } from "../services/user.service";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateRequest } from "../middleware/validateRequest";
import { createUserSchema, updateUserSchema, getUserSchema, deleteUserSchema } from "../validators/user.validator";
import { HttpStatusEnum } from "../enums/httpStatus";

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
        asyncHandler(async (_req: Request, res: Response) => {
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
        asyncHandler(async (req: Request, res: Response) => {
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
        asyncHandler(async (req: Request, res: Response) => {
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
        asyncHandler(async (req: Request, res: Response) => {
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
        asyncHandler(async (req: Request, res: Response) => {
            const id = req.params.id as unknown as number;
            await userService.delete(id);
            res.status(HttpStatusEnum.NO_CONTENT).end();
        }),
    );

    return router;
}
