import { Page, Locator, expect } from "@playwright/test";

export interface ProjectUpdates {
  name?: string;
  description?: string;
  status?: "ACTIVE" | "ARCHIVED";
  owner?: string;
}

/**
 * Page Object Model for the Projects management flow.
 * Handles the creation, listing, and interaction with Projects on the dashboard.
 */
export class ProjectsPage {
  readonly page: Page;
  readonly createProjectButton: Locator;
  readonly projectNameInput: Locator;
  readonly projectDescInput: Locator;
  readonly submitButton: Locator;
  readonly projectsList: Locator;
  readonly statusDropdown: Locator;
  readonly ownerDropdown: Locator;
  readonly projectNameInputUpdate: Locator;
  readonly projectDescInputUpdate: Locator;
  readonly saveChangesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createProjectButton = page.getByRole("button", {
      name: /new project/i,
    });
    this.projectsList = page.locator("main");
    // Create Project Modal fields
    this.projectNameInput = page.getByTestId("project-name-input");
    this.projectDescInput = page.getByTestId("project-name-desc");
    this.submitButton = page.getByRole("button", { name: /create project/i });
    // Edit Project Modal fields
    this.projectNameInputUpdate = page.getByLabel(/project name/i);
    this.projectDescInputUpdate = page.getByLabel(/description/i);
    this.statusDropdown = page.getByLabel(/status/i);
    this.saveChangesButton = page.getByRole("button", {
      name: /save changes/i,
    });
    this.ownerDropdown = page
      .locator("label", { hasText: /project owner/i })
      .locator(" + div select");
  }

  /**
   * Navigates to the Projects route.
   * @throws Error if the base URL is not reachable
   */
  async goto() {
    await this.page.goto("/projects");

    await expect(this.createProjectButton).toBeVisible();
  }

  /**
   * Creates a new project.
   * @param name - Project Name
   * @param description - Project Description
   */
  async createProject(name: string, description: string) {
    await this.createProjectButton.click();
    // Wait for the form to appear
    await expect(this.projectNameInput).toBeVisible();

    await this.projectNameInput.fill(name);
    await this.projectDescInput.fill(description);

    await this.submitButton.click();
    // Verify modal closes
    await expect(this.projectNameInput).toBeHidden();
  }

  getProjectCard(name: string) {
    return this.projectsList.getByRole("link").filter({ hasText: name });
  }

  /**
   * Deletes a project by its name.
   * Handles the locator chaining to find the specific delete button for this project.
   */
  async deleteProject(name: string) {
    // set up the listener to confirm deletion
    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    const projectCard = this.projectsList
      .getByRole("link")
      .filter({ hasText: name })
      .first();

    const actionButton = projectCard
      .getByRole("button")
      .filter({ has: this.page.locator("svg.lucide-ellipsis-vertical") });
    await actionButton.click();

    const deleteOption = this.page.getByRole("button", { name: /delete/i });
    await expect(deleteOption).toBeVisible();
    await deleteOption.click();

    // Verify the card is gone
    await expect(projectCard).toBeHidden();
  }

  /**
   * Edits an existing project's name.
   *  @param name - Project Name
   * @param description - Project Description
   * Flow: Open Menu -> Click Edit -> Change Name -> Save
   */
  async editProject(oldName: string, updates: ProjectUpdates) {
    // Find the card by the old name and open Edit modal
    const card = this.projectsList
      .getByRole("link")
      .filter({ hasText: oldName });

    const actionButton = card
      .getByRole("button")
      .filter({ has: this.page.locator("svg.lucide-ellipsis-vertical") });
    await actionButton.click();

    const editOption = this.page.getByRole("button", { name: /edit/i });
    await expect(editOption).toBeVisible();
    await editOption.click();
    // Wait for the form to appear
    await expect(this.projectDescInputUpdate).toBeVisible();

    await this.statusDropdown.click();
    // // Apply updates
    if (updates.name) await this.projectNameInputUpdate.fill(updates.name);
    if (updates.description)
      await this.projectDescInputUpdate.fill(updates.description);
    if (updates.status) {
      await this.statusDropdown.selectOption({ value: updates.status });
    }
    if (updates.owner) {
      await this.ownerDropdown.selectOption({ label: updates.owner });
    }

    this.saveChangesButton.click();
    await expect(this.projectNameInputUpdate).toBeHidden();
  }
}
