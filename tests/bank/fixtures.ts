import { test as base } from '@playwright/test';
import { DashboardPage } from '../../pages/bank/dashboard-page';
import { LoginPage } from '../../pages/bank/login-page';

type BankFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  closeBrowser: () => Promise<void>;
};

export const test = base.extend<BankFixtures>({
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
