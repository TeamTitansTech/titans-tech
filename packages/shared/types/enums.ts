/**
 * Shared Enums
 * TypeScript enums matching Prisma schema enums
 */

// Machine-specific enums
export enum FoundationType {
  PLANT_FLOOR = 'PLANT_FLOOR',
  ISOLATED_PAD = 'ISOLATED_PAD',
}

export enum FrameType {
  GAP = 'GAP',
  STRAIGHT_SIDE = 'STRAIGHT_SIDE',
}

export enum MachineClutchType {
  JH5 = 'JH5',
  NA = 'NA',
}

export enum PneumaticSystemType {
  AIR = 'AIR',
  HYD = 'HYD',
  WET_AIR = 'WET_AIR',
  WET_HYD = 'WET_HYD',
}

export enum PressMountingType {
  ADJUSTABLE = 'ADJUSTABLE',
  ON_FLOOR = 'ON_FLOOR',
  SHIMS = 'SHIMS',
  OTHER = 'OTHER',
}

export enum MachineFeaturesType {
  AIM = 'AIM',
  ADJ_STROKE = 'ADJ_STROKE',
  DOUBLE_LOCKUP = 'DOUBLE_LOCKUP',
  NA = 'NA',
}

// Inspection-specific enums
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

export enum WhyNotCoveredType {
  CUSTOMER_REMOVED = 'CUSTOMER_REMOVED',
  NOT_IN_AREA = 'NOT_IN_AREA',
  OTHER_EXPLAIN = 'OTHER_EXPLAIN',
}
