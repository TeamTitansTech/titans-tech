/**
 * Service DTOs with Validation Schemas
 * This is the single source of truth for all service-related types
 */

import { z } from 'zod';
import {
  ServiceType as PrismaServiceType,
  ServiceStatus as PrismaServiceStatus,
  MatingPartType as PrismaMatingPartType,
  ParallelismType as PrismaParallelismType,
  YesNoNaDncType as PrismaYesNoNaDncType,
  YesNoDncType as PrismaYesNoDncType,
  LubeHydMonitorFlowPressSwGibType as PrismaLubeHydMonitorFlowPressSwGibType,
  ConditionOkNaDncBrokenWornType as PrismaConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType as PrismaConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType as PrismaConditionOkNaDncDamagedType,
  ClutchType as PrismaClutchType,
  ClutchLocation as PrismaClutchLocation,
  BrakeSpringStudBoltType as PrismaBrakeSpringStudBoltType,
  BrakeLiningType as PrismaBrakeLiningType,
  FlywheelBearingsType as PrismaFlywheelBearingsType,
  FlywheelBrakeType as PrismaFlywheelBrakeType,
  RotaryUnionType as PrismaRotaryUnionType,
  ClutchLiningType as PrismaClutchLiningType,
  ClutchSealsType as PrismaClutchSealsType,
  PressureUnit as PrismaPressureUnit,
  SplinesConditionType as PrismaSplinesConditionType,
  AdjustingNutLockType as PrismaAdjustingNutLockType,
  AirLineOilerSettingType as PrismaAirLineOilerSettingType,
  SeparateBrakeSealsType as PrismaSeparateBrakeSealsType,
  FlexDiscType as PrismaFlexDiscType,
  DriveBeltConditionType as PrismaDriveBeltConditionType,
  ProtectiveCoversStatusType as PrismaProtectiveCoversStatusType,
  TemperatureUnit as PrismaTemperatureUnit,
  SealConditionType as PrismaSealConditionType,
  VacuumSystemConditionType as PrismaVacuumSystemConditionType,
} from '@titans-tech/db/enums';

// ============================================================================
// Re-export Prisma Enums
// ============================================================================

export {
  PrismaServiceType as ServiceType,
  PrismaServiceStatus as ServiceStatus,
  PrismaMatingPartType as MatingPartType,
  PrismaParallelismType as ParallelismType,
  PrismaYesNoNaDncType as YesNoNaDncType,
  PrismaYesNoDncType as YesNoDncType,
  PrismaLubeHydMonitorFlowPressSwGibType as LubeHydMonitorFlowPressSwGibType,
  PrismaConditionOkNaDncBrokenWornType as ConditionOkNaDncBrokenWornType,
  PrismaConditionOkNaDncBrokenLooseType as ConditionOkNaDncBrokenLooseType,
  PrismaConditionOkNaDncDamagedType as ConditionOkNaDncDamagedType,
  PrismaClutchType as ClutchType,
  PrismaClutchLocation as ClutchLocation,
  PrismaBrakeSpringStudBoltType as BrakeSpringStudBoltType,
  PrismaBrakeLiningType as BrakeLiningType,
  PrismaFlywheelBearingsType as FlywheelBearingsType,
  PrismaFlywheelBrakeType as FlywheelBrakeType,
  PrismaRotaryUnionType as RotaryUnionType,
  PrismaClutchLiningType as ClutchLiningType,
  PrismaClutchSealsType as ClutchSealsType,
  PrismaPressureUnit as PressureUnit,
  PrismaSplinesConditionType as SplinesConditionType,
  PrismaAdjustingNutLockType as AdjustingNutLockType,
  PrismaAirLineOilerSettingType as AirLineOilerSettingType,
  PrismaSeparateBrakeSealsType as SeparateBrakeSealsType,
  PrismaFlexDiscType as FlexDiscType,
  PrismaDriveBeltConditionType as DriveBeltConditionType,
  PrismaProtectiveCoversStatusType as ProtectiveCoversStatusType,
  PrismaTemperatureUnit as TemperatureUnit,
  PrismaSealConditionType as SealConditionType,
  PrismaVacuumSystemConditionType as VacuumSystemConditionType,
};

// Note: These custom enums are not in Prisma yet
export enum DncToBedToBolsterType {
  DNC = 'DNC',
  TO_BED = 'TO_BED',
  TO_BOLSTER = 'TO_BOLSTER',
}

