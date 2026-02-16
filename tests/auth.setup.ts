import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

// Save browser cookies later
const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Perform the Login
  await loginPage.goto();
  await loginPage.login("admin@flowdash.com", "password123");

  // Wait until we are redirected to the dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  // Save the storage state (cookies, local storage) to a file
  await page.context().storageState({ path: authFile });
});
