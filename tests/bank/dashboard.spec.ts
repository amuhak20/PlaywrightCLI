// spec: specs/bank-dashboard.plan.md
import { expect } from '@playwright/test';
import { test } from './fixtures';
import { standardUser } from '../test-credentials';

test.afterEach(async ({ closeBrowser }) => {
  await closeBrowser();
});

test('shows total net worth after signing in', async ({ loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.expectSignInPage();

  await loginPage.signIn(standardUser.username, standardUser.password);
  await dashboardPage.expectLoaded();

  await expect(dashboardPage.totalNetWorthLabel).toBeVisible();
  await expect(dashboardPage.netWorthAmount('$17,050.00')).toBeVisible();
  await expect(dashboardPage.accountSummary(2)).toBeVisible();
});
