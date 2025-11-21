/**
 * Shared Types Package
 * Exports all shared type definitions used across frontend and backend
 * NOTE: DTOs are in packages/shared/backend-dtos - this folder only contains interfaces/types
 *
 * IMPORTANT: This file should only export types that are safe for client components.
 * Service types that depend on Prisma are in ./services (server-only)
 * Service enums (safe for client) are in ./services-enums
 */

// Enums (safe for client components)
export * from './enums';

// Blueprint Types (interfaces only - safe for client)
export * from './blueprints';

// Machine Types (interfaces only - safe for client)
export * from './machines';

// Bearing Clearance Field Types (safe for client)
export * from './bearing-fields';

// NOTE: './services' is NOT exported here because it pulls in Prisma dependencies.
// Server code can import from '@titans-tech/shared/types/services' directly.
