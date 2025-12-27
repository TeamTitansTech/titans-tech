import { test, TEST_SEED_DATA } from '../../fixtures';

test('company admin login', async ({ page }) => {
  await page.goto('/', { subdomain: TEST_SEED_DATA.COMPANY.slug });
  await page.getByTestId('email-input').fill(TEST_SEED_DATA.USERS.COMPANY_ADMIN.email);
  await page.getByTestId('password-input').fill(TEST_SEED_DATA.USERS.COMPANY_ADMIN.password);
  await page.getByTestId('submit-button').click();
  await page.waitForURL('/home', { subdomain: TEST_SEED_DATA.COMPANY.slug });
});

test('employee login', async ({ page }) => {
  await page.goto('/', { subdomain: TEST_SEED_DATA.COMPANY.slug });
  await page.getByTestId('email-input').fill(TEST_SEED_DATA.USERS.EMPLOYEE_SOME_PERMISSIONS.email);
  await page
    .getByTestId('password-input')
    .fill(TEST_SEED_DATA.USERS.EMPLOYEE_SOME_PERMISSIONS.password);
  await page.getByTestId('submit-button').click();
  await page.waitForURL('/home', { subdomain: TEST_SEED_DATA.COMPANY.slug });
});
