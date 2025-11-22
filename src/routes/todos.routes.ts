import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { HttpStatusEnum } from "../enums/http-status.enum";
import { createAsyncHandler } from "../middleware/async-handler.middleware";
import { validateRequest } from "../middleware/validate-request.middleware";
import { TodoService } from "../services/todo.service";
import {
    createTodoSchema,
    updateTodoSchema,
    getTodoSchema,
    deleteTodoSchema,
    getTodosSchema,
} from "../validators/todo.validator";

/**
 * Creates and configures the todos router.
 *
 * Sets up all todo-related routes with validation, filtering, pagination,
 * and error handling.
 *
 * @function createTodosRouter
 * @param {PrismaClient} prisma - Prisma Client instance for database operations
 * @returns {Router} Configured Express router for todo routes
 *
 * @example
 * ```typescript
 * const todosRouter = createTodosRouter(prisma);
 * app.use("/todos", todosRouter);
 * ```
 */
export function createTodosRouter(prisma: PrismaClient): Router {
    const router = Router();
    const todoService = new TodoService(prisma);

    router.get(
        "/",
        validateRequest(getTodosSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            // Query params are validated and transformed by the validator middleware
            const filters = {
                userId: typeof req.query.userId === "number" ? req.query.userId : undefined,
                completed: typeof req.query.completed === "boolean" ? req.query.completed : undefined,
                page:
                    typeof req.query.page === "number"
                        ? req.query.page
                        : Number.parseInt(String(req.query.page || "1"), 10),
                limit:
                    typeof req.query.limit === "number"
                        ? req.query.limit
                        : Number.parseInt(String(req.query.limit || "10"), 10),
            };
            const result = await todoService.findAll(filters);
            res.json({
                success: true,
                ...result,
            });
        }),
    );

    router.get(
        "/:id",
        validateRequest(getTodoSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            const id = req.params.id as unknown as number;
            const todo = await todoService.findById(id);
            res.json({
                success: true,
                data: todo,
            });
        }),
    );

    router.post(
        "/",
        validateRequest(createTodoSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            const todo = await todoService.create({
                title: req.body.title,
                userId: req.body.userId,
            });
            res.status(HttpStatusEnum.CREATED).json({
                success: true,
                data: todo,
            });
        }),
    );

    router.patch(
        "/:id",
        validateRequest(updateTodoSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            const id = req.params.id as unknown as number;
            const todo = await todoService.update(id, req.body);
            res.json({
                success: true,
                data: todo,
            });
        }),
    );

    router.delete(
        "/:id",
        validateRequest(deleteTodoSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            const id = req.params.id as unknown as number;
            await todoService.delete(id);
            res.status(HttpStatusEnum.NO_CONTENT).end();
        }),
    );

    return router;
}
