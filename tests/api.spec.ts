import { test } from "@playwright/test";
import { ApiHelper } from "../utils/ApiHelper";

test("API helpers for data setup and teardown", async ({ request }) => {
  const api = new ApiHelper(request);
  const timestamp = Date.now();
  const userEmail = `test.user.${timestamp}@test.com`;
  const projectName = `API Project ${timestamp}`;
  const taskTitle = `API Task ${timestamp}`;

  // 1. Login as Admin
  await api.login("admin@flowdash.com", "password123");

  // 2. Create a test user
  const user = await api.createUser("API", "User", userEmail, "VIEWER");

  // 3. Create a test project
  const project = await api.createProject(projectName, "Created for API test");

  // 4. Create a test task
  await api.createTask(project.id, taskTitle);

  // 5. Cleanup
  await api.deleteProject(project.id);
  await api.deleteUser(user.id);
});
