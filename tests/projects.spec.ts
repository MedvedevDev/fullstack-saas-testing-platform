import { test, expect } from "@playwright/test";
import { ProjectsPage } from "./pages/ProjectsPage";
import { getTodayDate } from "../utils/date-utils";

/**
 * Project Management Module Tests.
 * Covers the lifecycle of projects: Create, Read (List), Update, Delete.
 * Uses Global Setup for authentication state.
 */
test.describe("Projects Module", () => {
  let projectsPage: ProjectsPage;
  let projectName: string | null = null;

  test.beforeEach(async ({ page }) => {
    projectsPage = new ProjectsPage(page);
    projectsPage.goto();
  });

  test("verify create a new project @smoke @projects", async ({ page }) => {
    projectName = `Auto Project ${Date.now()}`;
    const projectDesc = `Created via Playwright`;
    const currentDate = getTodayDate();

    await projectsPage.createProject(projectName, projectDesc);
    await expect(page.getByText(projectName)).toBeVisible();
    // Verify project details are correct
    await projectsPage.verifyProjectCard(projectName, {
      descripion: "Created via Playwright",
      status: "ACTIVE",
      date: currentDate,
    });
  });

  test("verify delete a project @smoke @projects", async ({ page }) => {
    const name = `Delete me ${Date.now()}`;

    await projectsPage.createProject(name, "Temp");
    await expect(page.getByText(name)).toBeVisible();

    await projectsPage.deleteProject(name);

    // Verify
    await expect(page.getByText(name)).not.toBeVisible();
  });

  test("verify edit a project @projects", async ({ page }) => {
    projectName = `Original ${Date.now()}`;
    const newName = `Updated ${Date.now()}`;
    const currentDate = getTodayDate();

    await projectsPage.createProject(projectName, "Initial Description");

    await projectsPage.editProject(projectName, {
      name: newName,
      status: "ARCHIVED",
      description: "NEW DESCRIPTION",
      owner: "Change to any",
    });
    // Verify Name Change
    await expect(page.getByText(newName)).toBeVisible();
    await expect(page.getByText(projectName)).not.toBeVisible();

    // Verify project details are correct
    await projectsPage.verifyProjectCard(newName, {
      descripion: "NEW DESCRIPTION",
      status: "ARCHIVED",
      date: currentDate,
    });

    // Clean up
    projectName = newName;
  });

  test("verify filter  by status works correctly @projects", async ({
    page,
  }) => {
    // Should display only Archived projects
    await projectsPage.verifyFilterFunction("ARCHIVED");
    // Should display only Active projects
    await projectsPage.verifyFilterFunction("ACTIVE");
  });

  test("verify search  works correctly @projects", async ({ page }) => {
    const projectToSearch = `Project To Search`;
    const projectToSearch2 = `Project To Search 2`;
    await projectsPage.createProject(projectToSearch, "Active description");
    await projectsPage.createProject(projectToSearch2, "Active description");
    // Search with valid name
    await projectsPage.verifySearchFunction(projectToSearch);

    //Search with empty string
    await projectsPage.verifyEmptySearchState();
    await projectsPage.searchInput.fill("");

    // Clean up
    const allTitles = await projectsPage.projectsList
      .getByRole("heading", { level: 3 })
      .allInnerTexts();
    const titlesToDelete = allTitles.filter((title) =>
      title.includes(projectToSearch),
    );
    for (const title of titlesToDelete) {
      await projectsPage.deleteProject(projectToSearch);
    }
  });

  test("create a project with an empty name @projects @negative", async ({
    page,
  }) => {
    await projectsPage.createProjectButton.click();

    await projectsPage.submitButton.click();

    // Verify that the project is not created when Project name field is empty
    // Verify native warning is shown
    const validationMessage = await projectsPage.projectNameInput.evaluate(
      (element) => {
        return (element as HTMLInputElement).validationMessage;
      },
    );
    expect(validationMessage).not.toBe("");
    // Verify user stays on the modal
    await expect(projectsPage.createProjectModal).toBeVisible();
  });

  test("cancel project creation and verify fields are clear @projects @negative", async ({}) => {
    const name = `Project Name ${Date.now()}`;
    const descripion = `Descr ${Date.now()}`;

    await projectsPage.createProjectButton.click();
    // Wait for the form to appear
    await expect(projectsPage.projectNameInput).toBeVisible();
    // Fill the form
    await projectsPage.projectNameInput.fill(name);
    await projectsPage.projectDescInput.fill(descripion);
    // Cancel
    await projectsPage.cancelSubmitButton.click();
    await expect(projectsPage.projectNameInput).toBeHidden();
    // Verify that project is not created
    const projectCard = projectsPage.projectsList
      .getByRole("link")
      .filter({ hasText: name })
      .first();
    await expect(projectCard).toBeHidden();

    // Reopen the modal and verify fields are empty
    await projectsPage.createProjectButton.click();
    await expect(projectsPage.projectNameInput).toBeVisible();
    await expect(projectsPage.projectNameInput).toHaveValue("");
    await expect(projectsPage.projectDescInput).toHaveValue("");
  });

  test("verify project name character limit @projects @negative", async ({}) => {
    const maxLength = 90;
    const longName = "T".repeat(maxLength + 5);
    const expectedName = "T".repeat(maxLength);

    await projectsPage.createProjectButton.click();
    // Wait for the form to appear
    await expect(projectsPage.projectNameInput).toBeVisible();
    // Fill the form
    await projectsPage.projectNameInput.fill(longName);
    // Verify that the input value is truncated
    await expect(projectsPage.projectNameInput).toHaveValue(expectedName);
  });

  test("verify sidebar navigation @projects", async ({ page }) => {
    // Navigate to Dashboard
    await projectsPage.sidebar.dashboardLink.click();
    await expect(page).toHaveURL(/.*dashboard/);
    // Navigate back to Projects
    await projectsPage.sidebar.projectsLink.click();
    await expect(page).toHaveURL(/.*projects/);
  });

  test.afterEach(async ({ page }) => {
    if (projectName) {
      const projectPage = new ProjectsPage(page);
      await projectPage.goto();
      await projectPage.deleteProject(projectName);
      projectName = null;
    }
  });
});
