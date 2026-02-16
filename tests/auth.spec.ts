import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test.describe("Athentication Module", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    loginPage.goto();
  });

  /**
   * Positive Test: Verifies that a user with valid credentials can access the dashboard.
   * Critical User Journey (CUJ) for all user roles.
   */
  test("should allow access with valid admin credentials", async ({ page }) => {
    await loginPage.login("admin@flowdash.com", "password123");

    // Verification: URL transition and visibility of the dashboard header
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(loginPage.welcomeHeader).toBeVisible();
  });

  /**
   * Negative Test: Validates security feedback for incorrect passwords.
   */
  test("should display error message for invalid credentials", async ({
    page,
  }) => {
    await loginPage.login("admin@flowdash.com", "WRONG_PASS");

    // Ensure we remained on the login page
    await expect(page).toHaveURL(/.*login/);

    // Verify error message displayed
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
