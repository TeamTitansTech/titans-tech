import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('updateBranches Permission Flow', () => {
  test('user with only readBranches permission can see branch settings but cannot modify measurement unit', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // First, login as the user without permissions
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to settings and verify user cannot access branch settings
    await page.getByTestId('client-sidebar-settings').click();

    // Verify user cannot see branch cards at all (no readBranches permission)
    await expect(
      page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`),
    ).not.toBeVisible();

    // Create new page for admin to grant only readBranches permission
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants ONLY readBranches permission (no updateBranches)
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readBranches'],
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload
    await page.reload();

    // Navigate to settings and verify user can now see branch card
    await page.getByTestId('client-sidebar-settings').click();

    // Click on the branch card to expand branch settings
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Verify branch settings section is visible
    await expect(page.getByTestId('branch-settings-section')).toBeVisible();

    // Verify that measurement unit controls are NOT visible (user doesn't have updateBranches permission)
    await expect(page.getByTestId('measurement-unit-trigger')).not.toBeVisible();
    await expect(page.getByTestId('measurement-unit-select')).not.toBeVisible();

    // Verify that the no permission message is displayed instead
    await expect(page.getByTestId('no-update-permission-message')).toBeVisible();
  });

  test('admin grants readBranches and updateBranches permissions and user can modify branch settings', async ({
    page,
    pageHelpers,
    context,
    t,
  }) => {
    // First, login as the user without permissions to verify they cannot see branch settings
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to settings and verify user cannot access branch settings
    await page.getByTestId('client-sidebar-settings').click();

    // Verify user cannot see branch cards at all (no readBranches permission)
    await expect(
      page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`),
    ).not.toBeVisible();

    // Create new page for admin to grant readBranches permission first
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants readBranches permission first (required to see branch settings)
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readBranches'],
    });

    // Go back to user page and reload
    await page.reload();

    // Navigate to settings and verify user can now see branch card
    await page.getByTestId('client-sidebar-settings').click();

    // Click on the branch card to expand branch settings
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Verify branch settings section is visible but verify functionality without updateBranches permission
    await expect(page.getByTestId('branch-settings-section')).toBeVisible();
    await expect(page.getByTestId('measurement-unit-trigger')).toBeVisible();

    // Try to change the measurement unit (this should fail silently or show error without updateBranches permission)
    const measurementUnitTrigger = page.getByTestId('measurement-unit-trigger');
    await measurementUnitTrigger.click();

    // Try to select MM (assuming default is INCHES)
    await page.getByTestId('measurement-unit-mm').click();

    // Now admin grants updateBranches permission
    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['updateBranches'],
      skipLogin: true,
    });

    // Close admin page
    await adminPage.close();

    // Go back to user page and reload
    await page.reload();

    // Navigate to settings and select branch again
    await page.getByTestId('client-sidebar-settings').click();
    await page.getByTestId(`branch-card-client-${TEST_SEED_DATA.BRANCH.id}`).click();

    // Verify branch settings section is visible
    await expect(page.getByTestId('branch-settings-section')).toBeVisible();

    // Test that measurement unit change now works with proper permissions
    const enabledMeasurementUnitTrigger = page.getByTestId('measurement-unit-trigger');
    await enabledMeasurementUnitTrigger.click();

    // Select MM unit
    await page.getByTestId('measurement-unit-mm').click();

    // Wait for success toast message indicating the change was saved
    await pageHelpers.expectToastMessage(t.settings.branchSettings('saved'));

    // Verify the setting was actually saved by checking the display
    // The trigger should now show the selected value
    await expect(enabledMeasurementUnitTrigger).toContainText('mm');

    // Test changing back to INCHES to verify bidirectional functionality
    await enabledMeasurementUnitTrigger.click();
    await page.getByTestId('measurement-unit-inches').click();

    // Wait for success toast again
    await pageHelpers.expectToastMessage(t.settings.branchSettings('saved'));

    // Verify the setting was changed back
    await expect(enabledMeasurementUnitTrigger).toContainText('in');
  });
});
