import { test, expect } from "@playwright/test";
import { SettingsPage } from "./pages/SettingsPage";
import { faker } from "@faker-js/faker";

/**
 * Settings Module Tests.
 * Covers the update name and password validations
 */
test.describe("Settings Page @regression", () => {
  test.setTimeout(60000);
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
    await settingsPage.goto();
  });

  test("Verify email field is disabled @settings", async () => {
    await expect(settingsPage.emailInput).toBeDisabled();
  });

  test("Update profile name @settings", async ({ page }) => {
    const newName = faker.person.firstName();
    const newLastName = faker.person.lastName();

    await settingsPage.updateName(newName, newLastName);
    await expect(settingsPage.successMessage).toBeVisible();

    await page.reload();

    await expect(settingsPage.headerName).toContainText(
      `${newName} ${newLastName}`,
    );
  });

  test("Update with mismatched passwords @negative @settings", async () => {
    await settingsPage.newPasswordInput.fill("password123");
    await settingsPage.confirmPasswordInput.fill("wrongpassword");
    await settingsPage.saveButton.click();

    // Verify the alert is shown
    await expect(settingsPage.failedMessage).toBeVisible();
  });

  test("Update with short passwords @negative @settings", async () => {
    await settingsPage.newPasswordInput.fill("111");
    await settingsPage.confirmPasswordInput.fill("111");
    await settingsPage.saveButton.click();

    // Verify the alert is shown
    await expect(settingsPage.shortPasswordMessage).toBeVisible();
  });
});
