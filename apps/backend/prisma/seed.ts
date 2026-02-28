import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import path from "path";

// 1. Load environment variables manually
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// 2. Setup the connection pool
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Tiny Seed...");

  // 1. Cleanup
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.tag.deleteMany();

  // 2. Create Roles
  const roleAdmin = await prisma.role.create({ data: { name: "ADMIN" } });
  const roleManager = await prisma.role.create({ data: { name: "MANAGER" } });
  const roleViewer = await prisma.role.create({ data: { name: "VIEWER" } });

  const passwordHash = await bcrypt.hash("password123", 10);

  // 3. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@flowdash.com",
      passwordHash,
      firstName: "ADMIN",
      lastName: "User",
      roles: { connect: { id: roleAdmin.id } },
    },
  });

  // 4. Create 2 Managers
  const manager1 = await prisma.user.create({
    data: {
      email: "manager1@flowdash.com",
      passwordHash,
      firstName: "Manager",
      lastName: "1",
      roles: { connect: { id: roleManager.id } },
    },
  });
  const manager2 = await prisma.user.create({
    data: {
      email: "manager2@flowdash.com",
      passwordHash,
      firstName: "Manager",
      lastName: "2",
      roles: { connect: { id: roleManager.id } },
    },
  });

  // 5. Create 4 Viewers
  const viewers = [];
  for (let i = 1; i <= 4; i++) {
    const viewer = await prisma.user.create({
      data: {
        email: `viewer${i}@flowdash.com`,
        passwordHash,
        firstName: "Viewer",
        lastName: `${i}`,
        roles: { connect: { id: roleViewer.id } },
      },
    });
    viewers.push(viewer);
  }

  // 6. Create 1 Project
  const project = await prisma.project.create({
    data: {
      name: "Main Project",
      description: "Our single test project",
      status: "ACTIVE",
      ownerId: admin.id,
    },
  });

  // 7. Create Tasks assigned to users
  await prisma.task.create({
    data: {
      title: "Setup Dashboard",
      projectId: project.id,
      assigneeId: manager1.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
    },
  });
  await prisma.task.create({
    data: {
      title: "Fix Login Bug",
      projectId: project.id,
      assigneeId: manager2.id,
      status: "TODO",
      priority: "MEDIUM",
    },
  });
  await prisma.task.create({
    data: {
      title: "Review Docs",
      projectId: project.id,
      assigneeId: viewers[0].id,
      status: "DONE",
      priority: "LOW",
    },
  });

  console.log("✅ Tiny Seeding completed successfully.");
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
