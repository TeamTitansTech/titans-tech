import { test, expect, TEST_SEED_DATA } from './fixtures';

test.describe('Database Tests with Simple Seed', () => {
  test('should create and find company', async ({ db }) => {
    const newCompany = await db.company.create({
      data: {
        name: 'New Test Company',
        slug: 'new-test-company',
        brandColor: '#ff0000',
      },
    });

    const foundCompany = await db.company.findUnique({
      where: { id: newCompany.id },
    });

    expect(foundCompany).toBeDefined();
    expect(foundCompany?.name).toBe('New Test Company');
    expect(foundCompany?.slug).toBe('new-test-company');
  });

  test('should find seeded company', async ({ db }) => {
    const seededCompany = await db.company.findUnique({
      where: { id: TEST_SEED_DATA.COMPANY.id },
    });

    expect(seededCompany).toBeDefined();
    expect(seededCompany?.name).toBe(TEST_SEED_DATA.COMPANY.name);
  });
});
