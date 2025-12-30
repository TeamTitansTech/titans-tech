import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('deleteUsers Permission Flow', () => {
  test('admin grants readUsers and deleteUsers permissions and user can delete other users', async ({
    page,
    pageHelpers,
    context,
    t,
  }) => {
    // First, login as the user without permissions to verify they cannot delete users
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

    // Navigate to settings and verify user can see user management but cannot delete
    await page.getByTestId('client-sidebar-settings').click();
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Verify user can see user management but delete buttons are disabled
    await expect(page.getByTestId('client-branch-user-management')).toBeVisible();
    await expect(page.getByTestId('client-active-users-table')).toBeVisible();

    // Check that delete buttons exist but are disabled for other users
    // We'll check for the employee with all permissions as an example
    const deleteButton = page.getByTestId(
      `client-delete-user-button-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`,
    );
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeDisabled();

    // Now admin grants deleteUsers permission
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['deleteUsers'],
      skipLogin: true,
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload again
    await page.reload();

    // Navigate to settings again
    await page.getByTestId('client-sidebar-settings').click();
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Verify delete buttons are now enabled and clickable
    const enabledDeleteButton = page.getByTestId(
      `client-delete-user-button-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`,
    );
    await expect(enabledDeleteButton).toBeVisible();
    await expect(enabledDeleteButton).toBeEnabled();

    // Test that the delete button actually works by clicking it
    await enabledDeleteButton.click();

    // Verify that the delete dialog opens
    await expect(page.getByTestId('delete-user-dialog')).toBeVisible();

    // Verify user info is shown in the dialog
    await expect(page.getByTestId('delete-dialog-user-email')).toContainText(
      TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.email,
    );

    // Select delete scope (branch level deactivation)
    await page.getByTestId('delete-scope-select').click();
    await page.getByTestId('delete-scope-branch').click();

    // Confirm the deletion
    await page.getByTestId('confirm-delete-button').click();

    // Wait for success toast message
    await pageHelpers.expectToastMessage(t.settings.deleteUserDialog('success'));

    // Wait for success and dialog to close
    await expect(page.getByTestId('delete-user-dialog')).not.toBeVisible();

    // Verify the user is no longer in the active users table
    await expect(
      page.getByTestId(`client-user-row-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`),
    ).not.toBeVisible();

    // Verify the user appears in the deactivated users section
    await expect(page.getByTestId('client-deactivated-users-section')).toBeVisible();
    await expect(
      page.getByTestId(
        `client-deactivated-user-row-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`,
      ),
    ).toBeVisible();

    // Verify the deactivated user has the correct information
    await expect(
      page.getByTestId(
        `client-deactivated-user-name-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`,
      ),
    ).toContainText(TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.name);
    await expect(
      page.getByTestId(
        `client-deactivated-user-email-${TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.id}`,
      ),
    ).toContainText(TEST_SEED_DATA.USERS.EMPLOYEE_ALL_PERMISSIONS.email);
  });
});
