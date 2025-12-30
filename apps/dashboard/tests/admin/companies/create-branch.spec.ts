import { test, expect, TEST_SEED_DATA } from '../../fixtures';

test('should create a branch with name only', async ({ page, pageHelpers, t }) => {
  const branchName = 'New Branch';

  await pageHelpers.adminLogin();
  await page.getByTestId('admin-sidebar-companies').click();

  await page.getByTestId('companies-grid').getByText(TEST_SEED_DATA.COMPANY.name).click();

  await page.getByTestId('create-branch-button').click();

  await page.getByTestId('branch-name-input').fill(branchName);
  await page.getByTestId('branch-creation-submit').click();

  const successMessage = t.companies('createBranch.success');
  await pageHelpers.expectToastMessage(successMessage);

  await expect(page.getByText(branchName)).toBeVisible();
});

test('should create a branch with name and location', async ({ page, pageHelpers, t }) => {
  const branchName = 'Branch with Location';
  const branchLocation = 'São Paulo, SP';

  await pageHelpers.adminLogin();
  await page.getByTestId('admin-sidebar-companies').click();

  await page.getByTestId('companies-grid').getByText(TEST_SEED_DATA.COMPANY.name).click();

  await page.getByTestId('create-branch-button').click();

  await page.getByTestId('branch-name-input').fill(branchName);
  await page.getByTestId('branch-location-input').fill(branchLocation);
  await page.getByTestId('branch-creation-submit').click();

  const successMessage = t.companies('createBranch.success');
  await pageHelpers.expectToastMessage(successMessage);

  await expect(page.getByText(branchName)).toBeVisible();
  await expect(page.getByText(branchLocation)).toBeVisible();
});

test('should create main branch and unset previous main branch', async ({
  page,
  pageHelpers,
  t,
}) => {
  const newMainBranchName = 'New Main Branch';

  await pageHelpers.adminLogin();
  await page.getByTestId('admin-sidebar-companies').click();

  await page.getByTestId('companies-grid').getByText(TEST_SEED_DATA.COMPANY.name).click();

  await expect(page.getByText(TEST_SEED_DATA.BRANCH.name)).toBeVisible();
  await expect(page.getByTestId('branch-main-badge')).toBeVisible();

  await page.getByTestId('create-branch-button').click();

  await page.getByTestId('branch-name-input').fill(newMainBranchName);
  await page.getByTestId('branch-main-checkbox').check();
  await page.getByTestId('branch-creation-submit').click();

  const successMessage = t.companies('createBranch.success');
  await pageHelpers.expectToastMessage(successMessage);

  await expect(page.getByText(newMainBranchName)).toBeVisible();

  // Verify that only one main branch badge exists
  await expect(page.getByTestId('branch-main-badge')).toHaveCount(1);

  // Verify the main badge is in the new branch card (not the old one)
  const newBranchCard = page
    .getByTestId('branches-grid')
    .locator(`[data-testid*="branch-card-"]`, { hasText: newMainBranchName });
  await expect(newBranchCard.getByTestId('branch-main-badge')).toBeVisible();

  await expect(page.getByTestId('branches-grid').getByText(newMainBranchName)).toBeVisible();
});

test('should show validation error for empty branch name', async ({ page, pageHelpers, t }) => {
  await pageHelpers.adminLogin();
  await page.getByTestId('admin-sidebar-companies').click();

  await page.getByTestId('companies-grid').getByText(TEST_SEED_DATA.COMPANY.name).click();

  await page.getByTestId('create-branch-button').click();

  await page.getByTestId('branch-creation-submit').click();

  const errorMessage = t.validation('branchNameRequired');
  await expect(page.getByText(errorMessage)).toBeVisible();
});

test('should close dialog when clicking cancel', async ({ page, pageHelpers }) => {
  await pageHelpers.adminLogin();
  await page.getByTestId('admin-sidebar-companies').click();

  await page.getByTestId('companies-grid').getByText(TEST_SEED_DATA.COMPANY.name).click();

  await page.getByTestId('create-branch-button').click();

  await expect(page.getByTestId('create-branch-dialog')).toBeVisible();

  await page.getByTestId('branch-creation-cancel').click();

  await expect(page.getByTestId('create-branch-dialog')).not.toBeVisible();
});
