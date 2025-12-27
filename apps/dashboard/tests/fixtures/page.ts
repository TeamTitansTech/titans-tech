import { Page } from '@playwright/test';
import { TEST_SEED_DATA } from './test-seed';

export class PageHelpers {
  constructor(private page: Page) {}

  async adminLogin() {
    await this.page.goto('/admin');
    await this.page.getByTestId('email-input').fill(TEST_SEED_DATA.SYSADMIN.email);
    await this.page.getByTestId('password-input').fill(TEST_SEED_DATA.SYSADMIN.password);
    await this.page.getByTestId('submit-button').click();
    await this.page.waitForURL('/admin/dashboard');
  }

  async expectToastMessage(message: string) {
    await this.page.locator('.toast').getByText(message).isVisible();
  }

  setupGotoOverride() {
    const originalGoto = this.page.goto;
    const originalWaitForURL = this.page.waitForURL;

    this.page.goto = async (
      url: string,
      options?: {
        referer?: string;
        timeout?: number;
        waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
        subdomain?: string;
      },
    ) => {
      if (!url.startsWith('http')) {
        const subdomain = options?.subdomain;
        const baseUrl = subdomain ? `http://${subdomain}.localhost:3000` : 'http://localhost:3000';
        url = `${baseUrl}${url}`;
      }
      return originalGoto.call(this.page, url, options);
    };

    this.page.waitForURL = async (
      url: string | RegExp | ((url: URL) => boolean),
      options?: {
        timeout?: number;
        waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
        subdomain?: string;
      } & { subdomain?: string },
    ) => {
      if (typeof url === 'string' && !url.startsWith('http')) {
        const subdomain = options?.subdomain;
        const baseUrl = subdomain ? `http://${subdomain}.localhost:3000` : 'http://localhost:3000';
        url = `${baseUrl}${url}`;
      }
      return originalWaitForURL.call(this.page, url, options);
    };
  }
}
