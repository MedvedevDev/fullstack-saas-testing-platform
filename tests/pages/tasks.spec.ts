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

  test("Search task  by name", async ({ page }) => {
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
    await tasksPage.verifyAllRows(["Find Me"]);
  });

  test("Search task  by project", async ({ page }) => {
    const projectName = `Search Project ${Date.now()}`;
    const taskFindMe = `Find Me Task ${Date.now()}`;
    const taskFindMe2 = `Find Me Task 2 ${Date.now()}`;
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
      title: taskFindMe2,
      project: projectName,
    });
    await taskModal.submitCreate();
    await tasksPage.verifyTaskVisible(taskFindMe2);

    // Search for the task
    await tasksPage.searchTask(projectName);
    await tasksPage.verifyAllRows([projectName]);
  });

  test("Filter tasks using Dropdowns", async ({ page }) => {
    const projectName = `Dropdown Project ${Date.now()}`;
    const taskHighToDo = "Task High ToDo";
    const taskDoneLow = "Task Done Low";
    const taskMediumDone = "Task Medium Done";
    const taskLowToDo = "Task Low ToDo";
    const taskDoneHigh = "Task DoneHigh";

    await projectsPage.goto();
    await projectsPage.createProject(projectName, "Testing dropdowns");

    await tasksPage.goto();

    // Create Task 1: To Do + High
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskHighToDo,
      project: projectName,
      status: "To Do",
      priority: "High",
    });
    await taskModal.submitCreate();

    // Create Task 2: Done + Low
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskDoneLow,
      project: projectName,
      status: "Done",
      priority: "Low",
    });
    await taskModal.submitCreate();

    // Create Task 3: Done + Medium
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskMediumDone,
      project: projectName,
      status: "Done",
      priority: "Medium",
    });
    await taskModal.submitCreate();

    // Create Task 4: To Do + Low
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskLowToDo,
      project: projectName,
      status: "To Do",
      priority: "Low",
    });
    await taskModal.submitCreate();

    // Create Task 5: Done + High
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskDoneHigh,
      project: projectName,
      status: "Done",
      priority: "High",
    });
    await taskModal.submitCreate();

    //  Filter by "Done" status dropdown
    await tasksPage.setDropdownFilters("Done", undefined);
    await tasksPage.verifyAllRows(["Done"]);
    // Reset dropdowns
    await tasksPage.setDropdownFilters("Any Status", "Any Priority");

    //  Filter by "Medium" priority dropdown
    await tasksPage.setDropdownFilters(undefined, "Medium");
    await tasksPage.verifyAllRows(["Medium"]);
    // Reset dropdowns
    await tasksPage.setDropdownFilters("Any Status", "Any Priority");

    //  Filter by "To Do"  and "Low"
    await tasksPage.setDropdownFilters("To Do", "Low");
    await tasksPage.verifyAllRows(["ToDo", "Low"]);
    // Reset dropdowns
    await tasksPage.setDropdownFilters("Any Status", "Any Priority");
  });
});
