// apps/backend/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import path from "path";

// 1. Load env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// 2. Setup the connection pool and adapter (REQUIRED for Prisma 7)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// 3. Pass the adapter to the client
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Clean-up: Deleting old data...");
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding: Creating 50 users...");
  const users = await Promise.all(
    Array.from({ length: 50 }).map(() =>
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          passwordHash: "hashed_password_123",
        },
      }),
    ),
  );

  console.log("Seeding: Creating 200 projects...");
  const projects = await Promise.all(
    Array.from({ length: 200 }).map(() =>
      prisma.project.create({
        data: {
          name: faker.company.catchPhrase(),
          description: faker.lorem.sentence(),
          ownerId: users[Math.floor(Math.random() * users.length)].id,
        },
      }),
    ),
  );

  console.log("Seeding: Creating 800 tasks...");
  await Promise.all(
    Array.from({ length: 800 }).map(() =>
      prisma.task.create({
        data: {
          title: faker.hacker.phrase(),
          status: faker.helpers.arrayElement(["TODO", "IN_PROGRESS", "DONE"]),
          priority: faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH"]),
          projectId: projects[Math.floor(Math.random() * projects.length)].id,
        },
      }),
    ),
  );

  console.log("✅ Seed successful: 1,000+ records created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Don't forget to close the pool!
  });
