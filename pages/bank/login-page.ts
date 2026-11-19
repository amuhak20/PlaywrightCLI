import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly signInButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: 'Remember me' });
    this.signInButton = page.getByRole('button', { name: 'Sign in to SecureBank' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/bank/login');
  }

  async expectSignInPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/bank\/login$/);
    await expect(this.page.getByRole('heading', { name: 'SecureBank' })).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async signIn(username: string, password: string, rememberMe = false): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    await this.signInButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.page.getByRole('alert').filter({ hasText: message })).toBeVisible();
  }
}
