import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// 1. Setup the connection pool manually for the Driver Adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

// 2. Pass the adapter to the constructor to satisfy Prisma 7 requirements
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Database Seed...");

  // 1. Clean the database (Order matters for foreign keys)
  await prisma.activityLog.deleteMany();
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

  // 3. Create Users
  // -> 2 Admins
  const admins = [];
  for (let i = 1; i <= 2; i++) {
    const user = await prisma.user.create({
      data: {
        email: `admin${i}@flowdash.com`,
        passwordHash,
        firstName: "Admin",
        lastName: `User ${i}`,
        roles: { connect: { id: roleAdmin.id } },
      },
    });
    admins.push(user);
    console.log(`Created Admin: ${user.email}`);
  }

  // -> 5 Managers
  const managers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `manager${i}@flowdash.com`,
        passwordHash,
        firstName: "Manager",
        lastName: `User ${i}`,
        roles: { connect: { id: roleManager.id } },
      },
    });
    managers.push(user);
    console.log(`Created Manager: ${user.email}`);
  }

  // -> 10 Viewers
  const viewers = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `viewer${i}@flowdash.com`,
        passwordHash,
        firstName: "Viewer",
        lastName: `User ${i}`,
        roles: { connect: { id: roleViewer.id } },
      },
    });
    viewers.push(user);
    console.log(`Created Viewer: ${user.email}`);
  }

  // 4. Create Projects (Owned ONLY by Admins/Managers)
  const creators = [...admins, ...managers];
  const projects = [];
  const projectNames = [
    "Website Redesign",
    "Mobile App Launch",
    "Q3 Marketing Audit",
    "Server Migration",
    "Client Onboarding",
  ];

  for (const name of projectNames) {
    const owner = creators[Math.floor(Math.random() * creators.length)];
    const project = await prisma.project.create({
      data: {
        name,
        description: `Strategic project owned by ${owner.firstName}.`,
        status: "ACTIVE",
        ownerId: owner.id,
      },
    });
    projects.push(project);
    console.log(`Created Project: ${name} (Owner: ${owner.email})`);
  }

  // 5. Create Tasks (Assign mostly to Viewers)
  const taskTitles = [
    "Fix Bug",
    "Write Docs",
    "Update UI",
    "Database Backup",
    "Team Meeting",
  ];

  for (const project of projects) {
    for (let i = 0; i < 3; i++) {
      const isViewerTask = Math.random() > 0.2;
      const assigneeList = isViewerTask ? viewers : managers;
      const assignee =
        assigneeList[Math.floor(Math.random() * assigneeList.length)];

      await prisma.task.create({
        data: {
          title: `${taskTitles[i]}`,
          status: "TODO",
          priority: "MEDIUM",
          projectId: project.id,
          assigneeId: assignee.id,
        },
      });
    }
  }

  console.log("✅ Seeding completed. Viewers configured correctly.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // Close the pool to allow the process to exit
    await pool.end();
  });
