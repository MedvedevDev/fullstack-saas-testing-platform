import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for the Login Authentication flow.
 * Handles interaction with the login form, including credential entry and submission.
 */

export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly welcomeHeader: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.getByRole("button", { name: /sign in/i });

    // Verification elements
    this.welcomeHeader = page.getByRole("heading", { name: /welcome back/i });
    this.errorMessage = page.locator("text=Invalid credentials");
  }

  /**
   * Navigates to the login route.
   * @throws Error if the base URL is not reachable
   */
  async goto() {
    await this.page.goto("/login");
  }

  /**
   * Executes the full login workflow.
   * @param email - User's registered email
   * @param password - User's password
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    await this.loginButton.click();
  }
}
