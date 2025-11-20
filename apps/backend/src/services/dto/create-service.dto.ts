import {
  IsString,
  IsDateString,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MatingPartType,
  ParallelismType,
  ServiceType,
  ServiceStatus,
  YesNoNaDncType,
  YesNoDncType,
  LubeHydMonitorFlowPressSwGibType,
  OkNaDncDamageType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
  ClutchType,
  ClutchLocation,
  BrakeSpringStudBoltType,
  BrakeLiningType,
  FlywheelBearingsType,
  FlywheelBrakeType,
  RotaryUnionType,
  ClutchLiningType,
  ClutchSealsType,
  PressureUnit,
  AirLineOilerSettingType,
  SplinesConditionType,
  AdjustingNutLockType,
  SeparateBrakeSealsType,
  FlexDiscType,
} from '@titans-tech/shared/types';

class BearingClearanceDataDto {
  @IsNumber()
  totalClearance_RH: number;

  @IsNumber()
  totalClearance_LH: number;

  @IsNumber()
  mainBearings_RH: number;

  @IsNumber()
  mainBearings_LH: number;

  @IsNumber()
  upperConnectionBearings_RH: number;

  @IsNumber()
  upperConnectionBearings_LH: number;

  @IsNumber()
  wristPinToMatingPart_RH: number;

  @IsNumber()
  wristPinToMatingPart_LH: number;

  @IsNumber()
  wristPinToBushing_RH: number;

  @IsNumber()
  wristPinToBushing_LH: number;

  @IsNumber()
  slideAdjNutToScrewSleeve_RH: number;

  @IsNumber()
  slideAdjNutToScrewSleeve_LH: number;

  @IsNumber()
  extraDoubleLockOpen_RH: number;

  @IsNumber()
  extraDoubleLockOpen_LH: number;

  @IsNumber()
  ballBoxArea_RH: number;

  @IsNumber()
  ballBoxArea_LH: number;

  @IsEnum(YesNoNaDncType)
  hasBeenAdjusted: YesNoNaDncType;

  @IsOptional()
  @IsString()
  combinedWith?: string;

  @IsOptional()
  @IsEnum(MatingPartType)
  matingPart?: MatingPartType;

  @IsOptional()
  @IsEnum(ConditionOkNaDncBrokenWornType)
  slideMotorMounts?: ConditionOkNaDncBrokenWornType;

  @IsOptional()
  @IsEnum(ConditionOkNaDncDamagedType)
  powerCordHoses?: ConditionOkNaDncDamagedType;

  @IsOptional()
  @IsEnum(ConditionOkNaDncBrokenLooseType)
  chainsGearsSprockets?: ConditionOkNaDncBrokenLooseType;

  @IsOptional()
  @IsEnum(ConditionOkNaDncDamagedType)
  lockingClamps?: ConditionOkNaDncDamagedType;

  @IsOptional()
  @IsString()
  notes?: string;
}

class BearingClearanceCheckDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDataDto)
  outerBefore?: BearingClearanceDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDataDto)
  outerAfter?: BearingClearanceDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDataDto)
  innerBefore?: BearingClearanceDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDataDto)
  innerAfter?: BearingClearanceDataDto;
}

class SlideDataDto {
  @IsNumber()
  position1: number;

  @IsNumber()
  position2: number;

  @IsNumber()
  position3: number;

  @IsNumber()
  position4: number;

  @IsNumber()
  position5: number;

  @IsNumber()
  position6: number;
}

class SlideCheckDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SlideDataDto)
  outerBefore?: SlideDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideDataDto)
  outerData?: SlideDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideDataDto)
  innerBefore?: SlideDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideDataDto)
  innerData?: SlideDataDto;

  @IsOptional()
  @IsEnum(ParallelismType)
  outerParallelism?: ParallelismType;

  @IsOptional()
  @IsEnum(YesNoNaDncType)
  outerHasParallelismBeenAdjusted?: YesNoNaDncType;

  @IsOptional()
  @IsEnum(ParallelismType)
  innerParallelism?: ParallelismType;

  @IsOptional()
  @IsEnum(YesNoNaDncType)
  innerHasParallelismBeenAdjusted?: YesNoNaDncType;

  @IsOptional()
  @IsEnum(YesNoDncType)
  outerShutheightIndicatorsChecked?: YesNoDncType;

  @IsOptional()
  @IsString()
  outerOverloadsOnTonnageMonitor?: string;

  @IsOptional()
  @IsString()
  outerShutheightActualSh?: string;

  @IsOptional()
  @IsString()
  outerIndicatorReading?: string;

  @IsOptional()
  @IsEnum(YesNoDncType)
  innerShutheightIndicatorsChecked?: YesNoDncType;

  @IsOptional()
  @IsString()
  innerOverloadsOnTonnageMonitor?: string;

  @IsOptional()
  @IsString()
  innerShutheightActualSh?: string;

  @IsOptional()
  @IsString()
  innerIndicatorReading?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class GibsStageDataDto {
  @IsNumber()
  point1: number;

  @IsNumber()
  point2: number;

  @IsNumber()
  point3: number;

  @IsNumber()
  point4: number;

  @IsNumber()
  point5: number;

  @IsNumber()
  point6: number;

  @IsNumber()
  point7: number;

  @IsNumber()
  point8: number;

  @IsNumber()
  point9: number;

  @IsNumber()
  point10: number;

  @IsNumber()
  point11: number;

  @IsNumber()
  point12: number;

  @IsNumber()
  point13: number;

  @IsNumber()
  point14: number;

  @IsNumber()
  point15: number;

  @IsNumber()
  point16: number;
}

class GibsCheckDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  outerBeforeAdjustment?: GibsStageDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  outerAfterAdjustment?: GibsStageDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  outerFreeHangingAfterInstall?: GibsStageDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  innerBeforeAdjustment?: GibsStageDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  innerAfterAdjustment?: GibsStageDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  innerBeforeToolInstallation?: GibsStageDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  innerAfterToolInstallation?: GibsStageDataDto;

  @IsOptional()
  @IsString()
  notes?: string;
}

class LubricationHydraulicsGaugeDto {
  @IsEnum(LubeHydMonitorFlowPressSwGibType)
  system: LubeHydMonitorFlowPressSwGibType;

  @IsOptional()
  @IsString()
  gauge?: string;

  @IsOptional()
  @IsEnum(OkNaDncDamageType)
  psi?: OkNaDncDamageType;
}

class LubricationHydraulicsDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LubricationHydraulicsGaugeDto)
  gauges: LubricationHydraulicsGaugeDto[];

  @IsEnum(YesNoDncType)
  changedOil: YesNoDncType;

  @IsOptional()
  @IsNumber()
  oilTemperatureF?: number;

  @IsOptional()
  @IsString()
  oilMfgType?: string;

  @IsEnum(YesNoDncType)
  changedFilter: YesNoDncType;

  @IsOptional()
  @IsString()
  notes?: string;
}

class ClutchDataDto {
  @IsOptional()
  @IsEnum(ClutchType)
  clutchType?: ClutchType;

  @IsOptional()
  @IsEnum(ClutchLocation)
  clutchLocation?: ClutchLocation;

  @IsOptional()
  @IsNumber()
  brakeSpringFB?: number;

  @IsOptional()
  @IsNumber()
  brakeSpringFTB?: number;

  @IsOptional()
  @IsNumber()
  brakeSpringRTB?: number;

  @IsOptional()
  @IsEnum(BrakeSpringStudBoltType)
  brakeSpringStudBolt?: BrakeSpringStudBoltType;

  @IsOptional()
  @IsNumber()
  brakeStoppingTime?: number;

  @IsOptional()
  @IsEnum(BrakeLiningType)
  brakeLining?: BrakeLiningType;

  @IsOptional()
  @IsNumber()
  brakeClearing?: number;

  @IsOptional()
  @IsNumber()
  brakeClearanceTotal?: number;

  @IsOptional()
  @IsNumber()
  brakeClearanceRear?: number;

  @IsOptional()
  @IsNumber()
  flywheelStoppingTime?: number;

  @IsOptional()
  @IsEnum(FlywheelBearingsType)
  flywheelBearings?: FlywheelBearingsType;

  @IsOptional()
  @IsEnum(FlywheelBrakeType)
  flywheelBrake?: FlywheelBrakeType;

