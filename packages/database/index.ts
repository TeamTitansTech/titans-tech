export * from './generated/prisma/client';
export { prisma } from './client';
export * from './src/constants/service-sections';
// Client-safe constants (no Prisma dependencies)
export { SERVICE_SECTION_SLUGS } from './src/constants/service-sections.client';
export * from './constants';
export { PrismaClientExtended } from './custom-prisma-client';
