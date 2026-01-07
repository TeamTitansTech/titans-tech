import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';
import { SERVICE_TEST_DATA } from '../utils/services';

test.describe('updateServices Permission Flow', () => {
  test('user with no updateServices permission cannot click service cards', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // Grant readServices permission so user can see services, but no updateServices
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readMachines', 'readServices'], // No updateServices permission
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/machines/${TEST_SEED_DATA.MACHINE.P2H}`, {
      subdomain: TEST_SEED_DATA.COMPANY.slug,
    });

    // Verify user can see the machine page and services
    await expect(page.getByTestId('upcoming-services-list')).toBeVisible();

    // Look for service items in the upcoming services section - when no updateServices permission,
    // service items should not have cursor-pointer class and should not be clickable

    // Service should be visible but not clickable (no hover effects or cursor pointer)
    const serviceItem = page.getByTestId(
      `upcoming-service-item-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`,
    );
    await expect(serviceItem).toBeVisible();

    // Try clicking the service - should not open modal since updateServices is false
    await serviceItem.click();

    // Verify no modal opens (service completion modal should not appear)
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('user with updateServices permission can click service cards and open completion modal', async ({
    page,
    pageHelpers,
    context,
  }) => {
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readMachines', 'readServices', 'updateServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/machines/${TEST_SEED_DATA.MACHINE.P2H}`, {
      subdomain: TEST_SEED_DATA.COMPANY.slug,
    });

    // Find and click a service item
    const serviceItem = page.getByTestId(
      `upcoming-service-item-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`,
    );
    await expect(serviceItem).toBeVisible();

    // Click the service to open completion modal
    await serviceItem.click();

    // Verify service completion modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
