import { test, expect } from "@playwright/test";
import { LoginPage } from "@support/pages/LoginPage";

test.describe("Auth Security", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("viewer4@flowdash.com", "password123");
  });

  test("should not reveal dashboard after logout and clicking back button", async ({
    page,
  }) => {
    await page.waitForURL(/dashboard/);
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
  });
});
