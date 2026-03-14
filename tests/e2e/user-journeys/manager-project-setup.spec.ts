import { test, expect } from "@playwright/test";
import { LoginPage } from "../../support/pages/LoginPage";
import { ProjectsPage } from "../../support/pages/ProjectsPage";
import { ProjectDetailsPage } from "../../support/pages/ProjectDetailsPage";
import { TaskModal } from "../../support/pages/TaskModal";
import { ApiHelper } from "../../support/helpers/ApiHelper";

test.describe("Manager roject Setup Flow @e2e", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Manager creates and assigns tasks in a project", async ({
    page,
    request,
  }) => {
    const loginPage = new LoginPage(page);
    const projectsPage = new ProjectsPage(page);
    const detailsPage = new ProjectDetailsPage(page);
    const taskModal = new TaskModal(page);
    const api = new ApiHelper(request);

    const managerEmail = `manager.${Date.now()}@test.com`;
    const viewerEmail = `viewer.${Date.now()}@test.com`;
    const projectName = `Manager Setup ${Date.now()}`;
    const task1Name = `First Task ${Date.now()}`;
    const task2Name = `Second Task ${Date.now()}`;

    await api.login("admin@flowdash.com", "password123");
    const manager = await api.createUser(
      "Project",
      "Manager",
      managerEmail,
      "MANAGER",
    );
    const viewer = await api.createUser(
      "Task",
      "Viewer",
      viewerEmail,
      "VIEWER",
    );
    await api.login(managerEmail, "password123");
    const project = await api.createProject(projectName, " test");

    // Login as Manager
    await loginPage.goto();
    await loginPage.login(managerEmail, "password123");
    await expect(page).toHaveURL(/.*dashboard/); // Wait for login to complete

    await projectsPage.goto();
    await page.reload(); // Reload to bust any frontend cache
    await projectsPage.openProject(projectName);
    // create tasks and assign the Viewer user
    await detailsPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: task1Name,
      assignee: "Task Viewer",
      status: "To Do",
      priority: "High",
    });
    await taskModal.submitCreate();
    await detailsPage.verifyTaskInList(task1Name, "High");

    await detailsPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: task2Name,
      assignee: "Task Viewer",
      status: "In Progress",
      priority: "Medium",
    });
    await taskModal.submitCreate();
    await detailsPage.verifyTaskInList(task2Name, "Medium");

    await detailsPage.verifyTaskCount(2);

    // Switch user to manager
    // await page.context().clearCookies();
    // await loginPage.goto();
    // await loginPage.login(managerEmail, "password123");

    // Cleanup
    await api.login("admin@flowdash.com", "password123");
    await api.deleteProject(project.id);
    await api.deleteUser(manager.id);
    await api.deleteUser(viewer.id);
  });
});
