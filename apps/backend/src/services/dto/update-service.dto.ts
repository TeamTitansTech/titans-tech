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
  DncToBedToBolsterType,
  ServiceType,
  ServiceStatus,
  YesNoDncType,
  LubeHydMonitorFlowPressSwGibType,
  OkNaDncDamageType,
} from '@titans-tech/db';

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
  @IsBoolean()
  hasBeenAdjusted?: boolean;

  @IsOptional()
  @IsString()
  combinedWith?: string;

  @IsOptional()
  @IsEnum(MatingPartType)
  matingPart?: MatingPartType;
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
  @IsEnum(DncToBedToBolsterType)
  parallelism?: DncToBedToBolsterType;

  @IsOptional()
  @IsBoolean()
  hasBeenAdjusted?: boolean;

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
  @IsBoolean()
  shutheightChecked?: boolean;

  @IsOptional()
  @IsString()
  actualSH?: string;

  @IsOptional()
  @IsString()
  overloadsOnMonitor?: string;

  @IsOptional()
  @IsString()
  indicatorReading?: string;
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
}

class GibsDataDto {
  @IsOptional()
  @IsBoolean()
  hasBeenAdjusted?: boolean;

  @IsOptional()
  @IsNumber()
  point1?: number;

  @IsOptional()
  @IsNumber()
  point2?: number;

  @IsOptional()
  @IsNumber()
  point3?: number;

  @IsOptional()
  @IsNumber()
  point4?: number;

  @IsOptional()
  @IsNumber()
  point5?: number;

  @IsOptional()
  @IsNumber()
  point6?: number;

  @IsOptional()
  @IsNumber()
  point7?: number;

  @IsOptional()
  @IsNumber()
  point8?: number;

  @IsOptional()
  @IsNumber()
  point9?: number;

  @IsOptional()
  @IsNumber()
  point10?: number;

  @IsOptional()
  @IsNumber()
  point11?: number;

  @IsOptional()
  @IsNumber()
  point12?: number;

  @IsOptional()
  @IsNumber()
  point13?: number;

  @IsOptional()
  @IsNumber()
  point14?: number;

  @IsOptional()
  @IsNumber()
  point15?: number;

  @IsOptional()
  @IsNumber()
  point16?: number;

  @IsOptional()
  @IsNumber()
  leftTop?: number;

  @IsOptional()
  @IsNumber()
  leftBottom?: number;

  @IsOptional()
  @IsNumber()
  rightTop?: number;

  @IsOptional()
  @IsNumber()
  rightBottom?: number;

  @IsOptional()
  @IsNumber()
  frontTop?: number;

  @IsOptional()
  @IsNumber()
  frontBottom?: number;

  @IsOptional()
  @IsNumber()
  backTop?: number;

  @IsOptional()
  @IsNumber()
  backBottom?: number;

  @IsOptional()
  @IsString()
  usable?: string;
}

class GibsCheckDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GibsDataDto)
  outerBefore?: GibsDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsDataDto)
  outerAfter?: GibsDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsDataDto)
  innerBefore?: GibsDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsDataDto)
  innerAfter?: GibsDataDto;
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