export enum SystemType {
  LUBE = 'LUBE',
  HYD = 'HYD',
  MONITORFLOW = 'MONITORFLOW',
  PRESS_SW = 'PRESS_SW',
  GIB = 'GIB',
}

export enum OkNaDncDamageType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
}

export enum CounterbalanceTypeEnum {
  CYLINDER = 'CYLINDER',
  AIRBAG = 'AIRBAG',
}

export enum AirbagPistonSealsType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  LEAKING = 'LEAKING',
}

export enum RegulatorGaugeType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  NOT_OPERATIONAL = 'NOT_OPERATIONAL',
}

export enum PneumaticsPlumbingType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  NOT_OPERATIONAL = 'NOT_OPERATIONAL',
  LEAKING = 'LEAKING',
}

export enum RodSealsType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  LEAKING = 'LEAKING',
}

export enum RodBushingType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  DARK_OIL = 'DARK_OIL',
}

export enum OilWickType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  NEEDS_REPLACED = 'NEEDS_REPLACED',
}

// ============================================================================
// Zod Schemas for Section Data Types
// ============================================================================

/**
 * Bearing Clearance Data Schema
 */
export const BearingClearanceDataSchema = z.object({
  totalClearance_RH: z.number(),
  totalClearance_LH: z.number(),
  mainBearings_RH: z.number(),
  mainBearings_LH: z.number(),
  upperConnectionBearings_RH: z.number(),
  upperConnectionBearings_LH: z.number(),
  wristPinToMatingPart_RH: z.number(),
  wristPinToMatingPart_LH: z.number(),
  wristPinToBushing_RH: z.number(),
  wristPinToBushing_LH: z.number(),
  slideAdjNutToScrewSleeve_RH: z.number(),
  slideAdjNutToScrewSleeve_LH: z.number(),
  extraDoubleLockOpen_RH: z.number(),
  extraDoubleLockOpen_LH: z.number(),
  ballBoxArea_RH: z.number(),
  ballBoxArea_LH: z.number(),
  hasBeenAdjusted: z.nativeEnum(PrismaYesNoNaDncType),
  combinedWith: z.string().optional(),
  matingPart: z.nativeEnum(PrismaMatingPartType).optional(),
  slideMotorMounts: z.nativeEnum(PrismaConditionOkNaDncBrokenWornType).optional(),
  powerCordHoses: z.nativeEnum(PrismaConditionOkNaDncDamagedType).optional(),
  chainsGearsSprockets: z.nativeEnum(PrismaConditionOkNaDncBrokenLooseType).optional(),
  lockingClamps: z.nativeEnum(PrismaConditionOkNaDncDamagedType).optional(),
  notes: z.string().optional(),
});

export type BearingClearanceData = z.infer<typeof BearingClearanceDataSchema>;

/**
 * Bearing Clearance Check Schema
 */
export const BearingClearanceCheckSchema = z.object({
  outerBefore: BearingClearanceDataSchema.optional(),
  outerData: BearingClearanceDataSchema.optional(),
  innerBefore: BearingClearanceDataSchema.optional(),
  innerData: BearingClearanceDataSchema.optional(),
});

export type BearingClearanceCheck = z.infer<typeof BearingClearanceCheckSchema>;

/**
 * Slide Data Schema
 * Each SlideData represents ONE measurement (5 positions) with metadata
 */
export const SlideDataSchema = z.object({
  // Parallelism configuration
  parallelism: z.nativeEnum(PrismaParallelismType).optional(),
  hasParallelismBeenAdjusted: z.nativeEnum(PrismaYesNoNaDncType).optional(),

  // Shutheight fields
  shutheightIndicatorsChecked: z.nativeEnum(PrismaYesNoDncType).optional(),
  overloadsOnTonnageMonitor: z.string().optional(),
  shutheightActualSh: z.string().optional(),
  indicatorReading: z.string().optional(),

  // Measurements (5 positions)
  position1: z.number(),
  position2: z.number(),
  position3: z.number(),
  position4: z.number(),
  position5: z.number(),
});

export type SlideData = z.infer<typeof SlideDataSchema>;

/**
 * Slide Check Schema
 * Four separate SlideData records (outerBefore, outerData, innerBefore, innerData)
 */
export const SlideCheckSchema = z.object({
  outerBefore: SlideDataSchema.optional(),
  outerData: SlideDataSchema.optional(),
  innerBefore: SlideDataSchema.optional(),
  innerData: SlideDataSchema.optional(),
  notes: z.string().optional(),
});

