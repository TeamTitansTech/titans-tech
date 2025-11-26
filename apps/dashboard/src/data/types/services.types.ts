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
  OkNaDncLeakingType,
  OkNaDncNotOperationalType,
  OkNaDncNotOperationalLeakingType,
  OkNaDncDarkOilType,
  OkNaDncNeedReplacedType,
  CylinderAirbagType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
  TemperatureUnit,
  SystemType,
  SealConditionType,
  VacuumSystemConditionType,
  PressureUnit,
  CounterbalanceAlertField,
} from '@titans-tech/shared/types/services';

export type {
  // Data interfaces
  BearingClearanceData,
  BearingClearanceCheck,
  SlideData,
  SlideCheck,
  GibsStageData,
  GibsCheck,
  LubricationHydraulicsData,
  LubricationHydraulicsCheck,
  LubricationHydraulicsGauge,
  ClutchData,
  CounterbalanceCylinderData,
  CounterbalanceCylinderCheck,
  TrammingData,
  TrammingCheck,
  PistonsData,
  PistonsCheck,
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
} from '@titans-tech/shared/types/services';

import type {
  BearingClearanceData as BearingData,
  ClutchData,
  SlideData,
  GibsStageData,
} from '@titans-tech/shared/types/services';

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

export interface LatestClutch {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  data: ClutchData;
  alert?: {
    hydClutchClearanceTotal_value: number;
    hydClutchClearanceTotal_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    hydClutchClearanceRear_value: number;
    hydClutchClearanceRear_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    fb_value: number;
    fb_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    fTB_value: number;
    fTB_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    rTB_value: number;
    rTB_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
  };
}

export interface LatestSlide {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  data: {
    outerData?: SlideData;
    innerData?: SlideData;
  };
  alert?: {
    maxDeviationOuter_differential: number;
    maxDeviationOuter_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
    maxDeviationInner_differential: number;
    maxDeviationInner_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
  };
}

export interface LatestGibs {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  data: GibsStageData; // Outer After Adjustment data (used for alerts)
  alert?: {
    usable_value: number;
    usable_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
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
    SLIDE: LatestSlide | null;
    GIBS: LatestGibs | null;
    LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: null;
    CLUTCH: LatestClutch | null;
    COUNTERBALANCE_CYLINDER_AIRBAG: null;
  };
}
