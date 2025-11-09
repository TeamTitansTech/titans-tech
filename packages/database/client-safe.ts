/**
 * Client-safe exports for @titans-tech/db
 * This file does NOT export Prisma client or runtime, making it safe for browser use
 */

// Export only the client-safe constants
export { INSPECTION_SECTION_SLUGS } from './src/constants/inspection-sections.client';

// Export types that are safe for client use (they're just TypeScript types, no runtime code)
export type { InspectionSectionSlug } from './src/constants/inspection-sections.client';
