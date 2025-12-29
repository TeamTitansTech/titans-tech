/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, Page } from '@playwright/test';
import { PrismaClient } from '@titans-tech/db';
import { PrismaClientExtended } from '@titans-tech/db';
import { TestSeeder } from './test-seed';
import { PageHelpers } from './page';

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
  page: Page & {
    goto: (
      url: string,
      options?: {
        referer?: string;
        timeout?: number;
        waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
        subdomain?: string;
      },
    ) => Promise<void>;
    waitForURL: (
      url: string | RegExp,
      options?: { timeout?: number; subdomain?: string },
    ) => Promise<void>;
  };
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
});

test.beforeEach(async () => {
  await setupDatabase();
});

export { expect } from '@playwright/test';
export { TEST_SEED_DATA } from './test-seed';
export type { PrismaClient, PrismaClientExtended };
