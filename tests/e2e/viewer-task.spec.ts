import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { TaskModal } from "../pages/TaskModal";
import { TasksPage } from "../pages/TasksPage";
import { ApiHelper } from "../../utils/ApiHelper";

test.describe("Viewer Task Flow @e2e @tasks", () => {
  let loginPage: LoginPage;
  let tasksPage: TasksPage;
  let api: ApiHelper;
  let taskModal: TaskModal;

  test.beforeEach(async ({ page, request }) => {
    loginPage = new LoginPage(page);
    tasksPage = new TasksPage(page);
    taskModal = new TaskModal(page);
    api = new ApiHelper(request);
  });

  test("Viewer can complete an assigned task", async ({ page }) => {
    const projectName = `Project ${Date.now()}`;
    const userEmail = `emailviewer${Date.now()}@gmail.com`;
    const taskName = `Complete Me ${Date.now()}`;

    // Create test data (user, task, project)
    await api.login("admin@flowdash.com", "password123");
    const user = await api.createUser("Viewer", "user", userEmail, "VIEWER");
    expect(user.id).toBeDefined();
    const project = await api.createProject(projectName, "TEST");
    expect(project.id).toBeDefined();
    const task = await api.createTask(project.id, taskName, user.id);
    expect(task.id).toBeDefined();

    // Login As User and change task status
    await loginPage.goto();
    await loginPage.login(userEmail, "password123");
    await tasksPage.goto();
    const taskRow = tasksPage.tasksTableBody
      .getByRole("row")
      .filter({ hasText: taskName });
    const editButton = taskRow.getByRole("button", { name: /edit task/i });
    await editButton.hover();
    await editButton.click();
    await taskModal.fillTaskDetails({ status: "Done" });
    await taskModal.submitEdit();

    // Verify status changed to "DONE"
    await expect(taskRow.getByRole("cell", { name: "Done" })).toBeVisible();
    const allTasks = await api.getTasks();
    const updatedTask = await allTasks.find((t: any) => t.id === task.id);
    expect(updatedTask.status).toBe("DONE");

    // Cleanup
    await api.deleteTask(task.id);
    await api.deleteProject(project.id);
    await api.deleteUser(user.id);
  });
});
