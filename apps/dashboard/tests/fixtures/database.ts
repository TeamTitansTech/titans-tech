/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import { PrismaClient } from '@titans-tech/db';
import { PrismaClientExtended } from '@titans-tech/db';
import { TestSeeder } from './test-seed';

type DatabaseFixtures = {
  db: PrismaClient;
  dbWithSoftDelete: PrismaClientExtended;
};

export const test = base.extend<DatabaseFixtures>({
  db: async ({}, use) => {
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

    await use(prisma);
    await prisma.$disconnect();
  },

  dbWithSoftDelete: async ({}, use) => {
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

export { expect } from '@playwright/test';
export { TEST_SEED_DATA } from './test-seed';
export type { PrismaClient, PrismaClientExtended };
