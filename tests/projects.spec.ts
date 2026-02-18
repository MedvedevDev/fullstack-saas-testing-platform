import { test, expect } from "@playwright/test";
import { ProjectsPage } from "./pages/ProjectsPage";

// Helper function
function getTodayDate() {
  const date = new Date();
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

/**
 * Project Management Module Tests.
 * Covers the lifecycle of projects: Create, Read (List), Update, Delete.
 * Uses Global Setup for authentication state.
 */
test.describe("Projects Module", () => {
  let projectsPage: ProjectsPage;

  test.beforeEach(async ({ page }) => {
    projectsPage = new ProjectsPage(page);
    projectsPage.goto();
  });

  test("verify create a new project", async ({ page }) => {
    const projectName = `Auto Project ${Date.now()}`;
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

    await page.reload();

    // Clean Up
    await projectsPage.deleteProject(projectName);
  });

  test("verify delete a project", async ({ page }) => {
    const projectName = `Delete me ${Date.now()}`;

    await projectsPage.createProject(projectName, "Temp");
    await expect(page.getByText(projectName)).toBeVisible();

    await projectsPage.deleteProject(projectName);

    // Verify
    await page.reload();
    await expect(page.getByText(projectName)).not.toBeVisible();
  });

  test("verify edit a project", async ({ page }) => {
    const oldName = `Original ${Date.now()}`;
    const newName = `Updated ${Date.now()}`;
    const currentDate = getTodayDate();

    await projectsPage.createProject(oldName, "Initial Description");

    await projectsPage.editProject(oldName, {
      name: newName,
      status: "ARCHIVED",
      description: "NEW DESCRIPTION",
      owner: "Change to any",
    });
    // Verify Name Change
    await expect(page.getByText(newName)).toBeVisible();
    await expect(page.getByText(oldName)).not.toBeVisible();

    // Verify project details are correct
    await projectsPage.verifyProjectCard(newName, {
      descripion: "NEW DESCRIPTION",
      status: "ARCHIVED",
      date: currentDate,
    });

    // Clean Up
    await projectsPage.deleteProject(newName);
  });

  test("verify filter  by status works correctly", async ({ page }) => {
    // Should display only Archived projects
    await projectsPage.verifyFilterFunction("ARCHIVED");
    // Should display only Active projects
    await projectsPage.verifyFilterFunction("ACTIVE");
  });

  test("verify search  works correctly", async ({ page }) => {
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
});
