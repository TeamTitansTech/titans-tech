import type { Page } from '@playwright/test';
import type { BranchPermissionType } from '@titans-tech/shared/types';
import type { PageHelpers } from '../fixtures/page';
import { TEST_SEED_DATA } from '../fixtures/test-seed';

interface PermissionGrantOptions {
  page: Page;
  pageHelpers: PageHelpers;
  userId: string;
  branchId: string;
  companyId: string;
  permissions: BranchPermissionType[];
  skipLogin?: boolean;
}

/**
 * Grants specific permissions to a user in a branch through the admin interface
 */
export async function grantPermissionsToUser({
  page,
  pageHelpers,
  userId,
  branchId,
  companyId,
  permissions,
  skipLogin = false,
}: PermissionGrantOptions): Promise<void> {
  // Login as admin only if not skipping login
  if (!skipLogin) {
    await pageHelpers.adminLogin();
  }

  if (skipLogin) {
    await page.reload();
  }
  await page.getByTestId('admin-sidebar-settings').click();
  await page.waitForURL('/admin/settings');
  // Select the company
  await page.getByTestId('company-select-trigger').click();
  await page.getByTestId(`company-option-${companyId}`).click();

  // Click on the branch card
  await page.getByTestId(`branch-card-${branchId}`).click();

  // Click the edit button for the specified user
  await page.getByTestId(`edit-user-button-${userId}`).click();

  // Grant each permission
  for (const permission of permissions) {
    await page.getByTestId(`permission-${permission}`).click();
  }

  // Save changes
  await page.getByTestId('edit-user-submit-button').click();
}

/**
 * Convenience function to grant permissions to the test employee with no permissions
 */
export async function grantPermissionsToTestEmployee(args: {
  page: Page;
  pageHelpers: PageHelpers;
  permissions: BranchPermissionType[];
  skipLogin?: boolean;
}): Promise<void> {
  return grantPermissionsToUser({
    page: args.page,
    pageHelpers: args.pageHelpers,
    userId: TEST_SEED_DATA.USERS.EMPLOYEE_NO_PERMISSIONS.id,
    branchId: TEST_SEED_DATA.BRANCH.id,
    companyId: TEST_SEED_DATA.COMPANY.id,
    permissions: args.permissions,
    skipLogin: args.skipLogin,
  });
}
