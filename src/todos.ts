import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

type CreateTodoBody = Prisma.TodoCreateInput;
type UpdateTodoBody = Prisma.TodoUpdateInput;
const router = Router();

const createTodo = async (prisma: PrismaClient, data: CreateTodoBody) => {
    return prisma.todo.create({
        data: {
            title: data.title,
        },
    });
};

const updateTodo = async (prisma: PrismaClient, id: number, data: UpdateTodoBody) => {
    return prisma.todo.update({
        where: { id },
        data: {
            title: data.title,
            completed: data.completed,
        },
    });
};

export function createTodosRouter(prisma: PrismaClient) {
    router.get("/", async (_req: Request, res: Response) => {
        try {
            const todos = await prisma.todo.findMany({ orderBy: { id: "desc" } });
            res.json(todos);
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch todos" });
        }
    });

    router.post("/", async (req: Request<{}, {}, CreateTodoBody>, res: Response) => {
        try {
            const { title } = req.body;
            if (!title || !title.trim()) {
                res.status(400).json({ error: "title is required" });
                return;
            }
            const todo = await createTodo(prisma, { title: title.trim() });
            res.status(201).json(todo);
        } catch (err) {
            res.status(500).json({ error: "Failed to create todo" });
        }
    });

    router.patch("/:id", async (req: Request<{ id: string }, {}, UpdateTodoBody>, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            res.status(400).json({ error: "invalid id" });
            return;
        }
        try {
            const { title, completed } = req.body;
            const data: Prisma.TodoUpdateInput = {};
            if (typeof title === "string") data.title = title.trim();
            if (typeof completed === "boolean") data.completed = completed;
            if (Object.keys(data).length === 0) {
                res.status(400).json({ error: "no fields to update" });
                return;
            }
            const updated = await updateTodo(prisma, id, data);
            res.json(updated);
        } catch (err) {
            res.status(404).json({ error: "Todo not found" });
        }
    });

    router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            res.status(400).json({ error: "invalid id" });
            return;
        }
        try {
            await prisma.todo.delete({ where: { id } });
            res.status(204).end();
        } catch (err) {
            res.status(404).json({ error: "Todo not found" });
        }
    });

    return router;
}
