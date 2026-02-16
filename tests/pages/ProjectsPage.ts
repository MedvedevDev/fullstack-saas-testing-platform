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
  readonly projectList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.createProjectButton = page.getByRole("button", {
      name: /new project/i,
    });
    this.projectNameInput = page.getByTestId("project-name-input");
    this.projectDescInput = page.getByTestId("project-name-desc");
    this.submitButton = page.getByRole("button", { name: /create project/i });
    this.projectList = page.locator("main");
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

  getProject(name: string) {
    return this.projectList.getByText(name);
  }
}
