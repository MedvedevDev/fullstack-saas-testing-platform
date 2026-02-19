import { Page, Locator } from "@playwright/test";

export class TaskModal {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly assigneeSelect: Locator;
  readonly statusSelect: Locator;
  readonly prioritySelect: Locator;
  readonly dueDateInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByLabel(/task title/i);
    this.assigneeSelect = page.getByLabel(/assignee/i);
    this.statusSelect = page.getByLabel(/status/i);
    this.prioritySelect = page.getByLabel(/priority/i);
    this.dueDateInput = page.getByLabel(/due date/i);
    this.descriptionInput = page.getByLabel(/description/i);

    this.createButton = page.getByRole("button", { name: /create task/i });
    this.saveButton = page.getByRole("button", { name: /save changes/i });
  }

  /**
   * Fills out the form fields.
   * It only fills the ones you provide in the test.
   */
  async fillTaskDetails(details: {
    title?: string;
    assignee?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    description?: string;
  }) {
    if (details.title) await this.titleInput.fill(details.title);
    if (details.description)
      await this.descriptionInput.fill(details.description);
    if (details.assignee)
      await this.assigneeSelect.selectOption({ label: details.assignee });
    if (details.status)
      await this.statusSelect.selectOption({ label: details.status });
    if (details.priority)
      await this.prioritySelect.selectOption({ label: details.priority });
    if (details.dueDate) await this.dueDateInput.fill(details.dueDate);
  }

  async submitCreate() {
    await this.createButton.click();
    await this.createButton.waitFor({ state: "hidden" });
  }

  async submitEdit() {
    await this.saveButton.click();
    await this.saveButton.waitFor({ state: "hidden" });
  }
}
