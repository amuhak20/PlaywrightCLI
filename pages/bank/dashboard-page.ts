import { expect, type Locator, type Page } from '@playwright/test';

export class DashboardPage {
  private readonly mainNavigation: Locator;
  private readonly totalNetWorthLabelLocator: Locator;

  constructor(private readonly page: Page) {
    this.mainNavigation = page.getByRole('navigation', { name: 'Main navigation' });
    this.totalNetWorthLabelLocator = page.getByText('Total Net Worth', { exact: true });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/bank\/dashboard$/);
  }

  signedInUser(username: string): Locator {
    return this.mainNavigation.getByText(username, { exact: true });
  }

  netWorthAmount(value: string): Locator {
    return this.page.getByText(value, { exact: true });
  }

  accountSummary(accountCount: number): Locator {
    return this.page.getByText(`Across ${accountCount} accounts`, { exact: true });
  }

  get totalNetWorthLabel(): Locator {
    return this.totalNetWorthLabelLocator;
  }
}
