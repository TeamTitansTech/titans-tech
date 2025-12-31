/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import { PrismaClient } from '@titans-tech/db';
import { PrismaClientExtended } from '@titans-tech/db';
import { TestSeeder } from './test-seed';
import { ExtendedPage, PageHelpers } from './page';
import { testTranslations } from './translations';

async function setupDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL,
      },
    },
  });

  await prisma.$connect();
  const seeder = new TestSeeder(prisma);
  await seeder.cleanup();
  await seeder.seed();
  await prisma.$disconnect();
}

type AllFixtures = {
  db: PrismaClient;
  dbWithSoftDelete: PrismaClientExtended;
  pageHelpers: PageHelpers;
  t: typeof testTranslations;
  page: ExtendedPage;
};

export const test = base.extend<AllFixtures>({
  page: async ({ page }, use) => {
    const pageHelpers = new PageHelpers(page);
    pageHelpers.setupGotoOverride();
    await use(page);
  },

  pageHelpers: async ({ page }, use) => {
    const pageHelpers = new PageHelpers(page);
    pageHelpers.setupGotoOverride();
    await use(pageHelpers);
  },

  db: async ({}, use) => {
    await setupDatabase();
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });
    await prisma.$connect();
    await use(prisma);
    await prisma.$disconnect();
  },

  dbWithSoftDelete: async ({}, use) => {
    await setupDatabase();
    const prismaExtended = new PrismaClientExtended({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });
    await prismaExtended.$connect();
    await use(prismaExtended);
    await prismaExtended.$disconnect();
  },

  // Translation object
  t: async ({}, use) => {
    await use(testTranslations);
  },
});

test.beforeEach(async ({ context }) => {
  await setupDatabase();

  await context.addCookies([
    {
      name: 'NEXT_LOCALE',
      value: 'pt',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'NEXT_LOCALE',
      value: 'pt',
      domain: '.localhost', // Wildcard subdomain support
      path: '/',
    },
  ]);
});

export { expect } from '@playwright/test';
export { TEST_SEED_DATA } from './test-seed';
export { testTranslations } from './translations';
export type { PrismaClient, PrismaClientExtended };
