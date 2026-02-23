import test, { expect } from "@playwright/test";
import { UsersPage } from "./pages/UsersPage";

/**
 * Users Module Tests.
 * Covers the Create, Read (List), Delete and Search.
 * Uses Global Setup for authentication state.
 */
test.describe("Users Page", () => {
  let usersPage: UsersPage;
  let testEmails: string[] = [];

  test.beforeEach(async ({ page }) => {
    usersPage = new UsersPage(page);
    testEmails = [];
    await usersPage.goto();
  });

  test("Test create VIEWER user", async ({ page }) => {
    const firstName = "User";
    const lastName = "Viewer";
    const email = `email${Date.now()}@gma2il.com`;
    testEmails.push(email);

    await usersPage.createUser(firstName, lastName, email, "VIEWER");

    // Verify that user is created with correct Role
    const row = usersPage.usersTableBody
      .getByRole("row")
      .filter({ hasText: email });
    await expect(row.filter({ hasText: "VIEWER" })).toBeVisible();
  });

  test("Test create ADMIN user", async ({ page }) => {
    const firstName = "User";
    const lastName = "Admin";
    const email = `email${Date.now()}@gma2il.com`;
    testEmails.push(email);

    await usersPage.createUser(firstName, lastName, email, "ADMIN");

    // Verify that user is created with correct Role
    const row = usersPage.usersTableBody
      .getByRole("row")
      .filter({ hasText: email });
    await expect(row.filter({ hasText: "ADMIN" })).toBeVisible();
  });

  test("Test create MANAGER user", async ({ page }) => {
    const firstName = "User";
    const lastName = "Manager";
    const email = `email${Date.now()}@gma2il.com`;
    testEmails.push(email);

    await usersPage.createUser(firstName, lastName, email, "MANAGER");

    // Verify that user is created with correct Role
    const row = usersPage.usersTableBody
      .getByRole("row")
      .filter({ hasText: email });
    await expect(row.filter({ hasText: "MANAGER" })).toBeVisible();
  });

  test("Search for a specific user by first and last name", async ({
    page,
  }) => {
    const firstName = "Find";
    const lastName = "Me";
    const email = `email${Date.now()}@gma2il.com`;
    testEmails.push(email);

    await usersPage.createUser(firstName, lastName, email, "MANAGER");

    // Test search by email
    await usersPage.searchUser(`${firstName} ${lastName}`);

    // Verify search
    await usersPage.verifyUserVisible(email);
    const row = usersPage.usersTableBody.getByRole("row");
    await expect(row).toHaveCount(1);
  });

  test("Search for a specific user by email", async ({ page }) => {
    const firstName = "User";
    const lastName = "Manager";
    const email = `email${Date.now()}@gma2il.com`;
    testEmails.push(email);

    await usersPage.createUser(firstName, lastName, email, "MANAGER");

    // Test search by email
    await usersPage.searchUser(email);

    // Verify search
    await usersPage.verifyUserVisible(email);
    const row = usersPage.usersTableBody.getByRole("row");
    await expect(row).toHaveCount(1);
  });

  test("Delete user", async ({ page }) => {
    const firstName = "User";
    const lastName = "Manager";
    const email = `email${Date.now()}@gma2il.com`;

    await usersPage.createUser(firstName, lastName, email, "MANAGER");

    // Delete the user
    await usersPage.deleteUser(email);

    // Verify user is deleted
    const row = usersPage.usersTableBody
      .getByRole("row")
      .filter({ hasText: email });
    await expect(row).toBeHidden();
  });

  test.afterEach(async () => {
    await usersPage.goto();
    for (const email of testEmails) {
      await usersPage.searchUser("");
      await usersPage.deleteUser(email);
    }
  });
});
