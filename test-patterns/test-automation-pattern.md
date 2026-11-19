# Test Automation Patterns

This project uses Playwright Test with the Page Object Model (POM) to keep page-specific selectors and interactions reusable, and test scenarios easy to read.

## Project structure

Create one page object for each web page in `pages/`. Put its test specifications in `tests/`, grouped by the same feature or area:

```text
pages/
  bank/
    login-page.ts
    dashboard-page.ts
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
import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/bank/login-page';

test('signs in with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await page.goto('/bank/login');
  await loginPage.signIn('standard-user', 'example-password');

  await expect(page).toHaveURL(/\/bank\/dashboard$/);
});
```

For the rationale and a fuller implementation example, see the official [Playwright Page Object Models guide](https://playwright.dev/docs/pom).
