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
  DncToBedToBolsterType,
  YesNoNaDncType,
  YesNoDncType,
  LubeHydMonitorFlowPressSwGibType,
  OkNaDncDamageType,
  CounterbalanceTypeEnum,
  AirbagPistonSealsType,
  RegulatorGaugeType,
  PneumaticsPlumbingType,
  RodSealsType,
  RodBushingType,
  OilWickType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
  SystemType,
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
  CounterbalanceCylinderCheck,
  TrammingData,
  TrammingCheck,
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
  TrammingFormProps,
  InspectionModalProps,
  ServiceCreationModalProps,
} from '@titans-tech/shared/types';

// Legacy type alias for backward compatibility
export type { ServiceCreationModalProps as InspectionCreationModalProps } from '@titans-tech/shared/types';

import type { BearingClearanceData as BearingData } from '@titans-tech/shared/types';

export interface LatestBearingClearance {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  data: BearingData;
  alert?: {
    totalClearance_differential: number;
    totalClearance_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    mainBearings_differential: number;
    mainBearings_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    upperConnectionBearings_differential: number;
    upperConnectionBearings_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    wristPinToMatingPart_differential: number;
    wristPinToMatingPart_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    wristPinToBushing_differential: number;
    wristPinToBushing_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    slideAdjNutToScrewSleeve_differential: number;
    slideAdjNutToScrewSleeve_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
  };
}

export interface LatestReport {
  machineId: string;
  machineName: string;
  blueprint: {
    id: string;
    name: string;
    sections: string[];
  };
  generatedAt: string;
  sections: {
    BEARING_CLEARANCE: LatestBearingClearance | null;
    SLIDE: null;
    GIBS: null;
    LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: null;
    CLUTCH: null;
    COUNTERBALANCE_CYLINDER_AIRBAG: null;
  };
}
