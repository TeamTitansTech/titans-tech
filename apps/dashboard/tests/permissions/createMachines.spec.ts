import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

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
});