export type SlideCheck = z.infer<typeof SlideCheckSchema>;

/**
 * Gibs Stage Data Schema - Represents one stage of GIBS measurements (16 points)
 * This matches the GibsStageData Prisma model
 */
export const GibsStageDataSchema = z.object({
  point1: z.number(),
  point2: z.number(),
  point3: z.number(),
  point4: z.number(),
  point5: z.number(),
  point6: z.number(),
  point7: z.number(),
  point8: z.number(),
  point9: z.number(),
  point10: z.number(),
  point11: z.number(),
  point12: z.number(),
  point13: z.number(),
  point14: z.number(),
  point15: z.number(),
  point16: z.number(),
});

export type GibsStageData = z.infer<typeof GibsStageDataSchema>;

// Backwards compatibility alias
export const GibsDataSchema = GibsStageDataSchema;
export type GibsData = GibsStageData;

/**
 * Gibs Check Schema - 7-stage GIBS structure (following outerBefore/outerData pattern)
 */
export const GibsCheckSchema = z.object({
  outerBefore: GibsStageDataSchema.optional(),
  outerData: GibsStageDataSchema.optional(),
  outerFreeHangingData: GibsStageDataSchema.optional(),
  haveInnerGibsBeenAdjusted: z.nativeEnum(PrismaYesNoDncType).optional(),
  innerBefore: GibsStageDataSchema.optional(),
  innerData: GibsStageDataSchema.optional(),
  innerBeforeTool: GibsStageDataSchema.optional(),
  innerDataTool: GibsStageDataSchema.optional(),
  notes: z.string().optional(),
});

export type GibsCheck = z.infer<typeof GibsCheckSchema>;

/**
 * Lubrication & Hydraulics Gauge Schema
 */
export const LubricationHydraulicsGaugeSchema = z.object({
  id: z.string().optional(),
  system: z.nativeEnum(PrismaLubeHydMonitorFlowPressSwGibType),
  gaugeSwitchIdentifier: z.string().optional(),
  psi: z.nativeEnum(OkNaDncDamageType).optional(),
});

export type LubricationHydraulicsGauge = z.infer<typeof LubricationHydraulicsGaugeSchema>;

/**
 * Lubrication & Hydraulics Data Schema
 */
export const LubricationHydraulicsDataSchema = z.object({
  gauges: z.array(LubricationHydraulicsGaugeSchema),
  changedOil: z.nativeEnum(PrismaYesNoDncType),
  oilTemperature: z.number().optional(),
  oilTemperatureUnit: z.nativeEnum(PrismaTemperatureUnit).optional(),
  oilMfgType: z.string().optional(),
  changedFilter: z.nativeEnum(PrismaYesNoDncType),
});

export type LubricationHydraulicsData = z.infer<typeof LubricationHydraulicsDataSchema>;

export const LubricationHydraulicsCheckSchema = z.object({
  data: LubricationHydraulicsDataSchema,
  notes: z.string().optional(),
});

export type LubricationHydraulicsCheck = z.infer<typeof LubricationHydraulicsCheckSchema>;

/**
 * Clutch Data Schema
 */
