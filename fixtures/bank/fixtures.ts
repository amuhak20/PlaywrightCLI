import { test as base } from '@playwright/test';
import { DashboardPage } from '../../pages/bank/dashboard-page';
import { LoginPage } from '../../pages/bank/login-page';

export { expect } from '@playwright/test';

type BankFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  closeBrowser: () => Promise<void>;
};

export const test = base.extend<BankFixtures>({
  page: async ({ page }, use) => {
    await page.goto('/bank/login');
    await use(page);
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  closeBrowser: async ({ context }, use) => {
    await use(() => context.close());
  },
});
