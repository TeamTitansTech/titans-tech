import { test, expect, TEST_SEED_DATA } from './fixtures';

test.describe('Database Connection Test', () => {
  test('should connect to database and have seeded data', async ({ db }) => {
    const company = await db.company.findFirst();
    expect(company).toBeDefined();
    expect(company?.name).toBe(TEST_SEED_DATA.COMPANY.name);
  });

  test('should have both regular and extended client working', async ({ db, dbWithSoftDelete }) => {
    const regularCount = await db.company.count();
    const extendedCount = await dbWithSoftDelete.company.count();

    expect(regularCount).toBe(extendedCount);
    expect(regularCount).toBeGreaterThan(0);
  });
});
