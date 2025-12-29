import { test, TEST_SEED_DATA } from '../../fixtures';

test('navigate to admin page', async ({ page }) => {
  await page.goto('/admin');
  await page.getByTestId('email-input').fill(TEST_SEED_DATA.SYSADMIN.email);
  await page.getByTestId('password-input').fill(TEST_SEED_DATA.SYSADMIN.password);
  await page.getByTestId('submit-button').click();
  await page.waitForURL('/admin/dashboard');
});
