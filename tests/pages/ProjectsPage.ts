import { Page, Locator, expect } from "@playwright/test";

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

  constructor(page: Page) {
    this.page = page;

    this.createProjectButton = page.getByRole("button", {
      name: /new project/i,
    });
    this.projectNameInput = page.getByTestId("project-name-input");
    this.projectDescInput = page.getByTestId("project-name-desc");
    this.submitButton = page.getByRole("button", { name: /create project/i });
    this.projectsList = page.locator("main");
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

    // (Optional) Handle "Are you sure?" Modal
    const confirmButton = this.page.getByRole("button", {
      name: /confirm|yes/i,
    });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Verify the card is gone
    await expect(projectCard).toBeHidden();
  }
}
