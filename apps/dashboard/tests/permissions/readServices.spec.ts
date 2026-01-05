import { test, expect, TEST_SEED_DATA } from '../fixtures';
import { PageHelpers } from '../fixtures/page';
import { grantPermissionsToTestEmployee } from '../utils/permissions';
import {
  SERVICE_TEST_DATA,
  verifyServiceExists,
  verifyServiceTabCounts,
  verifyHomePageServices,
} from '../utils/services';

test.describe('readServices Permission Flow', () => {
  test('user with no readServices permission sees empty services page', async ({
    page,
    pageHelpers,
  }) => {
    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/services`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // User can access services page but sees no services due to permission filtering
    await expect(page.getByTestId('services-page-title')).toBeVisible();

    // Verify no service cards are visible
    await verifyServiceExists(page, SERVICE_TEST_DATA.UPCOMING_INSPECTION, { shouldExist: false });
    await verifyServiceExists(page, SERVICE_TEST_DATA.COMPLETED_INSPECTION, { shouldExist: false });
  });

  test('user with readServices permission can access services page and see service cards', async ({
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
      permissions: ['readServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/services`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    await expect(page.getByTestId('services-page-title')).toBeVisible();
    await expect(page.getByTestId('services-page-description')).toBeVisible();

    // Verify both upcoming and completed services are visible (helper will navigate to correct tabs)
    await verifyServiceExists(page, SERVICE_TEST_DATA.UPCOMING_INSPECTION);
    await verifyServiceExists(page, SERVICE_TEST_DATA.COMPLETED_INSPECTION);
  });

  test('user with readServices can see correct service counts in tabs', async ({
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
      permissions: ['readServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/services`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    // First click on "All" tab to ensure we're in the right state for count verification
    const allTab = page.getByTestId('services-tab-all');
    await allTab.click();

    // Verify tab counts are correct
    await verifyServiceTabCounts(page, {
      upcoming: 1,
      history: 1,
      all: 2,
    });

    // Test tab navigation and service visibility
    const upcomingTab = page.getByTestId('services-tab-upcoming');
    const historyTab = page.getByTestId('services-tab-history');

    // Click upcoming tab and verify only upcoming services are shown
    await upcomingTab.click();
    await verifyServiceExists(page, SERVICE_TEST_DATA.UPCOMING_INSPECTION, {
      skipTabNavigation: true,
    });
    await verifyServiceExists(page, SERVICE_TEST_DATA.COMPLETED_INSPECTION, {
      shouldExist: false,
      skipTabNavigation: true,
    });

    // Click history tab and verify only completed services are shown
    await historyTab.click();
    await verifyServiceExists(page, SERVICE_TEST_DATA.COMPLETED_INSPECTION, {
      skipTabNavigation: true,
    });
    await verifyServiceExists(page, SERVICE_TEST_DATA.UPCOMING_INSPECTION, {
      shouldExist: false,
      skipTabNavigation: true,
    });
  });

  test('user with readServices can see service metrics on HomePage', async ({
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
      permissions: ['readServices'],
    });

    await adminPage.close();

    await pageHelpers.companyUserLogin(
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.email,
      TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.password,
    );

    await page.goto(`/home`, { subdomain: TEST_SEED_DATA.COMPANY.slug });

    await verifyHomePageServices(page, 1, true);
  });
});
