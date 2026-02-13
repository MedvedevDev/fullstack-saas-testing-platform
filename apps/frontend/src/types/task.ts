export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string; // UUID from Prisma [cite: 4]
  title: string;
  description: string | null;
  projectId: string;
  assigneeId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null; // DateTime? in Prisma
  createdAt: string; // @default(now())
  updatedAt: string; // @updatedAt
  project?: {
    name: string;
  };
}
