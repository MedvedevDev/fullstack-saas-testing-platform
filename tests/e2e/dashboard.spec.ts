import { test } from "@playwright/test";
import { ApiHelper } from "../../utils/ApiHelper";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";

test.describe("Dashboard E2E @e2e @dashboard", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Dashboard empty state for new user", async ({ page, request }) => {
    const api = new ApiHelper(request);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);

    // Create new Viewer user
    const email = `empty.state${Date.now()}@ffdf.cc`;
    await api.login("admin@flowdash.com", "password123");
    const user = await api.createUser("test", "test", email, "VIEWER");

    // Login and verify empty state
    await loginPage.goto();
    await loginPage.login(email, "password123");

    await dashboardPage.verifyEmptyState();

    // Clean up
    await api.deleteUser(user.id);
  });

  test("Dashboard Data Consistency (Manager)", async ({ page, request }) => {
    const api = new ApiHelper(request);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const email = `dashboard.stats${Date.now()}@ffdf.cc`;
    const projectName = `Dashboard Start ${Date.now()}`;

    // Create Manager user, Project and Tasks
    await api.login("admin@flowdash.com", "password123");
    const user = await api.createUser("Name", "Test", email, "MANAGER");

    // Change user to manager and create a project and To DO and DOne tasks
    await api.login(email, "password123");
    const project = await api.createProject(projectName, "Test");
    await api.createTask(project.id, "Task Name For Dashboard stats");
    const doneTask = await api.createTask(
      project.id,
      "Done Task Name For Dashboard stats",
    );
    await api.updateTask(doneTask.id, { status: "DONE" });

    // Get stats via api request
    const apiStats = await api.getDashboardStats();

    // Login and Verify the UI
    await loginPage.goto();
    await loginPage.login(email, "password123");
    await dashboardPage.verifyStats(apiStats);

    // Cleanup
    await api.login("admin@flowdash.com", "password123");
    await api.deleteProject(project.id);
    await api.deleteUser(user.id);
  });

  test("Dashboard Data Consistency (ADMIN)", async ({ page, request }) => {
    const api = new ApiHelper(request);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const email = `dashboard.stats${Date.now()}@ffdf.cc`;
    const projectName = `Dashboard Start ${Date.now()}`;

    // Create Admin user, Project and Tasks
    await api.login("admin@flowdash.com", "password123");
    const user = await api.createUser("Admin", "Test", email, "ADMIN");

    // Change user to Admin and create a project and To DO and DOne tasks
    await api.login(email, "password123");
    const project = await api.createProject(projectName, "Test");
    await api.createTask(project.id, "Task Name For Dashboard stats");
    const doneTask = await api.createTask(
      project.id,
      "Done Task Name For Dashboard stats",
    );
    await api.updateTask(doneTask.id, { status: "DONE" });

    // Get stats via api request
    const apiStats = await api.getDashboardStats();

    // Login and Verify the UI
    await loginPage.goto();
    await loginPage.login(email, "password123");
    await dashboardPage.verifyStats(apiStats);

    // Cleanup
    await api.login("admin@flowdash.com", "password123");
    await api.deleteProject(project.id);
    await api.deleteUser(user.id);
  });

  test("Dashboard Data Consistency (VIEWER)", async ({ page, request }) => {
    const api = new ApiHelper(request);
    const dashboardPage = new DashboardPage(page);
    const loginPage = new LoginPage(page);
    const email = `dashboard.stats${Date.now()}@ffdf.cc`;
    const projectName = `Dashboard Start ${Date.now()}`;

    // Create a Project and Tasks
    await api.login("admin@flowdash.com", "password123");
    const project = await api.createProject(projectName, "Test");
    await api.createTask(project.id, "Task Name For Dashboard stats");
    const doneTask = await api.createTask(
      project.id,
      "Done Task Name For Dashboard stats",
    );
    await api.updateTask(doneTask.id, { status: "DONE" });
    // Create Viewer user
    const user = await api.createUser("Name", "Test", email, "VIEWER");

    // Get stats via api request
    await api.login(email, "password123");
    const apiStats = await api.getDashboardStats();

    // Login and Verify the UI
    await loginPage.goto();
    await loginPage.login(email, "password123");
    await dashboardPage.verifyStats(apiStats);

    // Cleanup
    await api.login("admin@flowdash.com", "password123");
    await api.deleteProject(project.id);
    await api.deleteUser(user.id);
  });
});
