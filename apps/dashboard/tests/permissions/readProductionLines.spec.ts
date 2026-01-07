import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('readProductionLines Permission Flow', () => {
  test('admin grants readProductionLines permission and user can view production lines page', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // First, login as the user without permissions to verify they see empty page
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to production lines page and verify user sees empty state
    await page.goto(`/production-lines`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Verify page content is visible (shows empty page instead of blocking access)
    await expect(page.getByTestId('page-production-lines-title')).toBeVisible();
    await expect(page.getByTestId('page-production-lines-description')).toBeVisible();
    await expect(page.getByTestId('page-branch-filter')).toBeVisible();

    // Verify empty state is shown (no production lines due to no permission)
    await expect(page.getByTestId('page-empty-state')).toBeVisible();

    // Verify create button is NOT visible (user has no create permission)
    await expect(page.getByTestId('page-new-production-line-button')).not.toBeVisible();

    // Verify production lines grid is not visible (empty state shown instead)
    await expect(page.getByTestId('page-production-lines-grid')).not.toBeVisible();

    // Create new page for admin to grant permissions
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants readProductionLines permission
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readProductionLines'],
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload
    await page.reload();

    // Verify user can still see page content
    await expect(page.getByTestId('page-production-lines-title')).toBeVisible();
    await expect(page.getByTestId('page-production-lines-description')).toBeVisible();
    await expect(page.getByTestId('page-branch-filter')).toBeVisible();

    // Verify the test production line is now visible
    await expect(page.getByTestId('card-production-line-test-production-line')).toBeVisible();

    // Verify empty state is no longer shown
    await expect(page.getByTestId('page-empty-state')).not.toBeVisible();

    // Verify production lines grid is now visible
    await expect(page.getByTestId('page-production-lines-grid')).toBeVisible();

    // Verify the create button is still NOT visible (user only has read permission)
    await expect(page.getByTestId('page-new-production-line-button')).not.toBeVisible();
  });
});
