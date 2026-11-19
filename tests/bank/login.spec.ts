// spec: specs/bank-dashboard.plan.md
import { expect, test } from '../../fixtures/bank/fixtures';
import { adminUser, lockedUser, standardUser } from '../test-credentials';

test.afterEach(async ({ closeBrowser }) => {
  await closeBrowser();
});

test('signs in with valid credentials', async ({ loginPage, dashboardPage }) => {
  await loginPage.expectSignInPage();

  await loginPage.signIn(standardUser.username, standardUser.password);
  await dashboardPage.expectLoaded();
  await expect(dashboardPage.signedInUser(standardUser.username)).toBeVisible();
});

test('signs in an administrator with valid credentials', async ({ loginPage, dashboardPage }) => {
  await loginPage.signIn(adminUser.username, adminUser.password);

  await dashboardPage.expectLoaded();
  await expect(dashboardPage.signedInUser(adminUser.username)).toBeVisible();
});

test('signs in successfully when Remember me is selected', async ({
  loginPage,
  dashboardPage,
}) => {
  await loginPage.signIn(standardUser.username, standardUser.password, true);

  await dashboardPage.expectLoaded();
  await expect(dashboardPage.signedInUser(standardUser.username)).toBeVisible();
});

test('rejects invalid credentials', async ({ loginPage }) => {
  await loginPage.signIn('invalid_user', 'wrong_password');

  await loginPage.expectSignInPage();
  await loginPage.expectError('The username or password you entered is incorrect.');
});

test('rejects a suspended account', async ({ loginPage }) => {
  await loginPage.signIn(lockedUser.username, lockedUser.password);

  await loginPage.expectSignInPage();
  await loginPage.expectError('Your account has been suspended. Please contact support.');
});
