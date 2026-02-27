import { Page, Locator, expect } from "@playwright/test";

export interface DashboardStats {
  totalProjects: number;
  totalUsers: number;
  completionRate: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
}

export class DashboardPage {
  readonly page: Page;
  readonly totalProjectsBlock: Locator;
  readonly totalTasksBlock: Locator;
  readonly teamMembersBlock: Locator;

  constructor(page: Page) {
    this.page = page;
    this.totalProjectsBlock = page
      .getByTestId("total-projects")
      .getByRole("heading", { level: 3 });
    this.totalTasksBlock = page
      .getByTestId("active-tasks")
      .getByRole("heading", { level: 3 });
    this.teamMembersBlock = page
      .getByTestId("team-members")
      .getByRole("heading", { level: 3 });
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async verifyEmptyState() {
    await expect(this.totalProjectsBlock).toHaveText("0");
    await expect(this.totalTasksBlock).toHaveText("0");
    await expect(this.teamMembersBlock).toBeHidden();
  }

  async verifyStats(stats: DashboardStats) {
    const totalCount =
      stats.tasksByStatus.TODO +
      stats.tasksByStatus.IN_PROGRESS +
      stats.tasksByStatus.DONE;

    await expect(this.totalProjectsBlock).toHaveText(
      String(stats.totalProjects),
    );
    await expect(this.totalTasksBlock).toHaveText(String(totalCount));
  }
}
