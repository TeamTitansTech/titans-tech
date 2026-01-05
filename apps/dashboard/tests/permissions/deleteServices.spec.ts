import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';
import { SERVICE_TEST_DATA, verifyServiceTabCounts } from '../utils/services';

test.describe('deleteServices Permission Flow', () => {
  test('user with no deleteServices permission cannot see delete button', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // Grant read permissions so user can see services, but no deleteServices
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readMachines', 'readServices'], // No deleteServices permission
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

    // Look for service items and verify delete button is not visible
    const serviceItem = page.getByTestId(
      `upcoming-service-item-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`,
    );
    await expect(serviceItem).toBeVisible();

    // Delete button should not be visible when user lacks deleteServices permission
    await expect(
      page.getByTestId(`delete-service-button-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`),
    ).not.toBeVisible();
  });

  test('user with deleteServices permission can see delete button', async ({
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
      permissions: ['readMachines', 'readServices', 'deleteServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/machines/${TEST_SEED_DATA.MACHINE.P2H}`, {
      subdomain: TEST_SEED_DATA.COMPANY.slug,
    });

    // Look for service items and verify delete button is visible
    const serviceItem = page.getByTestId(
      `upcoming-service-item-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`,
    );
    await expect(serviceItem).toBeVisible();

    // Verify delete button is visible
    const deleteButton = page.getByTestId(
      `delete-service-button-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`,
    );
    await expect(deleteButton).toBeVisible();
  });

  test('user with deleteServices can open delete confirmation dialog', async ({
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
      permissions: ['readMachines', 'readServices', 'deleteServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/machines/${TEST_SEED_DATA.MACHINE.P2H}`, {
      subdomain: TEST_SEED_DATA.COMPANY.slug,
    });

    // Find and click the delete button
    const deleteButton = page.getByTestId(
      `delete-service-button-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`,
    );

    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Verify dialog has cancel and confirm buttons
    const cancelButton = page.getByTestId('cancel-delete-button');
    const confirmButton = page.getByTestId('confirm-delete-button');

    await expect(cancelButton).toBeVisible();
    await expect(confirmButton).toBeVisible();

    // Cancel to close dialog without deleting
    await cancelButton.click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('user with deleteServices can successfully delete a service', async ({
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
      permissions: ['readMachines', 'readServices', 'deleteServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/machines/${TEST_SEED_DATA.MACHINE.P2H}`, {
      subdomain: TEST_SEED_DATA.COMPANY.slug,
    });

    // Find the service item before deletion
    const serviceItem = page.getByTestId(
      `upcoming-service-item-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`,
    );
    await expect(serviceItem).toBeVisible();

    // Click delete button
    const deleteButton = page.getByTestId(
      `delete-service-button-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`,
    );

    await deleteButton.click();

    const confirmButton = page.getByTestId('confirm-delete-button');
    await confirmButton.click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

    // Verify service is no longer visible - should show no services message
    const noServicesMessage = page.getByTestId('no-services-message');
    await expect(noServicesMessage).toBeVisible();
  });

  test('service deletion updates service counts appropriately', async ({
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
      permissions: ['readMachines', 'readServices', 'deleteServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // First check current service count on services page
    await page.goto(`/services`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Verify initial count is 1
    await verifyServiceTabCounts(page, { upcoming: 1 });

    // Go to machine page and delete the service
    await page.goto(`/machines/${TEST_SEED_DATA.MACHINE.P2H}`, {
      subdomain: TEST_SEED_DATA.COMPANY.slug,
    });

    // Delete the service
    const deleteButton = page.getByTestId(
      `delete-service-button-${SERVICE_TEST_DATA.UPCOMING_INSPECTION.id}`,
    );

    await deleteButton.first().click();

    const confirmButton = page.getByTestId('confirm-delete-button');
    await confirmButton.click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

    // Return to services page and verify count decreased to 0
    await page.goto(`/services`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // Verify count is now 0
    await verifyServiceTabCounts(page, { upcoming: 0 });
  });
});
