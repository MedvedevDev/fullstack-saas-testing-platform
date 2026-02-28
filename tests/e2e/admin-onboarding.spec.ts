import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { UsersPage } from "../pages/UsersPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ApiHelper } from "../../utils/ApiHelper";

test.describe("Admin Onboarding Flow @e2e", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Admin creates Manager and Project, Manager verifies ownership", async ({
    page,
    request,
  }) => {
    const loginPage = new LoginPage(page);
    const usersPage = new UsersPage(page);
    const projectsPage = new ProjectsPage(page);
    const dashboardPage = new DashboardPage(page);
    const api = new ApiHelper(request);

    const firstName = "E2E";
    const lastName = `${Date.now()}`;
    const managerFullName = `${firstName} ${lastName}`;
    const managerEmail = `e2e.manager${Date.now()}@flowdash.com`;
    const projectName = `E2E Project ${Date.now()}`;

    // Create manager and project as Admin
    await loginPage.goto();
    await loginPage.login("admin@flowdash.com", "password123");
    await page.waitForURL("/dashboard");

    await usersPage.goto();
    await usersPage.createUser(firstName, lastName, managerEmail, "MANAGER");
    await usersPage.verifyUserVisible(managerEmail);

    await projectsPage.goto();
    await projectsPage.createProject(projectName, "TEST");
    await projectsPage.editProject(projectName, {
      owner: `${managerFullName} (MANAGER)`,
    });

    // Switch user to manager
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.login(managerEmail, "password123");
    // Update our API helper to use the Manager's token
    await api.login(managerEmail, "password123");
    const managerStats = await api.getDashboardStats();

    // Verify dashboard for manager
    await dashboardPage.goto();
    await expect(dashboardPage.totalProjectsBlock).toHaveText(
      String(managerStats.totalProjects),
    );

    // Verify projects page for manager
    await projectsPage.goto();
    const prCard = projectsPage.projectsList
      .getByRole("link")
      .filter({ hasText: projectName });
    await expect(prCard).toBeVisible();

    // Clean up
    await api.login("admin@flowdash.com", "password123");

    const allProjects = await api.getProjects();
    const projectToDelete = allProjects.find(
      (p: any) => p.name === projectName,
    );
    if (projectToDelete) await api.deleteProject(projectToDelete.id);

    const allUsers = await api.getUsers();
    const userToDelete = allUsers.find((u: any) => u.email === managerEmail);
    if (userToDelete) await api.deleteUser(userToDelete.id);
  });
});
