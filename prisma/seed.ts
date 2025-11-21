import { PrismaClient, Prisma } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

const userData: Prisma.UserCreateInput[] = [
    {
        name: "Alice",
        email: "alice@prisma.io",
        todos: {
            create: [
                {
                    title: "Read book",
                    completed: true,
                },
            ],
        },
    },
    {
        name: "Bob",
        email: "bob@prisma.io",
        todos: {
            create: [
                {
                    title: "Buy groceries",
                    completed: true,
                },
            ],
        },
    },
    {
        name: "Michael",
        email: "michael@prisma.io",
        todos: {
            create: [
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
    },
];

async function main() {
    console.log(`Start seeding ...`);

    // Clear existing data
    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();

    for (const data of userData) {
        const user = await prisma.user.create({ data });
        console.log(`Created user with id: ${user.id}`);
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
