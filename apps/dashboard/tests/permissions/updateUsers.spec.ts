import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('updateUsers Permission Flow', () => {
  test('admin grants readUsers and updateUsers permissions and user can edit other users', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // First, login as the user without permissions to verify they cannot edit users
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to settings and verify user cannot access user management
    await page.getByTestId('client-sidebar-settings').click();

    // Verify user cannot see user management at all
    await expect(
      page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`),
    ).not.toBeVisible();
    await expect(page.getByTestId('client-branch-user-management')).not.toBeVisible();

    // Create new page for admin to grant readUsers permission first
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants readUsers permission first
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readUsers'],
    });

    // Go back to user page and reload
    await page.reload();

    // Navigate to settings and verify user can see user management but cannot edit
    await page.getByTestId('client-sidebar-settings').click();
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Verify user can see user management but edit buttons are disabled
    await expect(page.getByTestId('client-branch-user-management')).toBeVisible();
    await expect(page.getByTestId('client-active-users-table')).toBeVisible();

    // Check that edit buttons exist but are disabled for other users
    // We'll check for the employee with all permissions as an example
    const editButton = page.getByTestId(
      `client-edit-user-button-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`,
    );
    await expect(editButton).toBeVisible();
    await expect(editButton).toBeDisabled();

    // Now admin grants updateUsers permission
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['updateUsers'],
      skipLogin: true,
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload again
    await page.reload();

    // Navigate to settings again
    await page.getByTestId('client-sidebar-settings').click();
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Verify edit buttons are now enabled and clickable
    const enabledEditButton = page.getByTestId(
      `client-edit-user-button-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`,
    );
    await expect(enabledEditButton).toBeVisible();
    await expect(enabledEditButton).toBeEnabled();

    // Test that the edit button actually works by clicking it
    await enabledEditButton.click();

    // Verify that the edit dialog opens
    await expect(page.getByTestId('edit-user-dialog')).toBeVisible();
  });
});
