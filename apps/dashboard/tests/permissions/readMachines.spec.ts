import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('readMachines Permission Flow', () => {
  test('admin grants readMachines permission and user can view machines page', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // First, login as the user without permissions to verify they cannot see machines
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to machines page and verify user sees NoPermission component
    await page.goto(`/machines`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Verify NoPermission component is shown
    await expect(page.getByTestId('machines-no-permission')).toBeVisible();

    // Verify machines page content is not visible
    await expect(page.getByTestId('machines-page-title')).not.toBeVisible();
    await expect(page.getByTestId('machines-grid')).not.toBeVisible();
    await expect(page.getByTestId('new-machine-button')).not.toBeVisible();

    // Create new page for admin to grant permissions
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants readMachines permission
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readMachines'],
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload
    await page.reload();

    // Verify user can now see machines page content
    await expect(page.getByTestId('machines-page-title')).toBeVisible();
    await expect(page.getByTestId('machines-page-description')).toBeVisible();

    // Verify NoPermission component is no longer shown
    await expect(page.getByTestId('machines-no-permission')).not.toBeVisible();

    // Verify machines page components are visible
    await expect(page.getByTestId('machines-search-input')).toBeVisible();
    await expect(page.getByTestId('machines-branch-filter')).toBeVisible();

    // Verify page title content
    await expect(page.getByTestId('machines-page-title')).toBeVisible();
  });
});
