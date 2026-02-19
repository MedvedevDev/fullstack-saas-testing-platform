import { test, expect } from "@playwright/test";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { TaskModal } from "./pages/TaskModal";

test.describe("Project Details Module", () => {
  let projectsPage: ProjectsPage;
  let detailsPage: ProjectDetailsPage;

  test.beforeEach(async ({ page }) => {
    projectsPage = new ProjectsPage(page);
    detailsPage = new ProjectDetailsPage(page);
    await projectsPage.goto();
  });

  test("Verify Project details page for new project", async ({ page }) => {
    const projectName = "Project Name To Test";
    const projectDesc = "Project Description To Test";
    await projectsPage.createProject(projectName, projectDesc);
    await projectsPage.openProject(projectName);

    // Verify new project header and empty tasks state
    await detailsPage.verifyHeader(projectName, "ACTIVE");
    await detailsPage.verifyEmptyState();
  });
});

test.describe("Project Tasks List on the Projects Details page", () => {
  let projectsPage: ProjectsPage;
  let detailsPage: ProjectDetailsPage;
  let taskModal: TaskModal;

  test.beforeEach(async ({ page }) => {
    projectsPage = new ProjectsPage(page);
    detailsPage = new ProjectDetailsPage(page);
    taskModal = new TaskModal(page);

    await projectsPage.goto();
  });

  test("Create, Edit, and Delete a Task", async ({ page }) => {});
});
