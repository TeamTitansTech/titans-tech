import { NotFoundException } from '@nestjs/common';

/**
 * Soft Delete Utilities
 * Provides reusable functions for soft delete operations
 */

/**
 * Check if a record is soft-deleted
 * @param record - Record with deletedAt field
 * @returns true if the record is deleted, false otherwise
 */
export function isDeleted(record: { deletedAt: Date | null } | null): boolean {
  if (!record) return true;
  return record.deletedAt !== null;
}

/**
 * Validate that a record exists and is not soft-deleted
 * Throws NotFoundException if the record is null or deleted
 * @param record - Record to validate
 * @param resourceName - Name of the resource for error message
 */
export function validateNotDeleted(
  record: { deletedAt: Date | null } | null,
  resourceName: string,
): void {
  if (!record || record.deletedAt !== null) {
    throw new NotFoundException(`${resourceName} not found`);
  }
}

/**
 * Build a filter to exclude soft-deleted records
 * Adds deletedAt: null to the where clause
 * @param where - Existing where clause
 * @returns Where clause with deletedAt: null
 */
export function withoutDeleted<T extends Record<string, unknown>>(
  where?: T,
): T & { deletedAt: null } {
  return {
    ...where,
    deletedAt: null,
  } as T & { deletedAt: null };
}

/**
 * Generate the data object for soft delete
 * @returns Object with deletedAt set to current date
 */
export function softDeleteData(): { deletedAt: Date } {
  return { deletedAt: new Date() };
}
