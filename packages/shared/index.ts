// NOTE: backend-dtos is NOT exported here to avoid pulling Prisma dependencies into client code
// Server code can import from '@titans-tech/shared/backend-dtos' or '@titans-tech/shared/types/services' directly

// Export only client-safe types
export * from './types';
