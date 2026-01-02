import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('assignUsersToBranches Permission Flow', () => {
  test('admin grants readUsers, updateUsers and assignUsersToBranches permissions and user can manage branch assignments', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // First, login as the user without permissions to verify they cannot see branch section
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

    // Create new page for admin to grant readUsers and updateUsers permissions first
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants readUsers and updateUsers permissions first
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readUsers', 'updateUsers'],
    });

    // Go back to user page and reload
    await page.reload();

    // Navigate to settings and verify user can see user management and edit buttons
    await page.getByTestId('client-sidebar-settings').click();
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Verify user can see user management and edit buttons are enabled
    await expect(page.getByTestId('client-branch-user-management')).toBeVisible();
    await expect(page.getByTestId('client-active-users-table')).toBeVisible();

    // Check that edit button is enabled for other users
    const editButton = page.getByTestId(
      `client-edit-user-button-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`,
    );
    await expect(editButton).toBeVisible();
    await expect(editButton).toBeEnabled();

    // Click edit button to open dialog
    await editButton.click();

    // Verify that the edit dialog opens
    await expect(page.getByTestId('edit-user-dialog')).toBeVisible();

    // Verify branch selection section is NOT visible (user doesn't have assignUsersToBranches permission)
    await expect(page.getByTestId('edit-user-branch-selection')).not.toBeVisible();

    // Now admin grants assignUsersToBranches permission
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['assignUsersToBranches'],
      skipLogin: true,
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload again
    await page.reload();

    // Navigate to settings again
    await page.getByTestId('client-sidebar-settings').click();
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Click edit button again
    const enabledEditButton = page.getByTestId(
      `client-edit-user-button-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`,
    );
    await enabledEditButton.click();

    // Verify that the edit dialog opens
    await expect(page.getByTestId('edit-user-dialog')).toBeVisible();

    // Verify branch selection section is NOW visible (user has assignUsersToBranches permission)
    await expect(page.getByTestId('edit-user-branch-selection')).toBeVisible();

    // Verify the submit button is available
    await expect(page.getByTestId('edit-user-submit-button')).toBeVisible();
    await expect(page.getByTestId('edit-user-submit-button')).toBeEnabled();
  });
});
