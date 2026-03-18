import { test, expect } from "@playwright/test";
import { LoginPage } from "@support/pages/LoginPage";
import { ProjectsPage } from "@support/pages/ProjectsPage";
import { UsersPage } from "@support/pages/UsersPage";

test.describe("Test VIEWER restrictions", () => {
  let loginPage: LoginPage;
  let projectsPage: ProjectsPage;
  let usersPage: UsersPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    projectsPage = new ProjectsPage(page);
    usersPage = new UsersPage(page);
    await loginPage.goto();
    await loginPage.login("viewer4@flowdash.com", "password123");
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("RBAC Security Check: Verify a VIEWER cannot see the 'Create Project' button", async ({
    page,
  }) => {
    await projectsPage.goto();
    const createProjectButton = page.getByRole("button", {
      name: /Create Project/i,
    });
    await expect(createProjectButton).not.toBeVisible();
  });

  test("Direct URL Access: A VIEWER tries to navigate to /users", async ({
    page,
  }) => {
    await usersPage.goto();
    // Expect to be redirected to the dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page).not.toHaveURL(/.*users/);
  });
});
