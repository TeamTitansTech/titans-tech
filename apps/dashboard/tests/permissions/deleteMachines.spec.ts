import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

const TEST_MACHINE_NAME = 'Existing P2H Machine';

test.describe('deleteMachines Permission Flow', () => {
  test('user with readMachines but no deleteMachines cannot see delete button', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // Grant only readMachines permission
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readMachines'],
    });

    await adminPage.close();

    // Login as user
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to machines page
    await page.goto(`/machines`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Find the specific machine card
    const machineCard = page.getByTestId('machine-card-test-machine-p2h');

    // Verify machine is visible but delete button is not
    await expect(machineCard.getByText(TEST_MACHINE_NAME)).toBeVisible();
    await expect(machineCard.getByTestId('machine-card-delete-button')).not.toBeVisible();
  });

  test('user with deleteMachines permission can delete machine', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // Grant both permissions
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readMachines', 'deleteMachines'],
    });

    await adminPage.close();

    // Login as user
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to machines Page
    await page.goto(`/machines`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Find the specific machine card and click delete
    const machineCard = page.getByTestId('machine-card-test-machine-p2h');

    await machineCard.getByTestId('machine-card-delete-button').click();

    // Confirm deletion
    await page.getByTestId('machine-delete-confirm-button').click();

    // Verify success (dialog closes and machine is removed)
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(TEST_MACHINE_NAME)).not.toBeVisible();
  });
});
