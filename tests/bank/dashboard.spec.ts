// spec: specs/bank-dashboard.plan.md
import { expect, test } from '../../fixtures/bank/fixtures';
import { standardUser } from '../test-credentials';

test.afterEach(async ({ closeBrowser }) => {
  await closeBrowser();
});

test('shows total net worth after signing in', async ({ loginPage, dashboardPage }) => {
  await loginPage.expectSignInPage();

  await loginPage.signIn(standardUser.username, standardUser.password);
  await dashboardPage.expectLoaded();

  await expect(dashboardPage.totalNetWorthLabel).toBeVisible();
  await expect(dashboardPage.netWorthAmount('$17,050.00')).toBeVisible();
  await expect(dashboardPage.accountSummary(2)).toBeVisible();
});

test('shows the available quick actions', async ({ loginPage, dashboardPage }) => {
  await loginPage.signIn(standardUser.username, standardUser.password);
  await dashboardPage.expectLoaded();

  for (const action of ['Transfer Money', 'Send Money', 'Pay a Bill', 'Apply for Loan', 'Transactions']) {
    await expect(dashboardPage.quickAction(action)).toBeVisible();
  }
});

test('shows recent transaction history', async ({ loginPage, dashboardPage }) => {
  await loginPage.signIn(standardUser.username, standardUser.password);
  await dashboardPage.expectLoaded();

  await expect(dashboardPage.recentTransactions).toBeVisible();
  await expect(dashboardPage.recentTransactions.getByText('Direct Deposit — ACME Corp')).toBeVisible();
});

test('redirects unauthenticated users to login', async ({ page, loginPage }) => {
  await page.goto('/bank/dashboard');

  await loginPage.expectSignInPage();
});

test('logs out and prevents continued dashboard access', async ({
  loginPage,
  dashboardPage,
}) => {
  await loginPage.signIn(standardUser.username, standardUser.password);
  await dashboardPage.expectLoaded();

  await dashboardPage.logout();
  await loginPage.expectSignInPage();
});
