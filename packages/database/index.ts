export * from './generated/prisma/client';
export { prisma } from './client';
export * from './src/constants/inspection-sections';
// Client-safe constants (no Prisma dependencies)
export { INSPECTION_SECTION_SLUGS } from './src/constants/inspection-sections.client';
