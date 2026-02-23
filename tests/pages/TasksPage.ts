import { Page, Locator, expect } from "@playwright/test";

export class TasksPage {
  readonly page: Page;

  readonly searchInput: Locator;
  readonly statusDropdown: Locator;
  readonly priorityDropdown: Locator;
  readonly tasksTableBody: Locator;
  readonly createTaskButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole("textbox", { name: /search tasks/i });
    this.statusDropdown = page.getByLabel(/filter by status/i);
    this.priorityDropdown = page.getByLabel(/filter by priority/i);
    this.tasksTableBody = page.locator("tbody");
    this.createTaskButton = page.getByRole("button", { name: /create task/i });
  }

  async goto() {
    await this.page.goto("/tasks");
    await expect(this.tasksTableBody).toBeVisible();
  }

  async searchTask(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500);
  }

  async verifyTaskVisible(taskName: string) {
    const row = this.tasksTableBody
      .getByRole("row")
      .filter({ hasText: taskName });
    await expect(row).toBeVisible();
  }

  async verifyAllRows(expectedValues: string[]) {
    const allRows = this.tasksTableBody.getByRole("row");
    const totalCount = await allRows.count();
    expect(totalCount).toBeGreaterThan(0);

    let matchRows = allRows;
    for (const value of expectedValues) {
      matchRows = matchRows.filter({ hasText: value });
    }

    await expect(matchRows).toHaveCount(totalCount);
  }

  async setDropdownFilters(statusLabel?: string, priorityLabel?: string) {
    if (statusLabel) {
      await this.statusDropdown.selectOption({ label: statusLabel });
    }
    if (priorityLabel) {
      await this.priorityDropdown.selectOption({ label: priorityLabel });
    }
    await this.page.waitForTimeout(500);
  }

  async toggleCheckbox(name: string) {
    await this.page.getByRole("checkbox", { name: name }).check();
    await this.page.waitForTimeout(500);
  }

  async untoggleCheckbox(name: string) {
    await this.page.getByRole("checkbox", { name: name }).uncheck();
    await this.page.waitForTimeout(500);
  }

  async clickSortHeader(testId: string) {
    await this.page.getByTestId(testId).click();
    await this.page.waitForTimeout(500);
  }

  async getSortedTaskTitles() {
    return this.tasksTableBody
      .locator("td:first-child .font-medium")
      .allInnerTexts();
  }
}
