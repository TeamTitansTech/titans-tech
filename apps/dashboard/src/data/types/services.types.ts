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

type AlertSeverity = 'NONE' | 'GREEN' | 'YELLOW' | 'RED';

export interface LatestBearingClearance {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  outerData?: BearingData;
  innerData?: BearingData;
  alert?: {
    // Outer alerts
    outer_totalClearance_differential: number;
    outer_totalClearance_severity: AlertSeverity;
    outer_mainBearings_differential: number;
    outer_mainBearings_severity: AlertSeverity;
    outer_upperConnectionBearings_differential: number;
    outer_upperConnectionBearings_severity: AlertSeverity;
    outer_wristPinToMatingPart_differential: number;
    outer_wristPinToMatingPart_severity: AlertSeverity;
    outer_wristPinToBushing_differential: number;
    outer_wristPinToBushing_severity: AlertSeverity;
    outer_slideAdjNutToScrewSleeve_differential: number;
    outer_slideAdjNutToScrewSleeve_severity: AlertSeverity;
    // Inner alerts
    inner_totalClearance_differential: number;
    inner_totalClearance_severity: AlertSeverity;
    inner_mainBearings_differential: number;
    inner_mainBearings_severity: AlertSeverity;
    inner_upperConnectionBearings_differential: number;
    inner_upperConnectionBearings_severity: AlertSeverity;
    inner_wristPinToMatingPart_differential: number;
    inner_wristPinToMatingPart_severity: AlertSeverity;
    inner_wristPinToBushing_differential: number;
    inner_wristPinToBushing_severity: AlertSeverity;
    inner_slideAdjNutToScrewSleeve_differential: number;
    inner_slideAdjNutToScrewSleeve_severity: AlertSeverity;
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
