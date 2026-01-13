import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';

test.describe('createServices Permission Flow', () => {
  test('user with no createServices permission cannot see New Service button', async ({
    page,
    pageHelpers,
    context,
  }) => {
    // Grant readServices permission so user can access machine detail page
    const adminPage = await context.newPage();
    const adminPageHelpers = new PageHelpers(adminPage);
    adminPageHelpers.setupGotoOverride();

    await grantPermissionsToTestEmployee({
      page: adminPage,
      pageHelpers: adminPageHelpers,
      permissions: ['readMachines', 'readServices'], // No createServices permission
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    // Navigate to machine detail page
    await page.goto(`/machines/${TEST_SEED_DATA.MACHINE.P2H}`, {
      subdomain: TEST_SEED_DATA.COMPANY.slug,
    });

    // Verify New Service button is not visible
    await expect(page.getByTestId('new-service-button')).not.toBeVisible();
  });

  test('user with createServices permission can see and use New Service button', async ({
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
      permissions: ['readMachines', 'readServices', 'createServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/machines/${TEST_SEED_DATA.MACHINE.P2H}`, {
      subdomain: TEST_SEED_DATA.COMPANY.slug,
    });

    // Verify New Service button is visible and clickable
    await expect(page.getByTestId('new-service-button')).toBeVisible();

    // Click the button to open service creation modal
    await page.getByTestId('new-service-button').click();

    // Verify service creation modal opens
    await expect(page.getByTestId('create-service-dialog-title')).toBeVisible();

    // Verify modal contains service creation form elements
    await expect(page.getByTestId('service-date-input')).toBeVisible();
    await expect(page.getByTestId('service-type-select')).toBeVisible();
    await expect(page.getByTestId('create-service-submit-button')).toBeVisible();
  });

  test('user with createServices can successfully create a new service', async ({
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
      permissions: ['readMachines', 'readServices', 'createServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/machines/${TEST_SEED_DATA.MACHINE.P2H}`, {
      subdomain: TEST_SEED_DATA.COMPANY.slug,
    });

    // Click New Service button
    await page.getByTestId('new-service-button').click();

    // Wait for modal to be fully loaded
    await expect(page.getByTestId('create-service-dialog-title')).toBeVisible();

    // Submit the form (date picker should have a default future date, service type defaults to inspection)
    await page.getByTestId('create-service-submit-button').click();

    // Wait for success indication and modal to close
    await expect(page.getByTestId('create-service-dialog-title')).not.toBeVisible({
      timeout: 10000,
    });

    // Verify the new service appears in the upcoming services list
    // The service should be visible in the upcoming services section
    const upcomingServicesSection = page.getByTestId('upcoming-services-list');
    await expect(upcomingServicesSection).toBeVisible();

    // Check that at least one service item is visible (should include our newly created service)
    const serviceItems = upcomingServicesSection.locator('[data-testid^="upcoming-service-item-"]');
    await expect(serviceItems).toHaveCount(2); // 1 existing + 1 newly created
  });
});
