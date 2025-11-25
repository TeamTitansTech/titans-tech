/**
 * Service Enums (Client-Safe)
 * These enum definitions are duplicated from Prisma schema to avoid importing Prisma in client components.
 * IMPORTANT: Keep these in sync with packages/database/prisma/schema.prisma
 */

// ============================================================================
// Prisma-based Enums (duplicated for client safety)
// ============================================================================

export enum ServiceType {
  INSPECTION = 'INSPECTION',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum MatingPartType {
  BUSHING = 'BUSHING',
  CONNECTION = 'CONNECTION',
  NUT_SCREW_SLEEVE = 'NUT_SCREW_SLEEVE',
}

export enum ParallelismType {
  DNC = 'DNC',
  TO_BED = 'TO_BED',
  TO_BOLSTER = 'TO_BOLSTER',
}

export enum DncToBedToBolsterType {
  DNC = 'DNC',
  TO_BED = 'TO_BED',
  TO_BOLSTER = 'TO_BOLSTER',
}

export enum YesNoNaDncType {
  YES = 'YES',
  NO = 'NO',
  NA = 'NA',
  DNC = 'DNC',
}

export enum YesNoDncType {
  YES = 'YES',
  NO = 'NO',
  DNC = 'DNC',
}

export enum LubeHydMonitorFlowPressSwGibType {
  LUBE = 'LUBE',
  HYD = 'HYD',
  MONITORFLOW = 'MONITORFLOW',
  PRESS_SW = 'PRESS_SW',
  GIB = 'GIB',
}

export enum ConditionOkNaDncBrokenWornType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  BROKEN = 'BROKEN',
  WORN = 'WORN',
}

export enum ConditionOkNaDncBrokenLooseType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  BROKEN = 'BROKEN',
  LOOSE = 'LOOSE',
}

export enum ConditionOkNaDncDamagedType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  DAMAGED = 'DAMAGED',
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

export enum SealConditionType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  NOT_OPERATIONAL = 'NOT_OPERATIONAL',
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

export enum ClutchType {
  AFC = 'AFC',
  CFC = 'CFC',
  EFHC = 'EFHC',
  GC = 'GC',
  HC = 'HC',
  MC = 'MC',
  MDHC = 'MDHC',
  MHC = 'MHC',
  MHCC = 'MHCC',
}

export enum ClutchLocation {
  CRANKSHAFT = 'CRANKSHAFT',
  DRIVESHAFT = 'DRIVESHAFT',
}

export enum BrakeSpringStudBoltType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  BROKEN = 'BROKEN',
  BENT_WORN = 'BENT_WORN',
}

export enum BrakeLiningType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  WORN = 'WORN',
}

export enum FlywheelBearingsType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  WORN = 'WORN',
}

export enum FlywheelBrakeType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  WORN = 'WORN',
}

export enum RotaryUnionType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  LEAKING = 'LEAKING',
}

export enum ClutchLiningType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  WORN = 'WORN',
}

export enum ClutchSealsType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  LEAKING = 'LEAKING',
}

export enum PressureUnit {
  PSI = 'PSI',
  BAR = 'BAR',
}

export enum SplinesConditionType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  WORN = 'WORN',
}

export enum AdjustingNutLockType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  LOOSE = 'LOOSE',
}

export enum AirLineOilerSettingType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  ADJUSTED = 'ADJUSTED',
}

export enum SeparateBrakeSealsType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  LEAKING = 'LEAKING',
}

export enum FlexDiscType {
  OK = 'OK',
  NA = 'NA',
  DNC = 'DNC',
  CRACKED = 'CRACKED',
}

export enum DriveBeltConditionType {
  OK = 'OK',
  NA = 'NA',
  LOOSENED = 'LOOSENED',
  TIGHTENED = 'TIGHTENED',
  WORN = 'WORN',
}

export enum ProtectiveCoversStatusType {
  YES = 'YES',
  NO = 'NO',
  OK = 'OK',
}

export enum AngularityPerpendicularityType {
  YES = 'YES',
  NO = 'NO',
  DNC = 'DNC',
}

export enum AngularityUnitType {
  INCHES = 'INCHES',
  CM = 'CM',
  MM = 'MM',
}
