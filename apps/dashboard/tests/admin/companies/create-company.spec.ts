import { test } from '../../fixtures';

test('should show company in the list after creating company', async ({ page, pageHelpers }) => {
  const companyName = 'New company';
  const companySlug = 'slug';

  await pageHelpers.adminLogin();
  await page.getByTestId('admin-sidebar-companies').click();
  await page.getByTestId('create-company-button').click();
  await page.getByTestId('company-name-input').fill(companyName);
  await page.getByTestId('company-slug-input').fill(companySlug);
  await page.getByTestId('company-creation-submit').click();
  await page.getByTestId('companies-grid').getByText(companyName).isVisible();
});

test('should show slug validation error when creating company with existing slug', async ({
  page,
  pageHelpers,
  db,
}) => {
  const existingCompanySlug = 'existing-company';
  await db.company.create({
    data: {
      name: 'Existing Company',
      slug: existingCompanySlug,
      brandColor: '#ff0000',
    },
  });

  await pageHelpers.adminLogin();
  await page.getByTestId('admin-sidebar-companies').click();
  await page.getByTestId('create-company-button').click();
  await page.getByTestId('company-name-input').fill('Another Company');
  await page.getByTestId('company-slug-input').fill(existingCompanySlug);
  await page.getByTestId('company-creation-submit').click();
  await page.locator('.toast').getByText('Falha ao criar empresa').isVisible();
});
