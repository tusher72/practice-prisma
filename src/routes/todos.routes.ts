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
                userId: typeof req.query.userId === "number" ? req.query.userId : undefined, // Filter by user if provided
                completed: typeof req.query.completed === "boolean" ? req.query.completed : undefined, // Filter by completion status if provided
                tag: typeof req.query.tag === "string" ? req.query.tag : undefined, // Filter by tag if provided
                isExpired: typeof req.query.isExpired === "boolean" ? req.query.isExpired : undefined, // Filter by expiration status if provided
                page:
                    typeof req.query.page === "number"
                        ? req.query.page
                        : Number.parseInt(String(req.query.page || "1"), 10), // Default to page 1 if not provided
                limit:
                    typeof req.query.limit === "number"
                        ? req.query.limit
                        : Number.parseInt(String(req.query.limit || "10"), 10), // Default to 10 items per page
            };
            const result = await todoService.findAll(filters);
            res.json({
                success: true,
                ...result, // Spread pagination metadata and data array
            });
        }),
    );

    router.get(
        "/:id",
        validateRequest(getTodoSchema),
        createAsyncHandler(async (req: Request, res: Response) => {
            // GET /todos/:id - Retrieve a single todo by ID
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
            // POST /todos - Create a new todo
            const todo = await todoService.create({
                title: req.body.title,
                userId: req.body.userId, // Optional user association
                startedTime: req.body.startedTime, // Optional start time
                duration: req.body.duration, // Optional duration in minutes
                tags: req.body.tags, // Optional tags array
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
            // PATCH /todos/:id - Update an existing todo
            const id = req.params.id as unknown as number;
            const updateData: {
                title?: string;
                completed?: boolean;
                startedTime?: Date | string;
                duration?: number;
                tags?: string[];
            } = {};

            if (req.body.title !== undefined) updateData.title = req.body.title;
            if (req.body.completed !== undefined) updateData.completed = req.body.completed;
            if (req.body.startedTime !== undefined) {
                updateData.startedTime =
                    typeof req.body.startedTime === "string" ? new Date(req.body.startedTime) : req.body.startedTime;
            }
            if (req.body.duration !== undefined) updateData.duration = req.body.duration;
            if (req.body.tags !== undefined) updateData.tags = req.body.tags;

            const todo = await todoService.update(id, updateData);
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
            // DELETE /todos/:id - Delete a todo
            const id = req.params.id as unknown as number;
            await todoService.delete(id);
            res.status(HttpStatusEnum.NO_CONTENT).end(); // Return 204 No Content for successful deletion
        }),
    );

    return router;
}
