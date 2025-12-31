import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('createUsers Permission Flow', () => {
  test('admin grants readBranches and createUsers permissions and user can add new users', async ({
    page,
    pageHelpers,
    context,
    t,
  }) => {
    const newUserEmail = 'newuser@test.com';
    const newUserName = 'Test New User';
    // First, login as the user without permissions to verify they cannot add users
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to settings and verify user cannot see add user button
    await page.getByTestId('client-sidebar-settings').click();

    // Verify user cannot see add user button (requires readBranches first to see settings page)
    await expect(page.getByTestId('client-add-user-button')).not.toBeVisible();

    // Create new page for admin to grant readBranches permission first
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants readBranches permission first (needed to see the settings page properly)
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readBranches'],
    });

    // Go back to user page and reload
    await page.reload();

    // Navigate to settings and verify user can see settings page but still no add user button
    await page.getByTestId('client-sidebar-settings').click();

    // Verify add user button is still not visible (needs createUsers permission)
    await expect(page.getByTestId('client-add-user-button')).not.toBeVisible();

    // Now admin grants createUsers permission
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['createUsers'],
      skipLogin: true,
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload again
    await page.reload();

    // Navigate to settings again
    await page.getByTestId('client-sidebar-settings').click();

    // Verify add user button is now visible and clickable
    const addUserButton = page.getByTestId('client-add-user-button');
    await expect(addUserButton).toBeVisible();
    await expect(addUserButton).toBeEnabled();

    // Test that the add user button actually works by clicking it
    await addUserButton.click();

    // Verify that the add user dialog opens
    await expect(page.getByTestId('add-user-dialog')).toBeVisible();

    // Fill in the user form to verify the functionality works
    await page.getByTestId('add-user-name-input').fill(newUserName);
    await page.getByTestId('add-user-email-input').fill(newUserEmail);

    // Select at least one branch (required) - use the test branch
    await page.getByTestId(`add-user-branch-checkbox-${TEST_SEED_DATA.BRANCH.id}`).check();

    // Submit the form
    await page.getByTestId('add-user-submit-button').click();

    // Wait for success toast message
    await pageHelpers.expectToastMessage(t.settings.addUserDialog('success'));

    // Wait for dialog to close
    await expect(page.getByTestId('add-user-dialog')).not.toBeVisible();

    // Verify the new user appears in the user management table
    // Navigate to the branch user management to see the new user
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Check if the new user appears in the active users table
    await expect(page.getByTestId('client-active-users-table')).toBeVisible();

    // Look for a user with the email we created
    await expect(
      page.locator('[data-testid*="client-user-email-"]').filter({ hasText: newUserEmail }),
    ).toBeVisible();
  });
});
