import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly totalProjectsBlock: Locator;
  readonly activeTasksBlock: Locator;
  readonly teamMembersBlock: Locator;

  constructor(page: Page) {
    this.page = page;
    this.totalProjectsBlock = page
      .getByTestId("total-projects")
      .getByRole("heading", { level: 3 });
    this.activeTasksBlock = page
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
    await expect(this.activeTasksBlock).toHaveText("0");
    await expect(this.teamMembersBlock).toBeHidden();
  }
}
