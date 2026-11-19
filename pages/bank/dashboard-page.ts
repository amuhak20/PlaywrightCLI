import { expect, type Locator, type Page } from '@playwright/test';

export class DashboardPage {
  private readonly mainNavigation: Locator;
  private readonly totalNetWorthLabelLocator: Locator;
  private readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.mainNavigation = page.getByRole('navigation', { name: 'Main navigation' });
    this.totalNetWorthLabelLocator = page.getByText('Total Net Worth', { exact: true });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
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

  quickAction(label: string): Locator {
    return this.page.getByRole('link').filter({ hasText: label }).first();
  }

  get recentTransactions(): Locator {
    return this.page.getByRole('table', { name: 'Recent transactions' });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  get totalNetWorthLabel(): Locator {
    return this.totalNetWorthLabelLocator;
  }
}
