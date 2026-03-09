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

    const nav = page.locator("nav");
    const aside = page.locator("aside");

    this.dashboardLink = nav.getByRole("link", { name: /dashboard/i });
    this.projectsLink = nav.getByRole("link", { name: /projects/i });
    this.tasksListLink = nav.getByRole("link", { name: /tasks list/i });
    this.boardViewLink = nav.getByRole("link", { name: /board view/i });
    this.teamLink = nav.getByRole("link", { name: /team/i });
    this.settingsLink = nav.getByRole("link", { name: /settings/i });
    this.logoutButton = aside.getByRole("button", { name: /logout/i });
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
