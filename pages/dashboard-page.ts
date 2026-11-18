import { expect, type Page } from '@playwright/test';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/bank\/dashboard$/);
  }

  async expectSignedInAs(username: string): Promise<void> {
    await this.expectLoaded();
    await expect(
      this.page.getByRole('navigation', { name: 'Main navigation' }).getByText(username, { exact: true }),
    ).toBeVisible();
  }

  async expectTotalNetWorth(value: string, accountCount: number): Promise<void> {
    await expect(this.page.getByText('Total Net Worth', { exact: true })).toBeVisible();
    await expect(this.page.getByText(value, { exact: true })).toBeVisible();
    await expect(this.page.getByText(`Across ${accountCount} accounts`, { exact: true })).toBeVisible();
  }
}
