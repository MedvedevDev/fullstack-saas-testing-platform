// apps/backend/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting seed...");

  // 1. Clean-up (Order matters because of Foreign Keys!)
  console.log("🧹 Cleaning old data...");
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // 2. Create Essential Roles
  console.log("🔐 Creating roles...");
  const adminRole = await prisma.role.create({ data: { name: "ADMIN" } });
  const managerRole = await prisma.role.create({ data: { name: "MANAGER" } });
  const viewerRole = await prisma.role.create({ data: { name: "VIEWER" } });
  const roles = [adminRole, managerRole, viewerRole];

  // 3. Create Users
  console.log("👥 Creating 50 users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const users = await Promise.all(
    Array.from({ length: 50 }).map(() =>
      prisma.user.create({
        data: {
          email: faker.internet.email().toLowerCase(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          passwordHash,
          // FIX: Randomly assign one role to each user
          roles: {
            connect: { id: roles[Math.floor(Math.random() * roles.length)].id },
          },
        },
      }),
    ),
  );

  // 4. Create Projects
  console.log("📁 Creating 200 projects...");
  const projects = await Promise.all(
    Array.from({ length: 200 }).map(() =>
      prisma.project.create({
        data: {
          name: faker.company.catchPhrase(),
          description: faker.lorem.sentence(),
          status: faker.helpers.arrayElement(["ACTIVE", "ARCHIVED"]),
          ownerId: users[Math.floor(Math.random() * users.length)].id,
        },
      }),
    ),
  );

  // 5. Create Tasks
  console.log("✅ Creating 800 tasks...");
  await Promise.all(
    Array.from({ length: 800 }).map(() =>
      prisma.task.create({
        data: {
          title: faker.hacker.phrase(),
          description: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(["TODO", "IN_PROGRESS", "DONE"]), // Now matches Enum
          priority: faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH"]), // Now matches Enum
          projectId: projects[Math.floor(Math.random() * projects.length)].id,
          assigneeId: users[Math.floor(Math.random() * users.length)].id,
        },
      }),
    ),
  );

  console.log("✨ Seed successful: Roles, Users, Projects, and Tasks created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
