import { test, TEST_SEED_DATA } from '../fixtures';

test.describe('readUsers Permission Flow', () => {
  test('admin grants readUsers permission and user can view user management', async ({
    page,
    pageHelpers,
  }) => {
    await pageHelpers.adminLogin();
    await page.getByRole('link', { name: 'Configurações' }).click();

    // Select the test company
    await page.getByTestId('company-select-trigger').click();
    await page.getByTestId(`company-option-${TEST_SEED_DATA.COMPANY.id}`).click();

    // Click on the test branch card
    await page.getByTestId(`branch-card-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Click the edit button for the user with no permissions
    await page
      .getByTestId(`edit-user-button-${TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.id}`)
      .click();

    // Grant readUsers permission
    await page.getByTestId('permission-readUsers').click();

    // Save changes
    await page.getByTestId('edit-user-submit-button').click();
  });
});