export const ClutchDataSchema = z.object({
  // Clutch Type and Location
  clutchType: z.nativeEnum(PrismaClutchType).optional(),
  clutchLocation: z.nativeEnum(PrismaClutchLocation).optional(),

  // Brake Spring Settings (in inches)
  brakeSpringBrake: z.number().optional(),
  brakeSpringClutch: z.number().optional(),
  brakeSpringFB: z.number().optional(),
  brakeSpringFTB: z.number().optional(),
  brakeSpringRTB: z.number().optional(),
  brakeSpringStudBolt: z.nativeEnum(PrismaBrakeSpringStudBoltType).optional(),

  // Brake measurements
  brakeStoppingTime: z.number().optional(),
  brakeLining: z.nativeEnum(PrismaBrakeLiningType).optional(),
  brakeClearing: z.number().optional(),
  brakeClearanceTotal: z.number().optional(),
  brakeClearanceRear: z.number().optional(),

  // Flywheel
  flywheelStoppingTime: z.number().optional(),
  flywheelBearings: z.nativeEnum(PrismaFlywheelBearingsType).optional(),
  flywheelBrake: z.nativeEnum(PrismaFlywheelBrakeType).optional(),

  // Rotary Union
  rotaryUnion: z.nativeEnum(PrismaRotaryUnionType).optional(),

  // Clutch details
  clutchEngagements: z.number().optional(),
  clutchLining: z.nativeEnum(PrismaClutchLiningType).optional(),
  clutchSeals: z.nativeEnum(PrismaClutchSealsType).optional(),

  // Gear and measurements (*Check only if excessive noise and/or vibration is present)
  gearBacklashBefore: z.number().optional(),
  gearBacklashAfter: z.number().optional(),
  crankEndplayBefore: z.number().optional(),
  crankEndplayAfter: z.number().optional(),

  // Air system
  airRegulatorValue: z.number().optional(),
  airClutchTravel: z.number().optional(),
  airLineOilerSetting: z.nativeEnum(PrismaAirLineOilerSettingType).optional(),

  // Splines
  splinesDriveRingDisc: z.nativeEnum(PrismaSplinesConditionType).optional(),

  // Adjusting Nut/Lock
  adjustingNutLockSecure: z.nativeEnum(PrismaAdjustingNutLockType).optional(),

  // Hydraulic system
  hydClutchClearanceTotal: z.number().optional(),
  hydClutchClearanceRear: z.number().optional(),
  hydraulicPressureValue: z.number().optional(),
  accumulatorValue: z.number().optional(),

  // Separate Brake Seals
  separateBrakeSeals: z.nativeEnum(PrismaSeparateBrakeSealsType).optional(),

  // Flex Disc
  flexDisc: z.nativeEnum(PrismaFlexDiscType).optional(),

  // Notes
  notes: z.string().optional(),
});

export type ClutchData = z.infer<typeof ClutchDataSchema>;

/**
 * Counterbalance Cylinder Data Schema
 */
export const CounterbalanceCylinderDataSchema = z.object({
  counterbalanceType: z.string().optional(),
  airbagPistonSeals: z.string().optional(),
  airbagPistonSealsLeakLocation: z.string().optional(),
  regulator: z.string().optional(),
  gauge: z.string().optional(),
  pneumaticsPlumbing: z.string().optional(),
  rodSeals: z.string().optional(),
  rodBushing: z.string().optional(),
  oilWick: z.string().optional(),
});

export type CounterbalanceCylinderData = z.infer<typeof CounterbalanceCylinderDataSchema>;

/**
 * Counterbalance Cylinder Check Schema
 */
export const CounterbalanceCylinderCheckSchema = z.object({
  outerData: CounterbalanceCylinderDataSchema.optional(),
  innerData: CounterbalanceCylinderDataSchema.optional(),
  notes: z.string().optional(),
});

export type CounterbalanceCylinderCheck = z.infer<typeof CounterbalanceCylinderCheckSchema>;

/**
 * Tramming Data Schema (matches Prisma TrammingData model)
 * Note: The outer/inner distinction is handled by TrammingCheckSchema's outerData/innerData fields
 */
export const TrammingDataSchema = z.object({
  // Top Position (4 measurements around trim pin)
  topTop: z.number(),
  topBottom: z.number(),
  topLeft: z.number(),
  topRight: z.number(),

  // Bottom Position (4 measurements around trim pin)
  bottomTop: z.number(),
  bottomBottom: z.number(),
  bottomLeft: z.number(),
  bottomRight: z.number(),

  // Left Position (4 measurements around trim pin)
  leftTop: z.number(),
  leftBottom: z.number(),
  leftLeft: z.number(),
  leftRight: z.number(),

  // Right Position (4 measurements around trim pin)
  rightTop: z.number(),
  rightBottom: z.number(),
  rightLeft: z.number(),
  rightRight: z.number(),
});

export type TrammingData = z.infer<typeof TrammingDataSchema>;

/**
 * Tramming Check Schema
 */
export const TrammingCheckSchema = z.object({
  outerData: TrammingDataSchema.optional(),
  innerData: TrammingDataSchema.optional(),
  slideTram: z.nativeEnum(PrismaYesNoDncType).optional(),
  unit: z.enum(['inches', 'mm', 'cm']).optional(),
  notes: z.string().optional(),
});

export type TrammingCheck = z.infer<typeof TrammingCheckSchema>;

/**
 * Pistons Data Schema (matches Prisma PistonsData model)
 * Note: The outer/inner distinction is handled by PistonsCheckSchema's outerData/innerData fields
 */
export const PistonsDataSchema = z.object({
  // LH Piston (4 measurements)
  lhTop: z.number(),
  lhBottom: z.number(),
  lhLeft: z.number(),
  lhRight: z.number(),

  // RH Piston (4 measurements)
  rhTop: z.number(),
  rhBottom: z.number(),
  rhLeft: z.number(),
  rhRight: z.number(),
});

