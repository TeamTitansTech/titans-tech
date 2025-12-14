import { PrismaClientExtended } from './custom-prisma-client';

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientExtended | undefined;
};

const prismaClientExtended =
  globalForPrisma.prisma ??
  new PrismaClientExtended({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClientExtended;

// Export the client with extensions applied
export const prisma = prismaClientExtended;
