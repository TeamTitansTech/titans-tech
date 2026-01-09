import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

const TEST_MACHINE_DATA = {
  name: 'Test P2H Machine',
  serial_number: 'TEST001',
  model_year: '2024',
  tonnage: '160',
  stroke: '2.5',
};

test.describe('createMachines Permission Flow', () => {
  test('user with readMachines but no createMachines cannot see create button', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // Create new page for admin to grant only readMachines permission
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants only readMachines permission (not createMachines)
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readMachines'],
    });

    // Close admin page
    await adminPage.close();

    // Login as the user with limited permissions
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to machines page
    await page.goto(`/machines`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Verify user can see machines page content
    await expect(page.getByTestId('machines-page-title')).toBeVisible();
    await expect(page.getByTestId('machines-page-description')).toBeVisible();

    // Verify NoPermission component is not shown
    await expect(page.getByTestId('machines-no-permission')).not.toBeVisible();

    // Verify create button is NOT visible (user lacks createMachines permission)
    await expect(page.getByTestId('new-machine-button')).not.toBeVisible();
  });

  test('user with both readMachines and createMachines can see create button', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // Create new page for admin to grant both permissions
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants both readMachines and createMachines permissions
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readMachines', 'createMachines'],
    });

    // Close admin page
    await adminPage.close();

    // Login as the user with both permissions
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to machines page
    await page.goto(`/machines`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Verify user can see machines page content
    await expect(page.getByTestId('machines-page-title')).toBeVisible();
    await expect(page.getByTestId('machines-page-description')).toBeVisible();

    // Verify NoPermission component is not shown
    await expect(page.getByTestId('machines-no-permission')).not.toBeVisible();

    // Verify create button IS visible (user has createMachines permission)
    await expect(page.getByTestId('new-machine-button')).toBeVisible();
  });

  test('user with createMachines permission can successfully create a machine', async ({
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
      permissions: ['readMachines', 'createMachines'],
    });

    await adminPage.close();

    // Login as user
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to machines page
    await page.goto(`/machines`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Click New Machine button
    await page.getByTestId('new-machine-button').click();

    // Wait for modal to open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select P2H blueprint (by clicking the card)
    await page.getByTestId(`blueprint-card-${TEST_SEED_DATA.BLUEPRINT.P2H.id}`).click();

    // Fill machine name
    await page.locator('#name').fill(TEST_MACHINE_DATA.name);

    // Fill blueprint-specific fields
    await page.locator('#field-serial_number').fill(TEST_MACHINE_DATA.serial_number);
    await page.locator('#field-model_year').fill(TEST_MACHINE_DATA.model_year);
    await page.locator('#field-tonnage').fill(TEST_MACHINE_DATA.tonnage);
    await page.locator('#field-stroke').fill(TEST_MACHINE_DATA.stroke);

    // Submit the form
    await page.getByTestId('machine-creation-submit-button').click();

    // Verify success (modal closes)
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify machine appears in the list
    await expect(page.getByText(TEST_MACHINE_DATA.name)).toBeVisible();
  });
});