export type PistonsData = z.infer<typeof PistonsDataSchema>;

/**
 * Pistons Check Schema
 */
export const PistonsCheckSchema = z.object({
  outerData: PistonsDataSchema.optional(),
  innerData: PistonsDataSchema.optional(),
  guideSeals: z.nativeEnum(PrismaSealConditionType).optional(),
  pistonSeals: z.nativeEnum(PrismaSealConditionType).optional(),
  vacuumSystem: z.nativeEnum(PrismaVacuumSystemConditionType).optional(),
  vacuumSystemAirPressureSetting: z.number().optional(),
  vacuumSystemAirPressureUnit: z.nativeEnum(PrismaPressureUnit).optional(),
  unit: z.enum(['inches', 'mm', 'cm']).optional(),
  notes: z.string().optional(),
});

export type PistonsCheck = z.infer<typeof PistonsCheckSchema>;

// ============================================================================
// Service Payload and Entity Schemas
// ============================================================================

/**
 * Create Service Request Validation
 */
export const CreateServiceSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  date: z.string().datetime('Invalid date format'),
  type: z.nativeEnum(PrismaServiceType),
  performedBy: z.string().min(1, 'Performed by is required').optional(),
  isMaintenance: z.boolean().default(false),
  notes: z.string().optional(),
  status: z.nativeEnum(PrismaServiceStatus).optional(),
  currentStep: z.string().optional(),
  currentSectionKey: z.string().optional(),
  selectedSections: z.array(z.string()).optional(),
});

export type CreateServiceDto = z.infer<typeof CreateServiceSchema>;

/**
 * Create Service Payload Schema (full payload with all section data)
 */
export const CreateServicePayloadSchema = z.object({
  machineId: z.string(),
  date: z.string(),
  type: z.nativeEnum(PrismaServiceType),
  status: z.nativeEnum(PrismaServiceStatus).optional(),
  performedBy: z.string().optional(),
  currentStep: z.string().optional(),
  currentSectionKey: z.string().optional(),
  selectedSections: z.array(z.string()).optional(),

  // Inspection observation fields
  isPressLevel: z.nativeEnum(PrismaYesNoNaDncType).optional(),
  driveBeltCondition: z.nativeEnum(PrismaDriveBeltConditionType).optional(),
  areAllProtectiveCovers: z.nativeEnum(PrismaProtectiveCoversStatusType).optional(),
  protectiveCoversExplanation: z.string().optional(),
  areCracksVisible: z.nativeEnum(PrismaYesNoDncType).optional(),
  cracksLocation: z.string().optional(),
  isMainMotorSecure: z.nativeEnum(PrismaYesNoDncType).optional(),
  isMotorPlateSecure: z.nativeEnum(PrismaYesNoDncType).optional(),
  whyNotCovered: z.string().optional(),

  bearingClearance: BearingClearanceCheckSchema.optional(),
  slide: SlideCheckSchema.optional(),
  gibs: GibsCheckSchema.optional(),
  lubricationHydraulics: LubricationHydraulicsCheckSchema.optional(),
  clutch: ClutchDataSchema.optional(),
  counterbalanceCylinder: CounterbalanceCylinderCheckSchema.optional(),
  tramming: TrammingCheckSchema.optional(),
  pistons: PistonsCheckSchema.optional(),
});

export type CreateServicePayload = z.infer<typeof CreateServicePayloadSchema>;

/**
 * Update Service Payload Schema
 */
export const UpdateServicePayloadSchema = z.object({
  date: z.string().optional(),
  type: z.nativeEnum(PrismaServiceType).optional(),
  status: z.nativeEnum(PrismaServiceStatus).optional(),
  performedBy: z.string().optional(),
  currentStep: z.string().optional(),
  currentSectionKey: z.string().optional(),
  selectedSections: z.array(z.string()).optional(),

  // Inspection observation fields
  isPressLevel: z.nativeEnum(PrismaYesNoNaDncType).optional(),
  driveBeltCondition: z.nativeEnum(PrismaDriveBeltConditionType).optional(),
  areAllProtectiveCovers: z.nativeEnum(PrismaProtectiveCoversStatusType).optional(),
  protectiveCoversExplanation: z.string().optional(),
  areCracksVisible: z.nativeEnum(PrismaYesNoDncType).optional(),
  cracksLocation: z.string().optional(),
  isMainMotorSecure: z.nativeEnum(PrismaYesNoDncType).optional(),
  isMotorPlateSecure: z.nativeEnum(PrismaYesNoDncType).optional(),
  whyNotCovered: z.string().optional(),

  bearingClearance: BearingClearanceCheckSchema.optional(),
  slide: SlideCheckSchema.optional(),
  gibs: GibsCheckSchema.optional(),
  lubricationHydraulics: LubricationHydraulicsCheckSchema.optional(),
  clutch: ClutchDataSchema.optional(),
  counterbalanceCylinder: CounterbalanceCylinderCheckSchema.optional(),
  tramming: TrammingCheckSchema.optional(),
  pistons: PistonsCheckSchema.optional(),
});

