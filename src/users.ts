import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

type CreateUserBody = Prisma.UserCreateInput;
type UpdateUserBody = Prisma.UserUpdateInput;

export const createUser = async (prisma: PrismaClient, data: CreateUserBody) => {
    return prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
        },
    });
};

export const updateUser = async (prisma: PrismaClient, id: number, data: UpdateUserBody) => {
    return prisma.user.update({
        where: { id },
        data: {
            name: data.name,
            email: data.email,
        },
    });
};

export function createUsersRouter(prisma: PrismaClient) {
    const router = Router();

    router.get("/", async (_req: Request, res: Response) => {
        try {
            const users = await prisma.user.findMany({ orderBy: { id: "desc" } });
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch users" });
        }
    });

    router.post("/", async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
        try {
            const { name } = req.body;
            if (!name || !name.trim()) {
                res.status(400).json({ error: "name is required" });
                return;
            }
            const { email } = req.body;
            if (!email || !email.trim()) {
                res.status(400).json({ error: "email is required" });
                return;
            }
            const user = await createUser(prisma, {
                name: name.trim(),
                email: email.trim(),
            });
            res.status(201).json(user);
        } catch (err) {
            res.status(500).json({ error: "Failed to create user" });
        }
    });

    router.patch("/:id", async (req: Request<{ id: string }, {}, UpdateUserBody>, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            res.status(400).json({ error: "invalid id" });
            return;
        }
        try {
            const { name, email } = req.body;
            const data: Prisma.UserUpdateInput = {};
            if (typeof name === "string") data.name = name.trim();
            if (typeof email === "string") data.email = email.trim();
            if (Object.keys(data).length === 0) {
                res.status(400).json({ error: "no fields to update" });
                return;
            }
            const updated = await updateUser(prisma, id, data);
            res.json(updated);
        } catch (err) {
            res.status(404).json({ error: "User not found" });
        }
    });

    router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            res.status(400).json({ error: "invalid id" });
            return;
        }
        try {
            await prisma.user.delete({ where: { id } });
            res.status(204).end();
        } catch (err) {
            res.status(404).json({ error: "User not found" });
        }
    });

    return router;
}
