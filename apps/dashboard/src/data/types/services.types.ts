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
  YesNoNaDncCantTellType,
  LubeHydMonitorFlowPressSwGibType,
  OkNaDncDamageType,
  OkNaDncLeakingType,
  OkNaDncNotOperationalType,
  OkNaDncNotOperationalLeakingType,
  OkNaDncDarkOilType,
  OkNaDncNeedReplacedType,
  CylinderAirbagType,
  DieCushionAirLeaksType,
  DieCushionPneumaticsPlumbingType,
  DieCushionLubricationType,
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
  BearingClearanceSingleHammerCheck,
  SlideData,
  SlideCheck,
  SlideSingleHammerCheck,
  SlideDoubleHammerCheck,
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
  DieCushionCheck,
  ElectricalControlCheck,
  PerpendicularityCheck,
  AngularityCheck,
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
  TrammingData as TrammingDataType,
  ClutchData,
  SlideData,
  GibsStageData,
  LubricationHydraulicsData,
  CounterbalanceCylinderData,
  PistonsCheck,
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

export interface LatestSlideSingleHammer {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  data: {
    beforeData?: SlideData;
    data?: SlideData;
  };
  alert?: {
    maxDeviation_differential: number;
    maxDeviation_severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
  };
}

export interface LatestSlideDoubleHammer {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  data: {
    outerBefore?: SlideData;
    outerData?: SlideData;
    innerBefore?: SlideData;
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

export interface LatestPistons {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  data: PistonsCheck;
  alert?: {
    // Outer clearance severities
    outer_lhTop_severity: AlertSeverity;
    outer_lhBottom_severity: AlertSeverity;
    outer_lhLeft_severity: AlertSeverity;
    outer_lhRight_severity: AlertSeverity;
    outer_rhTop_severity: AlertSeverity;
    outer_rhBottom_severity: AlertSeverity;
    outer_rhLeft_severity: AlertSeverity;
    outer_rhRight_severity: AlertSeverity;
    // Outer difference values and severities
    outer_lhLeftRight_diff: number | null;
    outer_lhLeftRight_severity: AlertSeverity;
    outer_lhTopBottom_diff: number | null;
    outer_lhTopBottom_severity: AlertSeverity;
    outer_rhLeftRight_diff: number | null;
    outer_rhLeftRight_severity: AlertSeverity;
    outer_rhTopBottom_diff: number | null;
    outer_rhTopBottom_severity: AlertSeverity;
    // Inner clearance severities
    inner_lhTop_severity: AlertSeverity;
    inner_lhBottom_severity: AlertSeverity;
    inner_lhLeft_severity: AlertSeverity;
    inner_lhRight_severity: AlertSeverity;
    inner_rhTop_severity: AlertSeverity;
    inner_rhBottom_severity: AlertSeverity;
    inner_rhLeft_severity: AlertSeverity;
    inner_rhRight_severity: AlertSeverity;
    // Inner difference values and severities
    inner_lhLeftRight_diff: number | null;
    inner_lhLeftRight_severity: AlertSeverity;
    inner_lhTopBottom_diff: number | null;
    inner_lhTopBottom_severity: AlertSeverity;
    inner_rhLeftRight_diff: number | null;
    inner_rhLeftRight_severity: AlertSeverity;
    inner_rhTopBottom_diff: number | null;
    inner_rhTopBottom_severity: AlertSeverity;
  };
}

export interface OilChangeAlert {
  lastOilChangeDate: string | null;
  daysSinceChange: number | null;
  daysUntilDue: number | null;
  severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
}

export interface LatestLubrication {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  data: LubricationHydraulicsData;
  alert?: OilChangeAlert;
}

export interface CounterbalanceAlert {
  id: string;
  machineServiceId: string;
  fieldName: string;
  justification: string;
  createdAt: string;
  updatedAt: string;
}

export interface LatestCounterbalance {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: 'INSPECTION' | 'MAINTENANCE';
  data: {
    outerData?: CounterbalanceCylinderData;
    innerData?: CounterbalanceCylinderData;
    notes?: string;
  };
  alerts?: CounterbalanceAlert[];
}

export interface LatestTramming {
  latestServiceId: string;
  latestServiceDate: string;
  serviceType: string;
  data: {
    outerData?: TrammingDataType;
    innerData?: TrammingDataType;
  };
  alert?: any; // AlertTrammingResponseDto
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
    SLIDE_SINGLE_HAMMER: LatestSlideSingleHammer | null;
    SLIDE_DOUBLE_HAMMER: LatestSlideDoubleHammer | null;
    GIBS: LatestGibs | null;
    PISTONS: LatestPistons | null;
    LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: LatestLubrication | null;
    CLUTCH: LatestClutch | null;
    COUNTERBALANCE_CYLINDER_AIRBAG: LatestCounterbalance | null;
    TRAMMING: LatestTramming | null;
  };
}
