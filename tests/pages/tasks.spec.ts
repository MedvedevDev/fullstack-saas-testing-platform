import { test, expect } from "@playwright/test";
import { TaskModal } from "./TaskModal";
import { TasksPage } from "./TasksPage";
import { ProjectsPage } from "./ProjectsPage";

test.describe("Global Tasks Page", () => {
  let taskModal: TaskModal;
  let tasksPage: TasksPage;
  let projectsPage: ProjectsPage;

  test.beforeEach(async ({ page }) => {
    taskModal = new TaskModal(page);
    tasksPage = new TasksPage(page);
    projectsPage = new ProjectsPage(page);
  });

  test("Search for a specific task", async ({ page }) => {
    const projectName = `Search Project ${Date.now()}`;
    const taskFindMe = `Find Me Task ${Date.now()}`;
    const taskHideMe = `Hidden Task ${Date.now()}`;

    await projectsPage.goto();
    await projectsPage.createProject(projectName, "Testing search");

    await tasksPage.goto();

    // Create first task
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskFindMe,
      project: projectName,
    });
    await taskModal.submitCreate();
    await tasksPage.verifyTaskVisible(taskFindMe);
    // Create second task
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskHideMe,
      project: projectName,
    });
    await taskModal.submitCreate();
    await tasksPage.verifyTaskVisible(taskHideMe);

    // Search for the task
    await tasksPage.searchTask("find me");
    await tasksPage.verifyAllRowsAfterSearch(["Find Me"]);
  });
});
