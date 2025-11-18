import { PrismaClient } from './generated/prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file from the database package directory
config({ path: resolve(__dirname, '.env') });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
