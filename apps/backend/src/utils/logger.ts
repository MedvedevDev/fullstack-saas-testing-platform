import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const recordActivity = async (userId: string, action: string) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
      },
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
  }
};
