import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createTodosRouter } from "./todos";
import { createUsersRouter } from "./users";

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || "localhost"}:${process.env.FORWARD_DB_PORT || 5432}/${process.env.DB_DATABASE}?schema=public`;

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get("/ping", (_req: Request, res: Response) => {
    res.json({ status: "pong" });
});

app.use("/users", createUsersRouter(prisma as any));
app.use("/todos", createTodosRouter(prisma as any));

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
