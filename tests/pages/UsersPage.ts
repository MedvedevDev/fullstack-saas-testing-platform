import { Page, Locator, expect } from "@playwright/test";

export class UsersPage {
  readonly page: Page;
  readonly createUserButton: Locator;
  // Modal Locators
  readonly userNameInput: Locator;
  readonly userLastnameInput: Locator;
  readonly userPasswordInput: Locator;
  readonly userEmailInput: Locator;
  readonly userRole: Locator;
  readonly createButton: Locator;
  readonly usersTableBody: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createUserButton = page.getByRole("button", { name: /add user/i });
    // Modal Locators
    this.userNameInput = page.locator("form").getByLabel(/first name/i);
    this.userLastnameInput = page.locator("form").getByLabel(/last name/i);
    this.userPasswordInput = page.locator("form").getByLabel(/password/i);
    this.userEmailInput = page.locator("form").getByLabel(/email address/i);
    this.userRole = page.locator("form").getByLabel(/assign role/i);
    this.createButton = page
      .locator("form")
      .getByRole("button", { name: /create user/i });

    this.usersTableBody = page.locator("tbody");
  }

  /**
   * ### Navigates to the Users route.
   * @throws Error if the base URL is not reachable
   */
  async goto() {
    await this.page.goto("/users");
    await expect(this.createUserButton).toBeVisible();
  }

  /**
   * ### Creates a new user
   */
  async createUser(
    name: string,
    lastName: string,
    email: string,
    role: string,
  ) {
    await this.createUserButton.click();
    await expect(this.userNameInput).toBeVisible();

    await this.userNameInput.fill(name);
    await this.userLastnameInput.fill(lastName);
    await this.userPasswordInput.fill("TestPass123!");
    await this.userEmailInput.fill(email);
    await this.userRole.selectOption({ value: role });

    await this.createButton.click();
    await expect(this.createButton).toBeHidden();
  }

  /**
   * Search by name and email
   */
  async searchUser(text: string) {
    await this.page.getByRole("textbox", { name: /Search users/i }).fill(text);
    await this.page.waitForTimeout(500);
  }

  async verifyUserVisible(email: string) {
    const row = this.usersTableBody.getByRole("row").filter({ hasText: email });
    await expect(row).toBeVisible();
  }

  /**
   * Finds a user by email and deletes
   */
  async deleteUser(email: string) {
    const row = this.usersTableBody.getByRole("row").filter({ hasText: email });
    const deleteButton = row.getByRole("button", { name: /delete user/i });
    this.page.once("dialog", (dialog) => dialog.accept());

    await deleteButton.click();
    await this.page.waitForTimeout(500);
  }
}
