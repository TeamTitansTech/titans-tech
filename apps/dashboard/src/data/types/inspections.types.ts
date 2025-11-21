/**
 * @deprecated This file is deprecated. Use services.types.ts instead.
 *
 * Inspections are now handled as Services with type='INSPECTION'.
 * All types have been migrated to services.types.ts.
 */

// Re-export types from services for backward compatibility
export type {
  Service as Inspection,
  ServiceHistoryItem as InspectionHistoryItem,
  CreateServicePayload as CreateInspectionPayload,
  BearingClearanceData,
  BearingClearanceCheck,
} from './services.types';

// Re-export enums
export { MatingPartType } from './services.types';
