import { Page, Locator } from "@playwright/test";

export class SidebarComponent {
  readonly page: Page;
  readonly dashboardLink: Locator;
  readonly projectsLink: Locator;
  readonly tasksListLink: Locator;
  readonly boardViewLink: Locator;
  readonly teamLink: Locator;
  readonly settingsLink: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dashboardLink = page.getByRole("link", { name: /dashboard/i });
    this.projectsLink = page.getByRole("link", { name: /projects/i });
    this.tasksListLink = page.getByRole("link", { name: /tasks list/i });
    this.boardViewLink = page.getByRole("link", { name: /board view/i });
    this.teamLink = page.getByRole("link", { name: /team/i });
    this.settingsLink = page.getByRole("link", { name: /settings/i });
    this.logoutButton = page.getByRole("button", { name: /logout/i });
  }

  async navigateTo(target: string) {
    switch (target) {
      case "Dashboard":
        await this.dashboardLink.click();
        break;
      case "Projects":
        await this.projectsLink.click();
        break;
      case "Tasks List":
        await this.tasksListLink.click();
        break;
      case "Board View":
        await this.boardViewLink.click();
        break;
      case "Team":
        await this.teamLink.click();
        break;
      case "Settings":
        await this.settingsLink.click();
        break;
      default:
        throw new Error(`Invalid navigation: ${target}`);
    }
  }

  async logout() {
    await this.logoutButton.click();
  }
}
