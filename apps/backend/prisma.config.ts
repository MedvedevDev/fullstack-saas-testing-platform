// apps/backend/prisma.config.ts
import { defineConfig, env } from "prisma/config";
import * as dotenv from "dotenv";
import path from "path";

// Load the environment variables from the .env file in the current directory
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // This tells Prisma to use tsx to run your TypeScript seed file
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Uses the DATABASE_URL from your .env file
    url: env("DATABASE_URL") || process.env.DATABASE_URL,
  },
});
