import { test, expect } from "@playwright/test";
import { LoginPage } from "../../support/pages/LoginPage";
import { ProjectsPage } from "../../support/pages/ProjectsPage";
import { ProjectDetailsPage } from "../../support/pages/ProjectDetailsPage";
import { TaskModal } from "../../support/pages/TaskModal";
import { TasksPage } from "../../support/pages/TasksPage";
import { ApiHelper } from "../../support/helpers/ApiHelper";

test.describe("Task Lifecycle Flow @e2e", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Task moves from Admin creation to Viewer completion to Admin verification", async ({
    page,
    request,
  }) => {
    const loginPage = new LoginPage(page);
    const projectsPage = new ProjectsPage(page);
    const detailsPage = new ProjectDetailsPage(page);
    const taskModal = new TaskModal(page);
    const tasksPage = new TasksPage(page);
    const api = new ApiHelper(request);

    const viewerEmail = `lifecycle.viewer${Date.now()}@test.com`;
    const projectName = `Lifecycle Project ${Date.now()}`;
    const taskName = `Lifecycle Task ${Date.now()}`;

    // setup data via api
    await api.login("admin@flowdash.com", "password123");
    const viewer = await api.createUser(
      "Life",
      "Viewer",
      viewerEmail,
      "VIEWER",
    );
    const project = await api.createProject(projectName, "Lifecycle Test");

    // admin creates task  and assignes it on user
    await loginPage.goto();
    await loginPage.login("admin@flowdash.com", "password123");
    await page.waitForURL("**/dashboard");
    await projectsPage.goto();
    await projectsPage.openProject(projectName);

    await detailsPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskName,
      assignee: "Life Viewer",
      status: "To Do",
      priority: "High",
    });
    await taskModal.submitCreate();

    // user completes the task
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login(viewerEmail, "password123");

    await tasksPage.goto();
    const taskRow = tasksPage.tasksTableBody
      .getByRole("row")
      .filter({ hasText: taskName });
    const editButton = taskRow.getByRole("button", { name: /edit task/i });
    await editButton.hover();
    await editButton.click();

    await taskModal.fillTaskDetails({ status: "Done" });
    await taskModal.submitEdit();

    // admin verifies that the task is "Done"
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login("admin@flowdash.com", "password123");

    await projectsPage.goto();
    await projectsPage.openProject(projectName);

    // verify it shows up in the project task list with the "Done" status
    const projectTaskRow = detailsPage.tasksTable
      .getByRole("row")
      .filter({ hasText: taskName });
    await expect(
      projectTaskRow.getByRole("cell", { name: "Done" }),
    ).toBeVisible();

    // cleanup test data
    await api.login("admin@flowdash.com", "password123");
    await api.deleteProject(project.id);
    await api.deleteUser(viewer.id);
  });
});
