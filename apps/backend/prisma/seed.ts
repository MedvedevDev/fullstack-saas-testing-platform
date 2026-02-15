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
  console.log("🌱 Starting Realistic Database Seed...");

  // 1. Cleanup
  // Deleting logs first to avoid foreign key constraints
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

  // -------------------------
  // 3. Create Users
  // -------------------------

  // A. One Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@flowdash.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      roles: { connect: { id: roleAdmin.id } },
    },
  });
  console.log(`Created Admin: ${admin.email}`);

  // B. Three Managers (Realistic Names)
  const managers = [];
  for (let i = 0; i < 3; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const manager = await prisma.user.create({
      data: {
        email: `manager${i + 1}@flowdash.com`,
        passwordHash,
        firstName,
        lastName,
        roles: { connect: { id: roleManager.id } },
      },
    });
    managers.push(manager);
  }
  console.log(`Created 3 Managers`);

  // C. 20 Viewers
  const viewers = [];
  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    // Keep one consistent viewer for testing
    const email =
      i === 0
        ? "viewer1@flowdash.com"
        : faker.internet.email({
            firstName,
            lastName,
            provider: "flowdash.com",
          });

    const viewer = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        roles: { connect: { id: roleViewer.id } },
      },
    });
    viewers.push(viewer);
  }
  console.log(`Created 20 Viewers`);

  // -------------------------
  // 4. Create Projects
  // -------------------------
  const creators = [admin, ...managers];
  const projects = [];

  // Generate 12 Realistic Projects
  for (let i = 0; i < 12; i++) {
    const owner = creators[Math.floor(Math.random() * creators.length)];
    const status = Math.random() > 0.8 ? "ARCHIVED" : "ACTIVE";

    const project = await prisma.project.create({
      data: {
        name: faker.commerce.productName() + " Launch",
        description: faker.company.catchPhrase(),
        status,
        ownerId: owner.id,
        createdAt: faker.date.past(),
      },
    });
    projects.push(project);
  }
  console.log(`Created 12 Projects`);

  // -------------------------
  // 5. Create Tasks
  // -------------------------
  const allUsers = [...managers, ...viewers];

  let taskCount = 0;
  for (const project of projects) {
    const tasksPerProject = faker.number.int({ min: 5, max: 10 });

    for (let j = 0; j < tasksPerProject; j++) {
      const assignee =
        Math.random() > 0.1
          ? allUsers[Math.floor(Math.random() * allUsers.length)]
          : null;

      const status = faker.helpers.arrayElement([
        "TODO",
        "IN_PROGRESS",
        "DONE",
      ]);
      const priority = faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH"]);

      const task = await prisma.task.create({
        data: {
          title: faker.hacker.verb() + " " + faker.hacker.noun(),
          description: faker.lorem.sentence(),
          status: status as any,
          priority: priority as any,
          projectId: project.id,
          assigneeId: assignee?.id,
          dueDate: faker.date.future(),
          createdAt: faker.date.past(),
        },
      });

      if (Math.random() > 0.5 && assignee) {
        await prisma.activityLog.create({
          data: {
            action: `TASK_${status}`,
            entityType: "TASK",
            entityId: task.id,
            userId: assignee.id,
            createdAt: faker.date.recent(),
          },
        });
      }
      taskCount++;
    }
  }

  console.log(`Created ${taskCount} Tasks with random statuses and assignees.`);
  console.log("✅ Seeding completed successfully.");
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
