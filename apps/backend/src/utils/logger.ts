import { prisma } from "../lib/prisma";

type EntityType = "PROJECT" | "TASK" | "COMMENT" | "USER";

export const recordActivity = async (
  userId: string,
  action: string,
  entityType: EntityType,
  entityId: string
) => {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
    },
  });
};
