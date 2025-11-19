import {
  IsString,
  IsBoolean,
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
  DncToBedToBolsterType,
  ServiceType,
  ServiceStatus,
  YesNoNaDncType,
  YesNoDncType,
  LubeHydMonitorFlowPressSwGibType,
  OkNaDncDamageType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
} from '@titans-tech/shared/types';

class BearingClearanceDataDto {
  @IsOptional()
  @IsNumber()
  totalClearance_RH?: number;

  @IsOptional()
  @IsNumber()
  totalClearance_LH?: number;

  @IsOptional()
  @IsNumber()
  mainBearings_RH?: number;

  @IsOptional()
  @IsNumber()
  mainBearings_LH?: number;

  @IsOptional()
  @IsNumber()
  upperConnectionBearings_RH?: number;

  @IsOptional()
  @IsNumber()
  upperConnectionBearings_LH?: number;

  @IsOptional()
  @IsNumber()
  wristPinToMatingPart_RH?: number;

  @IsOptional()
  @IsNumber()
  wristPinToMatingPart_LH?: number;

  @IsOptional()
  @IsNumber()
  wristPinToBushing_RH?: number;

  @IsOptional()
  @IsNumber()
  wristPinToBushing_LH?: number;

  @IsOptional()
  @IsNumber()
  slideAdjNutToScrewSleeve_RH?: number;

  @IsOptional()
  @IsNumber()
  slideAdjNutToScrewSleeve_LH?: number;

  @IsOptional()
  @IsNumber()
  extraDoubleLockOpen_RH?: number;

  @IsOptional()
  @IsNumber()
  extraDoubleLockOpen_LH?: number;

  @IsOptional()
  @IsNumber()
  ballBoxArea_RH?: number;

  @IsOptional()
  @IsNumber()
  ballBoxArea_LH?: number;

  @IsOptional()
  @IsEnum(YesNoNaDncType)
  hasBeenAdjusted?: YesNoNaDncType;

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
}

class SlideCheckDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SlideDataDto)
  outerBefore?: SlideDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideDataDto)
  outerAfter?: SlideDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideDataDto)
  innerBefore?: SlideDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideDataDto)
  innerAfter?: SlideDataDto;

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
  @IsOptional()
  @IsEnum(LubeHydMonitorFlowPressSwGibType)
  system?: LubeHydMonitorFlowPressSwGibType;

  @IsOptional()
  @IsString()
  gauge?: string;

  @IsOptional()
  @IsEnum(OkNaDncDamageType)
  psi?: OkNaDncDamageType;
}

class LubricationHydraulicsDataDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LubricationHydraulicsGaugeDto)
  gauges?: LubricationHydraulicsGaugeDto[];

  @IsOptional()
  @IsEnum(YesNoDncType)
  changedOil?: YesNoDncType;

  @IsOptional()
  @IsNumber()
  oilTemperatureF?: number;

  @IsOptional()
  @IsString()
  oilMfgType?: string;

  @IsOptional()
  @IsEnum(YesNoDncType)
  changedFilter?: YesNoDncType;

  @IsOptional()
  @IsString()
  notes?: string;
}

class ClutchDataDto {
  @IsOptional()
  @IsString()
  clutchType?: string;

  @IsOptional()
  @IsString()
  clutchLocation?: string;

  @IsOptional()
  @IsNumber()
  brakeSpringBrake?: number;

  @IsOptional()
  @IsNumber()
  brakeSpringClutch?: number;

  @IsOptional()
  @IsString()
  brakeSpringStudBolt?: string;

  @IsOptional()
  @IsNumber()
  brakeAnchorClearanceFB?: number;

  @IsOptional()
  @IsNumber()
  brakeAnchorClearanceFTB?: number;

  @IsOptional()
  @IsNumber()
  brakeAnchorClearanceRTB?: number;

  @IsOptional()
  @IsNumber()
  brakeStoppingTime?: number;

  @IsOptional()
  @IsString()
  brakeLining?: string;

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
  @IsString()
  flywheelBearings?: string;

  @IsOptional()
  @IsString()
  flywheelBrake?: string;

  @IsOptional()
  @IsNumber()
  clutchEngagements?: number;

  @IsOptional()
  @IsString()
  clutchLining?: string;

  @IsOptional()
  @IsString()
  clutchSeals?: string;

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
  airRegulatorPSI?: number;

  @IsOptional()
  @IsNumber()
  airClutchTravel?: number;

  @IsOptional()
  @IsString()
  airLineOilerSetting?: string;

  @IsOptional()
  @IsNumber()
  hydClutchClearanceTotal?: number;

  @IsOptional()
  @IsNumber()
  hydClutchClearanceRear?: number;

  @IsOptional()
  @IsNumber()
  hydraulicPressurePSI?: number;

  @IsOptional()
  @IsNumber()
  accumulatorPSI?: number;

  @IsOptional()
  @IsString()
  rotaryUnion?: string;

  @IsOptional()
  @IsString()
  splinesDriveRingDisc?: string;

  @IsOptional()
  @IsString()
  adjustingNutLockSecure?: string;

  @IsOptional()
  @IsString()
  separateBrakeSeals?: string;

  @IsOptional()
  @IsString()
  flexDisc?: string;
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

export class UpdateServiceDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(ServiceType)
  type?: ServiceType;

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
