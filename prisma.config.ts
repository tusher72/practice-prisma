import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});

// "build:client": "esbuild src/client/index.tsx --bundle --sourcemap --outfile=public/client.js --platform=browser --format=iife",
