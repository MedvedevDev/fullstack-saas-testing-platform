import { Page, Locator, expect } from "@playwright/test";

export class ProjectDetailsPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly tasksHeader: Locator;
  readonly createTaskButton: Locator;
  readonly tasksTable: Locator;

  constructor(page: Page) {
    this.page = page;
    // Header Elements
    this.backButton = page.getByRole("button", { name: /back to projects/i });
    // Task Section
    this.createTaskButton = page.getByRole("button", { name: /create task/i });
    this.tasksTable = page.getByRole("table");
    this.tasksHeader = page.getByRole("heading", { name: /project tasks/i });
  }

  /**
   * Verify Header Data
   */
  async verifyHeader(name: string, status: string) {
    const projectTitle = this.page.getByRole("heading", {
      name: name,
      exact: true,
    });
    await expect(projectTitle).toBeVisible();

    const statusBadge = this.page.locator("span").filter({ hasText: status });
    await expect(statusBadge).toBeVisible();
  }

  /**
   * Helper to find a specific Task Row
   */
  getTaskRow(taskName: string): Locator {
    return this.tasksTable.getByRole("row").filter({
      has: this.page.getByRole("cell", { name: taskName, exact: true }),
    });
  }

  /**
   * Verify Task is in the list with specific details
   */
  async verifyTaskInList(taskName: string, expectedPriority: string) {
    const row = this.getTaskRow(taskName);
    await expect(row).toBeVisible();

    await expect(
      row.getByRole("cell", { name: expectedPriority }),
    ).toBeVisible();
  }

  /**
   * Verify "No tasks yet" empty state
   */
  async verifyEmptyState() {
    await expect(
      this.tasksTable.getByRole("cell", { name: /no tasks yet/i }),
    ).toBeVisible();
  }

  /**
   * Delete a task safely
   */
  async deleteTask(taskName: string) {
    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    // Find the row for the task
    const row = this.getTaskRow(taskName);

    const deleteButton = row.getByRole("button", { name: "Delete Task" });
    await deleteButton.click({ force: true });
    await expect(row).toBeHidden();
  }

  /**
   * Click Edit button for a task
   */
  async openEditTask(taskName: string) {
    const row = this.getTaskRow(taskName);
    const editButton = row.getByRole("button", { name: "Edit Task" });
    await editButton.click({ force: true });
  }

  /**
   * Verify the exact number of tasks shown in the header
   */
  async verifyTaskCount(count: number) {
    await expect(this.tasksHeader).toHaveText(`Project Tasks (${count})`);
  }
}