  @IsOptional()
  @IsEnum(RotaryUnionType)
  rotaryUnion?: RotaryUnionType;

  @IsOptional()
  @IsNumber()
  clutchEngagements?: number;

  @IsOptional()
  @IsEnum(ClutchLiningType)
  clutchLining?: ClutchLiningType;

  @IsOptional()
  @IsEnum(ClutchSealsType)
  clutchSeals?: ClutchSealsType;

  @IsOptional()
  @IsNumber()
  gearBacklashBefore?: number;

  @IsOptional()
  @IsNumber()
  gearBacklashAfter?: number;

  @IsOptional()
  @IsNumber()
  crankEndplayBefore?: number;

  @IsOptional()
  @IsNumber()
  crankEndplayAfter?: number;

  @IsOptional()
  @IsNumber()
  airRegulatorValue?: number;

  @IsOptional()
  @IsEnum(PressureUnit)
  airRegulatorUnit?: PressureUnit;

  @IsOptional()
  @IsNumber()
  airClutchTravel?: number;

  @IsOptional()
  @IsEnum(AirLineOilerSettingType)
  airLineOilerSetting?: AirLineOilerSettingType;

  @IsOptional()
  @IsEnum(SplinesConditionType)
  splinesDriveRingDisc?: SplinesConditionType;

  @IsOptional()
  @IsEnum(AdjustingNutLockType)
  adjustingNutLockSecure?: AdjustingNutLockType;

  @IsOptional()
  @IsNumber()
  hydraulicPressureValue?: number;

  @IsOptional()
  @IsEnum(PressureUnit)
  hydraulicPressureUnit?: PressureUnit;

  @IsOptional()
  @IsNumber()
  accumulatorValue?: number;

  @IsOptional()
  @IsEnum(PressureUnit)
  accumulatorUnit?: PressureUnit;

  @IsOptional()
  @IsNumber()
  hydClutchClearanceTotal?: number;

  @IsOptional()
  @IsNumber()
  hydClutchClearanceRear?: number;

  @IsOptional()
  @IsEnum(SeparateBrakeSealsType)
  separateBrakeSeals?: SeparateBrakeSealsType;

  @IsOptional()
  @IsEnum(FlexDiscType)
  flexDisc?: FlexDiscType;

  @IsOptional()
  @IsString()
  notes?: string;
}

class CounterbalanceCylinderDataDto {
  @IsOptional()
  @IsString()
  counterbalanceType?: string;

  @IsOptional()
  @IsString()
  airbagPistonSeals?: string;

  @IsOptional()
  @IsString()
  airbagPistonSealsLeakLocation?: string;

  @IsOptional()
  @IsString()
  regulator?: string;

  @IsOptional()
  @IsString()
  gauge?: string;

  @IsOptional()
  @IsString()
  pneumaticsPlumbing?: string;

  @IsOptional()
  @IsString()
  rodSeals?: string;

  @IsOptional()
  @IsString()
  rodBushing?: string;

  @IsOptional()
  @IsString()
  oilWick?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class CounterbalanceCylinderCheckDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CounterbalanceCylinderDataDto)
  outerData?: CounterbalanceCylinderDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CounterbalanceCylinderDataDto)
  innerData?: CounterbalanceCylinderDataDto;
}

export class CreateServiceDto {
  @IsString()
  machineId: string;

  @IsDateString()
  date: string;

  @IsEnum(ServiceType)
  type: ServiceType;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsString()
  performedBy?: string;

  @IsOptional()
  @IsString()
  currentStep?: string;

  @IsOptional()
  @IsString()
  currentSectionKey?: string;

  @IsOptional()
  @IsArray()
  selectedSections?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceCheckDto)
  bearingClearance?: BearingClearanceCheckDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideCheckDto)
  slide?: SlideCheckDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsCheckDto)
  gibs?: GibsCheckDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LubricationHydraulicsDataDto)
  lubricationHydraulics?: LubricationHydraulicsDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClutchDataDto)
  clutch?: ClutchDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CounterbalanceCylinderCheckDto)
  counterbalanceCylinder?: CounterbalanceCylinderCheckDto;
}
