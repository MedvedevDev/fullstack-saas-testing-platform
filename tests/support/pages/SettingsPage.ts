import { Page, Locator, expect } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveButton: Locator;
  readonly successMessage: Locator;
  readonly failedMessage: Locator;
  readonly shortPasswordMessage: Locator;
  readonly headerName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByLabel(/first name/i);
    this.lastNameInput = page.getByLabel(/last name/i);
    this.emailInput = page.getByLabel(/email address/i);
    this.newPasswordInput = page.getByLabel(/new password/i);
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.saveButton = page.getByRole("button", { name: /save changes/i });
    this.successMessage = page.getByText("Profile updated successfully!");
    this.failedMessage = page.getByText("Passwords do not match!");
    this.shortPasswordMessage = page.getByText(
      "Password must be at least 6 characters.",
    );

    this.headerName = page.locator("header span");
  }

  /**
   * Navigates to the settings URL
   */
  async goto() {
    await this.page.goto("/settings");
    await expect(this.saveButton).toBeVisible();
  }

  /**
   * Updates user first name and last name
   */
  async updateName(firstName: string, lastName: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.saveButton.click();
  }
}
