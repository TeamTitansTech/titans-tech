import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('readBranches Permission Flow', () => {
  test('admin grants readBranches permission and user can view branches in company page', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // First, login as the user without permissions to verify they cannot see branches
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to company page
    await page.getByTestId('client-sidebar-company').click();

    // Wait for company page to load
    await expect(page.getByTestId('company-branches-section')).toBeVisible();

    // Verify user cannot see branches (should show 0 branches due to lack of readBranches permission)
    await expect(page.getByTestId('company-total-branches-count')).toContainText('0');

    // Verify no branches message is displayed
    await expect(page.getByTestId('company-no-branches-message')).toBeVisible();

    // Verify branches grid is not visible (since there are no branches to display)
    await expect(page.getByTestId('company-branches-grid')).not.toBeVisible();

    // Create new page for admin to grant permissions
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants readBranches permission
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readBranches'],
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload
    await page.reload();

    // Navigate to company page again
    await page.getByTestId('client-sidebar-company').click();

    // Verify user can now see branches
    await expect(page.getByTestId('company-branches-section')).toBeVisible();

    // Verify branches count is now greater than 0 (should show at least the test branch)
    await expect(page.getByTestId('company-total-branches-count')).not.toContainText('0');

    // Verify no branches message is no longer visible
    await expect(page.getByTestId('company-no-branches-message')).not.toBeVisible();

    // Verify branches grid is now visible
    await expect(page.getByTestId('company-branches-grid')).toBeVisible();

    // Verify specific test branch card is visible
    await expect(page.getByTestId(`company-branch-card-${TEST_SEED_DATA.BRANCH.id}`)).toBeVisible();
  });
});
