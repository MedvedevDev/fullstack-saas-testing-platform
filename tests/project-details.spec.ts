import { test, expect } from "@playwright/test";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { TaskModal } from "./pages/TaskModal";

test.describe("Project Details Module @regression", () => {
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
    await detailsPage.verifyTaskCount(0);
    await detailsPage.verifyEmptyState();
    await detailsPage.backButton.click();
  });
});

test.describe("Tasks List on the Projects Details page @regression", () => {
  let projectsPage: ProjectsPage;
  let detailsPage: ProjectDetailsPage;
  let taskModal: TaskModal;

  test.beforeEach(async ({ page }) => {
    projectsPage = new ProjectsPage(page);
    detailsPage = new ProjectDetailsPage(page);
    taskModal = new TaskModal(page);

    await projectsPage.goto();
  });

  test("Create, Edit, and Delete a Task on the Project Details page", async ({
    page,
  }) => {
    const projectName = `Task Test Project ${Date.now()}`;
    const taskName = "Build Login Page";
    const updatedTaskName = "Build Login Page 2";

    await projectsPage.createProject(projectName, "Testing tasks");
    await projectsPage.openProject(projectName);

    // CREATE TASK
    await detailsPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskName,
      status: "To Do",
      priority: "High",
      dueDate: "2026-12-31",
    });
    await taskModal.submitCreate();
    // Verify task is in the list with High priority
    await detailsPage.verifyTaskInList(taskName, "High");
    await detailsPage.verifyTaskCount(1);

    // EDIT TASK
    await detailsPage.openEditTask(taskName);
    await taskModal.fillTaskDetails({
      title: updatedTaskName,
      status: "In Progress",
      priority: "Low",
    });
    await taskModal.submitEdit();
    // Verify update
    await expect(detailsPage.getTaskRow(taskName)).toBeHidden();
    await detailsPage.verifyTaskInList(updatedTaskName, "Low");
    await detailsPage.verifyTaskCount(1);

    // DELETE TASK
    await detailsPage.deleteTask(updatedTaskName);
    await expect(detailsPage.getTaskRow(updatedTaskName)).toBeHidden();
    await detailsPage.verifyEmptyState();
    await detailsPage.verifyTaskCount(0);
  });

  test.afterEach(async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.goto();

    const allTitles = await page
      .getByRole("heading", { level: 3 })
      .allInnerTexts();
    const projectsToDelete = allTitles.filter(
      (title) =>
        title.includes("Task Test Project") ||
        title.includes("Project Name To Test") ||
        title.includes("Auto Project"),
    );
    for (const name of projectsToDelete) {
      await projectsPage.deleteProject(name);
    }
    await page.close();
  });
});
