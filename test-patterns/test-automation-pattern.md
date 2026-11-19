# Test Automation Patterns

This project uses Playwright Test with the Page Object Model (POM) to keep page-specific selectors and interactions reusable, and test scenarios easy to read.

## Project structure

Create one page object for each web page in `pages/`. Put its test specifications in `tests/`, grouped by the same feature or area:

```text
pages/
  bank/
    login-page.ts
    dashboard-page.ts
fixtures/
  bank/
    fixtures.ts
tests/
  bank/
    login.spec.ts
    dashboard.spec.ts
```

Keep the page object and its related tests in their respective folders. A page object should represent one page (or a distinct reusable part of the application), not a whole end-to-end scenario. When adding a page, add its page object under `pages/` and its behavior tests under `tests/`.

## Page object standards

- Implement page objects as TypeScript classes that receive Playwright's `Page` in their constructor.
- Keep locators and page-specific UI interactions in the page object so selectors have one source of truth.
- Prefer resilient, user-facing locators such as `getByRole`, `getByLabel`, and `getByText`. Use test IDs when they are the appropriate stable contract. Avoid brittle selectors tied to DOM structure or styling.
- Expose meaningful, reusable actions such as `signIn()` or `open()`, rather than making tests repeat low-level locator operations.
- Keep a page object's API focused on that page. Share common behavior through existing helpers or fixtures where appropriate instead of duplicating it across page objects.
- Use Playwright's `Locator` and `Page` types, and make asynchronous methods return `Promise<void>` when they do not return a value.
- Page objects may provide focused page-state expectations (for example, `expectLoaded()`) when that improves reuse. Keep scenario-specific outcome assertions in the test.

```ts
import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  async signIn(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
```

## Test standards

- Write Playwright Test specifications in `tests/`, using the `.spec.ts` suffix.
- Test user-visible behavior and outcomes; use page objects for the steps that interact with the UI.
- Keep each test focused on a behavior and give it a descriptive name. Avoid depending on the order in which tests run.
- Use Playwright's web-first assertions (`expect(locator).toBeVisible()`, `toHaveText()`, `toHaveURL()`, and similar) to wait for and verify UI state.
- Use fixtures to provide page objects or shared setup when several tests need the same construction. Use Playwright's isolated test context rather than sharing mutable browser state between tests.
- Keep test data and credentials out of page objects; supply them to test actions or fixtures.

```ts
import { expect, test } from '../../fixtures/bank/fixtures';
import { standardUser } from '../test-credentials';

test('signs in with valid credentials', async ({ loginPage, dashboardPage }) => {
  await loginPage.expectSignInPage();
  await loginPage.signIn(standardUser.username, standardUser.password);

  await expect(dashboardPage.signedInUser(standardUser.username)).toBeVisible();
});
```

## Fixture standards

- Store reusable custom Playwright fixtures in `fixtures/`, grouped by feature or area. Specs should import the extended `test` from the appropriate fixture module.
- Extend Playwright's base `test` with `test.extend<Fixtures>()` and define a TypeScript type for the fixtures it provides. Export the extended `test` so multiple specs can share the same fixtures.
- Compose page objects from Playwright's built-in `page` fixture. Keep each fixture focused and use fixture dependencies rather than creating separate browser pages or contexts manually.
- Override the `page` fixture to perform common navigation or setup once when all tests in that fixture group need the same starting state. Tests should rely on that setup rather than repeat it.
- Fixtures are on-demand and test-scoped by default. Keep test state isolated; use worker-scoped fixtures only for resources intentionally shared by tests in the same worker.
- For fixtures that own resources, put setup before `await use(value)` and required teardown after it, in the same fixture. Prefer fixtures over paired hooks when setup and cleanup belong together.
- Playwright manages the built-in `page`, `context`, and `browser` lifecycles. Do not close the shared `browser` from a test; use `context` for test-scoped browser cleanup when explicit early closure is required.

```ts
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
```

For the rationale and a fuller implementation example, see the official [Playwright Page Object Models guide](https://playwright.dev/docs/pom).
For fixture design and lifecycle details, see the official [Playwright fixtures guide](https://playwright.dev/docs/test-fixtures).
