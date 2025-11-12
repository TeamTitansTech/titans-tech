/**
 * Service Types
 * Re-exports from shared package
 */

// Re-export all service types from shared package
export {
  // Enums
  ServiceType,
  ServiceStatus,
  MatingPartType,
  ParallelismType,
  YesNoNaDncType,
  YesNoDncType,
  SystemType,
  PsiStatusType,
} from '@titans-tech/shared/types';

export type {
  // Data interfaces
  BearingClearanceData,
  BearingClearanceCheck,
  SlideData,
  SlideCheck,
  GibsData,
  GibsCheck,
  LubricationHydraulicsData,
  LubricationHydraulicsGauge,
  ClutchData,
  CounterbalanceCylinderData,
  // Service entity
  Service,
  ServiceHistoryItem,
  CreateServicePayload,
  UpdateServicePayload,
  // Form props
  BearingClearanceFormProps,
  SlideFormProps,
  GibsFormProps,
  LubricationHydraulicsFormProps,
  ClutchFormProps,
  CounterbalanceCylinderFormProps,
  InspectionModalProps,
  ServiceCreationModalProps,
} from '@titans-tech/shared/types';

// Legacy type alias for backward compatibility
export type { ServiceCreationModalProps as InspectionCreationModalProps } from '@titans-tech/shared/types';
