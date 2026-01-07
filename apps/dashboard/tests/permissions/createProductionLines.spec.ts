import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToUser } from '../utils/permissions';

// Test data for creating a new production line
const NEW_PRODUCTION_LINE = {
  name: 'Test Created Production Line',
  branchId: TEST_SEED_DATA.BRANCH.id,
};

test.describe('createProductionLines Permission Flow', () => {
  test('admin grants createProductionLines permission and user can create new production line', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // First, login as the user with read permission but no create permission
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to production lines page
    await page.goto(`/production-lines`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Verify user can see page content and existing production lines
    await expect(page.getByTestId('page-production-lines-title')).toBeVisible();
    await expect(page.getByTestId('page-production-lines-description')).toBeVisible();
    await expect(page.getByTestId('page-branch-filter')).toBeVisible();

    // Verify the test production line is visible (user has read permission)
    await expect(page.getByTestId('card-production-line-test-production-line')).toBeVisible();
    await expect(page.getByTestId('page-production-lines-grid')).toBeVisible();

    // Verify create button is NOT visible (user doesn't have create permission yet)
    await expect(page.getByTestId('page-new-production-line-button')).not.toBeVisible();

    // Create new page for admin to grant create permissions
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    // Admin grants createProductionLines permission to the SAME user that's logged in
    await grantPermissionsToUser({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      userId: TEST_SEED_DATA.USERS.EMPLOYEE_SOME_PERMISSIONS.id,
      branchId: TEST_SEED_DATA.BRANCH.id,
      companyId: TEST_SEED_DATA.COMPANY.id,
      permissions: ['createProductionLines'],
    });

    // Close admin page
    // await adminPage.close();

    // Go back to user page and reload
    await page.reload();

    // Verify user can still see page content
    await expect(page.getByTestId('page-production-lines-title')).toBeVisible();
    await expect(page.getByTestId('page-production-lines-description')).toBeVisible();
    await expect(page.getByTestId('page-branch-filter')).toBeVisible();

    // Verify the test production line is still visible
    await expect(page.getByTestId('card-production-line-test-production-line')).toBeVisible();
    await expect(page.getByTestId('page-production-lines-grid')).toBeVisible();

    // Verify the create button is NOW visible (user has create permission)
    await expect(page.getByTestId('page-new-production-line-button')).toBeVisible();

    // Test creating a new production line
    // Click the create button
    await page.getByTestId('page-new-production-line-button').click();

    // Fill in the production line name
    await page.getByTestId('dialog-name-input').fill(NEW_PRODUCTION_LINE.name);

    // Select a branch (should have the test branch pre-selected or available)
    await page.getByTestId('dialog-branch-select').click();
    await page.getByTestId(`dialog-branch-option-${NEW_PRODUCTION_LINE.branchId}`).click();

    // Submit the form
    await page.getByTestId('dialog-submit-button').click();

    // Verify the dialog closes and we see a success state
    await expect(page.getByTestId('dialog-title')).not.toBeVisible();

    // Verify the new production line appears in the list
    // Note: The card test-id is based on the production line ID, which will be generated
    // So we'll check for the name instead or wait for the grid to update
    await page.waitForTimeout(1000); // Wait for optimistic update

    // Verify we now have 2 production lines (the test seed one + the newly created one)
    const productionLineCards = page.getByTestId(/^card-production-line-/);
    await expect(productionLineCards).toHaveCount(2);

    // Verify the new production line name appears somewhere on the page
    await expect(page.getByText(NEW_PRODUCTION_LINE.name)).toBeVisible();

    // Verify we can navigate to the new production line's detail page
    const newProductionLineCard = page.getByText(NEW_PRODUCTION_LINE.name).locator('..');
    await newProductionLineCard.click();

    // Should navigate to the new production line's detail page
    await expect(page).toHaveURL(/\/production-lines\/[^/]+$/);

    // Verify we're on the detail page by checking detail page specific elements
    await expect(page.getByTestId('detail-production-line-name')).toBeVisible();
    await expect(page.getByTestId('detail-tab-view')).toBeVisible();
    await expect(page.getByTestId('detail-tab-config')).toBeVisible();

    // Verify the production line name is displayed correctly on detail page
    await expect(page.getByTestId('detail-production-line-name')).toContainText(
      NEW_PRODUCTION_LINE.name,
    );
  });
});
