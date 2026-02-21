import { Page, Locator, expect } from "@playwright/test";
import { waitForDebugger } from "node:inspector";

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
  readonly searchInput: Locator;
  readonly filterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createProjectButton = page.getByRole("button", {
      name: /new project/i,
    });
    this.projectsList = page.locator("main");
    this.searchInput = page.getByPlaceholder("Search projects...");
    this.filterButton = page.getByTestId("status-dropdown");
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
   * ### Navigates to the Projects route.
   * @throws Error if the base URL is not reachable
   */
  async goto() {
    await this.page.goto("/projects");

    await expect(this.createProjectButton).toBeVisible();
  }

  /**
   * ### Creates a new project.
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

  /**
   * ### Deletes a project by its name
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
    await actionButton.hover();
    await actionButton.click();

    const deleteOption = this.page.getByRole("button", { name: /delete/i });
    await expect(deleteOption).toBeVisible();
    await deleteOption.click();

    await this.page.waitForTimeout(500);
  }

  /**
   * ### Edits an existing project's name
   *  @param name - Project Name
   * @param description - Project Description
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

    // Apply updates
    if (updates.name) await this.projectNameInputUpdate.fill(updates.name);
    if (updates.description)
      await this.projectDescInputUpdate.fill(updates.description);
    if (updates.status) {
      await this.statusDropdown.selectOption({ value: updates.status });
    }
    if (updates.owner) {
      if (updates.owner == "Change to any") {
        await this.ownerDropdown.selectOption({ index: 1 });
      } else {
        await this.ownerDropdown.selectOption({ label: updates.owner });
      }
    }

    this.saveChangesButton.click();
    await expect(this.projectNameInputUpdate).toBeHidden();
  }

  /**
   * Scan INSIDE that card for the Description, Status, and Date
   */
  async verifyProjectCard(
    name: string,
    details: { descripion: string; status: string; date: string },
  ) {
    // Locate the Card
    const projectCard = this.projectsList
      .getByRole("link")
      .filter({ hasText: name })
      .first();
    await expect(projectCard).toBeVisible();
    // Verify description
    await expect(projectCard).toContainText(details.descripion);
    // Verify status
    await expect(
      projectCard.locator("span").filter({ hasText: details.status }),
    ).toBeVisible();
    // Verify date
    await expect(projectCard).toContainText(details.date);
  }

  /**
   * Verifies that the list contains ONLY the projects matching the search term
   */
  async verifySearchFunction(searchTerm: string) {
    // Ensure page is ready (Initial State)
    await this.projectsList.getByRole("link").first().waitFor();

    // Type the search term
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500);
    // Verify the expected projects are displayed
    const allTitles = await this.projectsList
      .getByRole("link")
      .locator("h3")
      .allInnerTexts();

    //Check if list is empty
    expect(allTitles.length, "Search returned no results").toBeGreaterThan(0);

    // Prove all the titles matchs search
    for (const title of allTitles) {
      expect(title).toContain(searchTerm);
    }
  }

  /**
   * Verifies the "No Projects Found" empty state
   */
  async verifyEmptySearchState() {
    // Ensure page is ready (Initial State)
    await this.projectsList.getByRole("link").first().waitFor();

    await this.searchInput.fill("NO_PROJECT_NAME_XYZ");
    await this.page.waitForTimeout(500);
    // Verify all project cards are gone
    await expect(this.projectsList.getByRole("link")).toHaveCount(0);
    // Verify the "No projects found" message is visible
    await expect(this.page.getByText("No projects found")).toBeVisible();
  }

  /**
   * Filter by Status
   */
  async verifyFilterFunction(expectedStatus: "ACTIVE" | "ARCHIVED") {
    //Ensure page is ready (Initial State)
    await this.projectsList.getByRole("link").first().waitFor();

    await this.filterButton.selectOption({ value: expectedStatus });
    const allStatuses = await this.projectsList
      .getByRole("link")
      .locator("span")
      .first()
      .allInnerTexts();

    //Check if list is empty
    expect(allStatuses.length, "Filter returned no results!").toBeGreaterThan(
      0,
    );
    // Loop through every Status
    for (const status of allStatuses) {
      expect(status.toLowerCase()).toBe(expectedStatus.toLocaleLowerCase());
    }
  }

  /**
   *  Open projct details
   */
  async openProject(name: string) {
    const card = this.projectsList
      .getByRole("link")
      .filter({ hasText: name })
      .first();
    await card.click();
  }
}
