/**
 * Client-safe exports for @titans-tech/db
 * This file does NOT export Prisma client or runtime, making it safe for browser use
 */

// Export only the client-safe constants
export { SERVICE_SECTION_SLUGS } from './src/constants/service-sections.client';

// Export types that are safe for client use (they're just TypeScript types, no runtime code)
export type { ServiceSectionSlug } from './src/constants/service-sections.client';