export type UpdateServicePayload = z.infer<typeof UpdateServicePayloadSchema>;

/**
 * Complete Service Request Validation
 */
export const CompleteServiceSchema = z.object({
  completedAt: z.string().datetime('Invalid date format').optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(PrismaServiceStatus).optional(),
  completedBy: z.string().optional(),
});

export type CompleteServiceDto = z.infer<typeof CompleteServiceSchema>;

/**
 * Service Entity Schema
 */
export const ServiceSchema = z.object({
  id: z.string(),
  machineId: z.string(),
  date: z.string(),
  type: z.nativeEnum(PrismaServiceType),
  status: z.nativeEnum(PrismaServiceStatus),
  performedBy: z.string().optional(),
  currentStep: z.string().optional(),
  currentSectionKey: z.string().optional(),
  selectedSections: z.array(z.string()).optional(),

  // Inspection observation fields
  isPressLevel: z.nativeEnum(PrismaYesNoNaDncType).optional(),
  driveBeltCondition: z.nativeEnum(PrismaDriveBeltConditionType).optional(),
  areAllProtectiveCovers: z.nativeEnum(PrismaProtectiveCoversStatusType).optional(),
  protectiveCoversExplanation: z.string().optional(),
  areCracksVisible: z.nativeEnum(PrismaYesNoDncType).optional(),
  cracksLocation: z.string().optional(),
  isMainMotorSecure: z.nativeEnum(PrismaYesNoDncType).optional(),
  isMotorPlateSecure: z.nativeEnum(PrismaYesNoDncType).optional(),
  whyNotCovered: z.string().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Service = z.infer<typeof ServiceSchema>;

/**
 * Service History Item Schema
 */
export const ServiceHistoryItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  technician: z.string(),
  date: z.string(),
  status: z.enum(['completed', 'in_progress', 'pending']),
});

export type ServiceHistoryItem = z.infer<typeof ServiceHistoryItemSchema>;

// ============================================================================
// Form Component Props Types (not Zod schemas, just TypeScript types)
// ============================================================================

export interface BearingClearanceFormProps {
  data: BearingClearanceData;
  updateFn: (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof BearingClearanceData) => void;
  title: string;
}

export interface SlideFormProps {
  data: SlideData;
  updateFn: (field: keyof SlideData, value: number) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof SlideData) => void;
  title: string;
}

export interface GibsFormProps {
  data: GibsData;
  updateFn: (field: keyof GibsData, value: string | number | boolean | undefined) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof GibsData) => void;
  title: string;
  showDiagram?: boolean;
  diagramType?: 'frontToBack' | 'leftToRight';
}

export interface LubricationHydraulicsFormProps {
  data: LubricationHydraulicsData & { notes?: string };
  updateFn: (
    field: keyof LubricationHydraulicsData | 'notes',
    value:
      | string
      | number
      | boolean
      | PrismaYesNoDncType
      | PrismaTemperatureUnit
      | LubricationHydraulicsGauge[]
      | undefined,
  ) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof LubricationHydraulicsData) => void;
}

export interface ClutchFormProps {
  data: ClutchData;
  updateFn: (field: keyof ClutchData, value: string | number | undefined) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof ClutchData) => void;
}

export interface CounterbalanceCylinderFormProps {
  data: CounterbalanceCylinderData;
  updateFn: (field: keyof CounterbalanceCylinderData, value: string | number | undefined) => void;
  errors: Record<string, string>;
  title: string;
}

export interface TrammingFormProps {
  data: TrammingData;
  updateFn: (field: keyof TrammingData, value: number) => void;
  errors: Record<string, string>;
  handleBlur: (field: keyof TrammingData) => void;
  title: string;
}

export interface InspectionModalProps {
  machineId: string;
  blueprintSections: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
