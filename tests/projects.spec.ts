import { test, expect } from "@playwright/test";
import { ProjectsPage } from "./pages/ProjectsPage";

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

  /**
   * Test Scenario: User successfully creates a new project.
   * * Steps:
   * 1. Click "New Project"
   * 2. Fill out the modal form
   * 3. Submit
   * 4. Verify the new project card appears in the list
   */
  test("should allow user to create a new project", async ({ page }) => {
    const projectName = `Auto Project ${Date.now()}`;
    const projectDesc = `Created via Playwright`;

    await projectsPage.createProject(projectName, projectDesc);

    await expect(page.getByText(projectName)).toBeVisible();

    await page.reload();
    // This verifies the project exists strictly inside the list
    const newProject = projectsPage.getProjectCard(projectName);
    await expect(newProject).toBeVisible();

    // Clean Up
    await projectsPage.deleteProject(projectName);
  });

  test("should allow user to delete a project", async ({ page }) => {
    const projectName = `Delete me ${Date.now()}`;

    await projectsPage.createProject(projectName, "Temp");
    await expect(page.getByText(projectName)).toBeVisible();

    await projectsPage.deleteProject(projectName);

    // Verify
    await page.reload();
    await expect(page.getByText(projectName)).not.toBeVisible();
  });

  test("should allow user to edit a project", async ({ page }) => {
    const oldName = `Original ${Date.now()}`;
    const newName = `Updated ${Date.now()}`;

    await projectsPage.createProject(oldName, "Initial Description");

    await projectsPage.editProject(oldName, {
      name: newName,
      status: "ARCHIVED",
      description: "NEW DESCRIPTION",
      owner: "Olga Reilly (MANAGER)",
    });

    // Verify Name Change
    await expect(page.getByText(newName)).toBeVisible();
    await expect(page.getByText(oldName)).not.toBeVisible();
  });
});
