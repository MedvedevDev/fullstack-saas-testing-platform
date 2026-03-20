import { test, expect } from "@playwright/test";
import { LoginPage } from "../../support/pages/LoginPage";
import { ProjectsPage } from "../../support/pages/ProjectsPage";
import { ProjectDetailsPage } from "../../support/pages/ProjectDetailsPage";
import { TasksPage } from "../../support/pages/TasksPage";
import { TaskModal } from "../../support/pages/TaskModal";
import { ApiHelper } from "../../support/helpers/ApiHelper";

test.describe("Manager Task Assignment & Viewer Workflow @e2e", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Manager creates tasks, assigns to Viewer, Viewer completes them, Manager verifies updates", async ({
    page,
    request,
  }) => {
    const loginPage = new LoginPage(page);
    const projectsPage = new ProjectsPage(page);
    const detailsPage = new ProjectDetailsPage(page);
    const tasksPage = new TasksPage(page);
    const taskModal = new TaskModal(page);
    const api = new ApiHelper(request);

    // Test data
    const managerEmail = `manager.${Date.now()}@test.com`;
    const viewerEmail = `viewer.${Date.now()}@test.com`;
    const projectName = `Manager Assignment ${Date.now()}`;
    const task1Name = `Task One ${Date.now()}`;
    const task2Name = `Task Two ${Date.now()}`;

    // Create manager, viewer, and project via api
    await api.login("admin@flowdash.com", "password123");
    const manager = await api.createUser(
      "Manager",
      "User",
      managerEmail,
      "MANAGER",
    );
    expect(manager.id).toBeDefined();

    const viewer = await api.createUser(
      "Viewer",
      "User",
      viewerEmail,
      "VIEWER",
    );
    expect(viewer.id).toBeDefined();

    // Create project as manager
    await api.login(managerEmail, "password123");
    const project = await api.createProject(projectName, "Test project");
    expect(project.id).toBeDefined();

    // Create and assign tasks as manager
    await loginPage.goto();
    await loginPage.login(managerEmail, "password123");
    await expect(page).toHaveURL(/.*dashboard/);
    await projectsPage.goto();
    await page.reload();
    await projectsPage.openProject(projectName);

    // Create first task and assign to Viewer
    await detailsPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: task1Name,
      assignee: "Viewer User",
      status: "To Do",
      priority: "High",
    });
    await taskModal.submitCreate();
    await detailsPage.verifyTaskInList(task1Name, "High");

    // Create second task and assign to Viewer
    await detailsPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: task2Name,
      assignee: "Viewer User",
      status: "To Do",
      priority: "Medium",
    });
    await taskModal.submitCreate();
    await detailsPage.verifyTaskInList(task2Name, "Medium");

    // Verify both tasks are in the project
    await detailsPage.verifyTaskCount(2);

    // Update task statuses as Viewer
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login(viewerEmail, "password123");
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate to projects page
    await projectsPage.goto();
    await page.reload();
    await projectsPage.openProject(projectName);

    // Find and update first task to "In Progress" from project details
    await page.waitForTimeout(300);
    const task1RowDetails = page
      .getByRole("row")
      .filter({ hasText: task1Name });
    await task1RowDetails.hover();
    const task1EditButtonDetails = task1RowDetails.getByRole("button", {
      name: /edit task/i,
    });
    await task1EditButtonDetails.click();
    await taskModal.fillTaskDetails({ status: "In Progress" });
    await taskModal.submitEdit();
    await page.waitForTimeout(300);

    // Find and update second task to "Done" from project details
    const task2RowDetails = page
      .getByRole("row")
      .filter({ hasText: task2Name });
    await task2RowDetails.hover();
    const task2EditButtonDetails = task2RowDetails.getByRole("button", {
      name: /edit task/i,
    });
    await task2EditButtonDetails.click();
    await taskModal.fillTaskDetails({ status: "Done" });
    await taskModal.submitEdit();
    await page.waitForTimeout(300);

    //  Manager verifies task statuses in project
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login(managerEmail, "password123");
    await expect(page).toHaveURL(/.*dashboard/);

    // Navigate back to project
    await projectsPage.goto();
    await page.reload();
    await projectsPage.openProject(projectName);

    // Verify task statuses are updated
    const updatedTask1Row = page
      .getByRole("row")
      .filter({ hasText: task1Name });
    await expect(
      updatedTask1Row.getByRole("cell", { name: "In Progress" }),
    ).toBeVisible();

    const updatedTask2Row = page
      .getByRole("row")
      .filter({ hasText: task2Name });
    await expect(
      updatedTask2Row.getByRole("cell", { name: "Done" }),
    ).toBeVisible();

    // Verify task count is still 2
    await detailsPage.verifyTaskCount(2);

    // Clenaup
    await api.login("admin@flowdash.com", "password123");
    await api.deleteProject(project.id);
    await api.deleteUser(manager.id);
    await api.deleteUser(viewer.id);
  });
});
