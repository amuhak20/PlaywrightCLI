// spec: specs/bank-dashboard.plan.md
import { expect } from '@playwright/test';
import { test } from './fixtures';
import { standardUser } from '../test-credentials';

test.afterEach(async ({ closeBrowser }) => {
  await closeBrowser();
});

test('signs in with valid credentials', async ({ loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.expectSignInPage();

  await loginPage.signIn(standardUser.username, standardUser.password);
  await dashboardPage.expectLoaded();
  await expect(dashboardPage.signedInUser(standardUser.username)).toBeVisible();
});
