// spec: specs/bank-dashboard.plan.md
import { test } from './fixtures';
import { standardUser } from '../test-credentials';

test.beforeEach(async ({ page }) => {
  await page.goto('/bank/dashboard', { waitUntil: 'domcontentloaded' });

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.goto('/bank/dashboard', { waitUntil: 'domcontentloaded' });
  }
});

test.afterEach(async ({ page }) => {
  await page.context().close();
});

test('should-verify-total-net-worth', async ({ loginPage, dashboardPage }) => {
  // 1. Open the dashboard and verify the sign-in page.
  await loginPage.expectSignInPage();

  // 2. Sign in with the standard test account.
  await loginPage.signIn(standardUser.username, standardUser.password);
  await dashboardPage.expectLoaded();

  // 3. Check the total net worth summary.
  await dashboardPage.expectTotalNetWorth('$17,050.00', 2);
});
