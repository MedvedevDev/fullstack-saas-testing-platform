import { test, expect } from "@playwright/test";
import { TaskModal } from "./pages/TaskModal";
import { TasksPage } from "./pages/TasksPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { UsersPage } from "./pages/UsersPage";

function getFutureDate(monthsAhead: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAhead);
  return date.toISOString().split("T")[0];
}

test.describe("Global Tasks Page", () => {
  test.setTimeout(120000);
  let taskModal: TaskModal;
  let tasksPage: TasksPage;
  let projectsPage: ProjectsPage;
  let usersPage: UsersPage;
  let testProjects: string[] = []; // projects array to delete clean up

  test.beforeEach(async ({ page }) => {
    taskModal = new TaskModal(page);
    tasksPage = new TasksPage(page);
    projectsPage = new ProjectsPage(page);
    usersPage = new UsersPage(page);
    testProjects = [];
  });

  test("Search task  by name", async ({ page }) => {
    const projectName = `Search Project ${Date.now()}`;
    testProjects.push(projectName);
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
    testProjects.push(projectName);
    const taskFindMe = `Find Me Task ${Date.now()}`;
    const taskFindMe2 = `Find Me Task 2 ${Date.now()}`;

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

  test("Search task by assignee name", async ({ page }) => {
    const projectName = `Search Project by Assignee ${Date.now()}`;
    testProjects.push(projectName);
    const taskFindMe = `Find Me Task ${Date.now()}`;
    const firstName = "Christiano";
    const lastName = "Ronaldo";
    const fullName = `${firstName} ${lastName}`;
    const email = `auto.user${Date.now()}@test.com`;
    // Create the project
    await projectsPage.goto();
    await projectsPage.createProject(projectName, "Testing search by Assignee");

    // Create the user
    await usersPage.goto();
    await usersPage.createUser(firstName, lastName, email);

    // Create the task
    await tasksPage.goto();
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskFindMe,
      project: projectName,
      assignee: fullName,
    });
    await taskModal.submitCreate();

    // Test search by assignee
    await tasksPage.searchTask(fullName);

    // Verify search
    await tasksPage.verifyTaskVisible(taskFindMe);
    await tasksPage.verifyAllRows([fullName]);
  });

  test("Filter tasks using Dropdowns", async ({ page }) => {
    const projectName = `Dropdown Project ${Date.now()}`;
    testProjects.push(projectName);
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

  test("Filter tasks using Checkboxs", async ({ page }) => {
    const projectName = `Dropdown Project ${Date.now()}`;
    testProjects.push(projectName);
    const taskHighToDo = "Checkbox High ToDo";
    const taskDoneLow = "Checkbox Done Low";
    const taskMediumDone = "Checkbox Medium Done";
    const taskLowToDo = "Checkbox Low ToDo";
    const taskDoneHigh = "Checkbox DoneHigh";
    const taskInProgressHigh = "Checkbox In Progress High";

    await projectsPage.goto();
    await projectsPage.createProject(projectName, "Testing checkboxes");

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

    // Create Task 6: In Progress + High
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskInProgressHigh,
      project: projectName,
      status: "In Progress",
      priority: "High",
    });
    await taskModal.submitCreate();

    //  Filter by "Done" status checkbox
    await tasksPage.toggleCheckbox("Done");
    await tasksPage.verifyTaskVisible(taskDoneHigh);
    await tasksPage.verifyAllRows(["Done"]);
    // Reset dropdowns
    await tasksPage.untoggleCheckbox("Done");

    //  Filter by "Medium" priority checkbox
    await tasksPage.toggleCheckbox("Medium");
    await tasksPage.verifyTaskVisible(taskMediumDone);
    await tasksPage.verifyAllRows(["Medium"]);
    // Reset dropdowns
    await tasksPage.untoggleCheckbox("Medium");

    //  Filter by "In Progress"  +  "High"
    await tasksPage.toggleCheckbox("High");
    await tasksPage.toggleCheckbox("In Progress");
    await tasksPage.verifyTaskVisible(taskInProgressHigh);
    await tasksPage.verifyAllRows(["High", "In Progress"]);
    // Reset dropdowns
    await tasksPage.untoggleCheckbox("High");
    await tasksPage.untoggleCheckbox("In Progress");

    //  Filter by "In Progress"  + "To Do" + "High"
    await tasksPage.toggleCheckbox("High");
    await tasksPage.toggleCheckbox("In Progress");
    await tasksPage.toggleCheckbox("To Do");
    await tasksPage.verifyTaskVisible(taskInProgressHigh);
    await tasksPage.verifyTaskVisible(taskHighToDo);
    //Verify that 'Done' task is not visible
    const doneRow = tasksPage.tasksTableBody
      .getByRole("row")
      .filter({ hasText: taskDoneHigh });
    await expect(doneRow).toBeHidden();
    // Reset dropdowns
    await tasksPage.untoggleCheckbox("High");
    await tasksPage.untoggleCheckbox("In Progress");
    await tasksPage.untoggleCheckbox("To Do");
  });

  test("Edit and Delete a Task", async ({ page }) => {
    const projectName = `Project To Edit And Delete ${Date.now()}`;
    testProjects.push(projectName);
    const taskName = "Task to Edit";
    const updatedName = "Task is Updated";

    await projectsPage.goto();
    await projectsPage.createProject(projectName, "Testing manage");
    await tasksPage.goto();

    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({ title: taskName, project: projectName });
    await taskModal.submitCreate();

    // Edit the task
    const taskRow = tasksPage.tasksTableBody
      .getByRole("row")
      .filter({ hasText: taskName });
    const editButton = taskRow.getByRole("button", { name: /edit task/i });
    await editButton.hover();
    await editButton.click();
    await taskModal.fillTaskDetails({ title: updatedName, priority: "High" });
    await taskModal.submitEdit();

    // Verify task is updated
    await tasksPage.verifyTaskVisible(updatedName);
    await expect(
      tasksPage.tasksTableBody.getByRole("row").filter({ hasText: taskName }),
    ).toBeHidden();

    // Delete the task
    page.once("dialog", (dialog) => dialog.accept());
    const updatedRow = tasksPage.tasksTableBody
      .getByRole("row")
      .filter({ hasText: updatedName });
    const deleteButton = updatedRow.getByRole("button", {
      name: /delete task/i,
    });
    await deleteButton.hover();
    await deleteButton.click();

    // Verify task is deleted
    await expect(updatedRow).toBeHidden();
  });

  test("Sort tasks by Status", async ({ page }) => {
    const projectName = `Sort Project ${Date.now()}`;
    testProjects.push(projectName);

    const taskToDo = `To Do task ${Date.now()}`;
    const taskInProgress = `In Progress Task ${Date.now()}`;
    const taskDone = `Done task ${Date.now()}`;

    await projectsPage.goto();
    await projectsPage.createProject(projectName, "Sorting tasks");

    // Setup tasks
    await tasksPage.goto();
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskToDo,
      project: projectName,
      status: "To Do",
    });
    await taskModal.submitCreate();

    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskInProgress,
      project: projectName,
      status: "In Progress",
    });
    await taskModal.submitCreate();

    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskDone,
      project: projectName,
      status: "Done",
    });
    await taskModal.submitCreate();

    // Hide seeded data
    await tasksPage.searchTask(projectName);

    // Sort Ascending
    await tasksPage.clickSortHeader("sort-status");
    let sortedTasks = await tasksPage.getSortedTaskTitles();
    expect(sortedTasks).toEqual([taskDone, taskInProgress, taskToDo]);

    // Sort Descending
    await tasksPage.clickSortHeader("sort-status");
    sortedTasks = await tasksPage.getSortedTaskTitles();
    expect(sortedTasks).toEqual([taskToDo, taskInProgress, taskDone]);
  });

  test("Sort tasks by Due Date", async ({ page }) => {
    // Generate  future dates
    const date1Month = getFutureDate(1);
    const date2Month = getFutureDate(2);
    const date6Month = getFutureDate(6);

    const projectName = `Sort Project ${Date.now()}`;
    testProjects.push(projectName);

    const task_6_MonthAhead = `6 Month Ahead ${Date.now()}`;
    const task_1_MonthAhead = `1 Month Ahead ${Date.now()}`;
    const task_2_MonthAhead = `2 Month Ahead ${Date.now()}`;

    await projectsPage.goto();
    await projectsPage.createProject(projectName, "Sorting tasks");

    // Setup tasks
    await tasksPage.goto();
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: task_6_MonthAhead,
      project: projectName,
      dueDate: date6Month,
    });
    await taskModal.submitCreate();

    await tasksPage.goto();
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: task_1_MonthAhead,
      project: projectName,
      dueDate: date1Month,
    });
    await taskModal.submitCreate();

    await tasksPage.goto();
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: task_2_MonthAhead,
      project: projectName,
      dueDate: date2Month,
    });
    await taskModal.submitCreate();

    // Hide seeded data
    await tasksPage.searchTask(projectName);

    // Sort Ascending
    await tasksPage.clickSortHeader("sort-dueDate");
    let sortedTasks = await tasksPage.getSortedTaskTitles();
    expect(sortedTasks).toEqual([
      task_1_MonthAhead,
      task_2_MonthAhead,
      task_6_MonthAhead,
    ]);

    // Sort Descending
    await tasksPage.clickSortHeader("sort-dueDate");
    sortedTasks = await tasksPage.getSortedTaskTitles();
    expect(sortedTasks).toEqual([
      task_6_MonthAhead,
      task_2_MonthAhead,
      task_1_MonthAhead,
    ]);
  });

  test("Sort tasks by creation date", async ({ page }) => {
    const projectName = `Sort Project ${Date.now()}`;
    testProjects.push(projectName);

    const taskFirst = `First Task ${Date.now()}`;
    const taskSecond = `Second Task ${Date.now()}`;
    const taskThird = `Third Task ${Date.now()}`;

    await projectsPage.goto();
    await projectsPage.createProject(projectName, "Sorting tasks");

    // Setup tasks
    await tasksPage.goto();
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskFirst,
      project: projectName,
    });
    await taskModal.submitCreate();
    await page.waitForTimeout(1000);

    await tasksPage.goto();
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskSecond,
      project: projectName,
    });
    await taskModal.submitCreate();
    await page.waitForTimeout(1000);

    await tasksPage.goto();
    await tasksPage.createTaskButton.click();
    await taskModal.fillTaskDetails({
      title: taskThird,
      project: projectName,
    });
    await taskModal.submitCreate();
    await page.waitForTimeout(1000);

    // Hide seeded data
    await tasksPage.searchTask(projectName);

    // Sort Ascending (Oldest to Newest)
    await tasksPage.clickSortHeader("sort-createdAt");
    let sortedTasks = await tasksPage.getSortedTaskTitles();
    expect(sortedTasks).toEqual([taskFirst, taskSecond, taskThird]);

    // Sort Ascending (Newest to Oldest)
    await tasksPage.clickSortHeader("sort-createdAt");
    sortedTasks = await tasksPage.getSortedTaskTitles();
    expect(sortedTasks).toEqual([taskThird, taskSecond, taskFirst]);
  });

  test.afterEach(async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.goto();

    const allProjectTitles = await page
      .getByRole("heading", { level: 3 })
      .allInnerTexts();

    // Delete all test projects
    for (const name of testProjects) {
      await projectsPage.deleteProject(name);
    }
  });
});
