/**
 * Shared Enums - Single Source of Truth
 *
 * All enums are re-exported from @titans-tech/db/enums.
 * Import enums from '@titans-tech/shared/enums' in your code.
 */

export {
  // Service enums
  ServiceType,
  ServiceStatus,
  ServiceSection,

  // Measurement enums
  MeasurementUnit,
  PressureUnit,
  TemperatureUnit,

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
  SealConditionType,
  VacuumSystemConditionType,

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
  CounterbalanceAlertField,
} from '@titans-tech/db/enums';
