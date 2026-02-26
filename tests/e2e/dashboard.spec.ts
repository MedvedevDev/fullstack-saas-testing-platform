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

    // Create new user
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
});
