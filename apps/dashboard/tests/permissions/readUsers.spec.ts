import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('readUsers Permission Flow', () => {
  test('admin grants readUsers permission and user can view user management', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // First, login as the user without permissions to verify they cannot see user management
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to settings and verify user cannot see user management elements
    await page.getByTestId('client-sidebar-settings').click();

    // Verify branch card is not visible or user management components are not accessible
    await expect(
      page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`),
    ).not.toBeVisible();
    await expect(page.getByTestId('client-branch-user-management')).not.toBeVisible();
    await expect(page.getByTestId('client-active-users-table')).not.toBeVisible();

    // Create new page for admin to grant permissions
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants readUsers permission
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readUsers'],
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload
    await page.reload();

    // Navigate to settings again and verify user can now see user management
    await page.getByTestId('client-sidebar-settings').click();
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Verify user management section is now visible
    await expect(page.getByTestId('client-branch-user-management')).toBeVisible();
    await expect(page.getByTestId('client-active-users-table')).toBeVisible();
  });
});
