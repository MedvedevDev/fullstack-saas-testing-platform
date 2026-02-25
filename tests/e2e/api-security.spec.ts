import { test, expect } from "@playwright/test";
import { ApiHelper } from "../../utils/ApiHelper";

test.describe("API Security & Authorization @e2e @api", () => {
  test("Viewer cannot delete a project via API", async ({ request }) => {
    const projectName = `API Project ${Date.now()}`;
    // Admin creates a project
    const adminApi = new ApiHelper(request);
    await adminApi.login("admin@flowdash.com", "password123");
    const project = await adminApi.createProject(projectName, "Test Descr");

    // Create a Viewer user
    const viewerEmail = `user${Date.now()}@mail.net`;
    const viewerUser = await adminApi.createUser(
      "TestName",
      "TestLastName",
      viewerEmail,
      "VIEWER",
    );

    //  Login as Viewer
    const userApi = new ApiHelper(request);
    await userApi.login(viewerEmail, "password123");

    // Delete the project as Viewer
    const response = await userApi.request.delete(
      `${userApi.baseUrl}/projects/${project.id}`,
      {
        headers: {
          Authorization: `Bearer ${userApi.token}`,
        },
      },
    );

    // Verify that user can not delete the project | 403 Forbidden
    expect(response.status()).toEqual(403);

    // 6. Cleanup (Admin deletes the data)
    await adminApi.deleteProject(project.id);
    await adminApi.deleteUser(viewerUser.id);
  });
});
