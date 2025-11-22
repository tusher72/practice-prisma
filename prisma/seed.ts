import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

/**
 * Database connection string from environment variables.
 *
 * @constant {string}
 */
const connectionString = process.env.DATABASE_URL!;

/**
 * PostgreSQL connection pool for the Prisma adapter.
 *
 * @constant {Pool}
 */
const pool = new Pool({ connectionString });

/**
 * Prisma PostgreSQL adapter instance.
 *
 * @constant {PrismaPg}
 */
const adapter = new PrismaPg(pool);

/**
 * Prisma Client instance configured with PostgreSQL adapter.
 *
 * @constant {PrismaClient}
 */
const prisma = new PrismaClient({ adapter });

/**
 * Sample user data for seeding the database.
 *
 * Contains users with their associated todos. The structure separates
 * user information from todos to allow proper foreign key relationships.
 *
 * @constant {ReadonlyArray}
 */
const userData = [
    {
        name: "Alice",
        email: "alice@prisma.io",
        todos: [
            {
                title: "Read book",
                completed: true,
            },
        ],
    },
    {
        name: "Bob",
        email: "bob@prisma.io",
        todos: [
            {
                title: "Buy groceries",
                completed: true,
            },
        ],
    },
    {
        name: "Michael",
        email: "michael@prisma.io",
        todos: [
            {
                title: "Finish project",
                completed: true,
            },
            {
                title: "Go for a run",
                completed: false,
            },
        ],
    },
] as const;

/**
 * Main seeding function.
 *
 * Performs the following operations:
 * 1. Clears existing todos and users (in that order due to foreign key constraints)
 * 2. Creates users from seed data
 * 3. Creates todos associated with each user
 *
 * @async
 * @function main
 * @returns {Promise<void>}
 * @throws {Error} If database operations fail
 */
async function main() {
    console.log(`Start seeding ...`);

    // Clear existing data
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();

    for (const userInfo of userData) {
        const { todos, ...userDataInput } = userInfo;
        const user = await prisma.user.create({
            data: userDataInput,
        });
        console.log(`Created user with id: ${user.id}`);

        if (todos.length > 0) {
            await prisma.todo.createMany({
                data: todos.map((todo) => ({
                    ...todo,
                    userId: user.id,
                })),
            });
        }
    }
    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
