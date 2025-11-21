/**
 * Client-safe enum exports from Prisma
 *
 * This file exports only enums without PrismaClient,
 * making it safe to use in frontend/client components.
 */

export {
  // Service enums
  ServiceType,
  ServiceStatus,
  ServiceSection,

  // Measurement enums
  MeasurementUnit,
  PressureUnit,

  // Yes/No/NA/DNC variants
  YesNoNaDncType,
  YesNoDncType,

  // Condition enums
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
  OkNaDncDamageType,
  OkNaDncLeakingType,
  OkNaDncNotOperationalType,
  OkNaDncNotOperationalLeakingType,
  OkNaDncDarkOilType,
  OkNaDncNeedReplacedType,

  // Bearing/Slide enums
  MatingPartType,
  ParallelismType,
  DncToBedToBolsterType,

  // Lubrication/Hydraulics enums
  LubeHydMonitorFlowPressSwGibType,
  SystemType,

  // Counterbalance enums
  CylinderAirbagType,

  // Clutch enums
  ClutchType,
  ClutchLocation,
  BrakeSpringStudBoltType,
  BrakeLiningType,
  FlywheelBearingsType,
  FlywheelBrakeType,
  RotaryUnionType,
  ClutchLiningType,
  ClutchSealsType,
  SplinesConditionType,
  AdjustingNutLockType,
  AirLineOilerSettingType,
  SeparateBrakeSealsType,
  FlexDiscType,

  // Machine enums
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
  DriveBeltConditionType,
  ProtectiveCoversStatusType,

  // Alert enums
  AlertSeverity,
} from './generated/prisma/enums';
