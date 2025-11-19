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

// GIBS Stage DTOs - Following 7-stage architecture
// OUTER SLIDE GIBS: 3 stages (Before Adjustment, After Adjustment, After Installation)
// INNER SLIDE GIBS: 4 stages (Before Adjustment, After Adjustment, Before Installation, After Installation)

class GibsStageDataDto {
  // Front to Back positions (1-8) - Used in Outer Before/After Adjustment, Inner Before Installation
  @IsOptional()
  @IsNumber()
  position1?: number;

  @IsOptional()
  @IsNumber()
  position2?: number;

  @IsOptional()
  @IsNumber()
  position3?: number;

  @IsOptional()
  @IsNumber()
  position4?: number;

  @IsOptional()
  @IsNumber()
  position5?: number;

  @IsOptional()
  @IsNumber()
  position6?: number;

  @IsOptional()
  @IsNumber()
  position7?: number;

  @IsOptional()
  @IsNumber()
  position8?: number;

  // Left to Right positions (9-16) - Used in all stages
  @IsOptional()
  @IsNumber()
  position9?: number;

  @IsOptional()
  @IsNumber()
  position10?: number;

  @IsOptional()
  @IsNumber()
  position11?: number;

  @IsOptional()
  @IsNumber()
  position12?: number;

  @IsOptional()
  @IsNumber()
  position13?: number;

  @IsOptional()
  @IsNumber()
  position14?: number;

  @IsOptional()
  @IsNumber()
  position15?: number;

  @IsOptional()
  @IsNumber()
  position16?: number;

  // Special inputs for Outer After Installation
  @IsOptional()
  @IsNumber()
  topFront?: number;

  @IsOptional()
  @IsNumber()
  topBack?: number;

  // Calculated outputs (computed on backend)
  @IsOptional()
  @IsNumber()
  calculatedTopFront?: number;

  @IsOptional()
  @IsNumber()
  calculatedTopBack?: number;

  @IsOptional()
  @IsNumber()
  calculatedTopRear?: number;

  @IsOptional()
  @IsNumber()
  calculatedBottomFront?: number;

  @IsOptional()
  @IsNumber()
  calculatedBottomBack?: number;

  @IsOptional()
  @IsNumber()
  calculatedLeft?: number;

  @IsOptional()
  @IsNumber()
  calculatedRight?: number;

  // Directional calculated outputs (for compatibility)
  @IsOptional()
  @IsNumber()
  calculatedLeftTop?: number;

  @IsOptional()
  @IsNumber()
  calculatedLeftBottom?: number;

  @IsOptional()
  @IsNumber()
  calculatedRightTop?: number;

  @IsOptional()
  @IsNumber()
  calculatedRightBottom?: number;

  @IsOptional()
  @IsNumber()
  calculatedFrontTop?: number;

  @IsOptional()
  @IsNumber()
  calculatedFrontBottom?: number;

  @IsOptional()
  @IsNumber()
  calculatedBackTop?: number;

  @IsOptional()
  @IsNumber()
  calculatedBackBottom?: number;

  // Differentials (comparison with before stage)
  @IsOptional()
  @IsNumber()
  differentialTopFront?: number;

  @IsOptional()
  @IsNumber()
  differentialTopBack?: number;

  @IsOptional()
  @IsNumber()
  differentialTopRear?: number;

  @IsOptional()
  @IsNumber()
  differentialBottom?: number;

  @IsOptional()
  @IsNumber()
  differentialLeft?: number;

  @IsOptional()
  @IsNumber()
  differentialRight?: number;
}

class GibsCheckDto {
  // OUTER SLIDE GIBS - Before Tool Installation Tab
  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  outerBeforeAdjustment?: GibsStageDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  outerAfterAdjustment?: GibsStageDataDto;

  // OUTER SLIDE GIBS - After Tool Installation Tab
  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  outerAfterInstallation?: GibsStageDataDto;

  // INNER SLIDE GIBS - 4 stages
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
  innerBeforeInstallation?: GibsStageDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsStageDataDto)
  innerAfterInstallation?: GibsStageDataDto;

  // Global fields
  @IsOptional()
  @IsEnum(YesNoDncType)
  hasBeenAdjusted?: YesNoDncType;

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
