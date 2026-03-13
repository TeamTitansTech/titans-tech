import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';
import { getTestTranslation } from '../fixtures/translations';

const TEST_MACHINE_NAME = 'Existing P2H Machine';
const UPDATED_MACHINE_DATA = {
  name: 'Updated P2H Machine',
  manufacturer: 'Test Manufacturer',
  sizeTonnage: '175',
};

test.describe('updateMachines Permission Flow', () => {
  test('user with readMachines but no updateMachines cannot see edit button', async ({
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

    // Verify machine is visible but edit button is not
    await expect(machineCard.getByText(TEST_MACHINE_NAME)).toBeVisible();
    await expect(machineCard.getByTestId('machine-card-edit-button')).not.toBeVisible();
  });

  test('user with updateMachines permission can edit machine', async ({
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
      permissions: ['readMachines', 'updateMachines'],
    });

    await adminPage.close();

    // Login as user
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to machines page
    await page.goto(`/machines`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Find the specific machine card and click edit
    const machineCard = page.getByTestId('machine-card-test-machine-p2h');

    await machineCard.getByTestId('machine-card-edit-button').click();

    // Verify edit modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText(
      getTestTranslation('machines.editModal.title'),
    );

    // Update machine details
    await page.locator('#name').fill(UPDATED_MACHINE_DATA.name);
    await page.locator('#manufacturer').fill(UPDATED_MACHINE_DATA.manufacturer);
    await page.locator('#sizeTonnage').fill(UPDATED_MACHINE_DATA.sizeTonnage);

    // Submit the form
    await page.getByTestId('machine-edit-update-button').click();

    // Verify success (modal closes)
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify machine name was updated
    await expect(page.getByText(UPDATED_MACHINE_DATA.name)).toBeVisible();
    await expect(page.getByText(TEST_MACHINE_NAME)).not.toBeVisible();
  });
});
