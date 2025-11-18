import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import {
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

export class UpdateClutchDto {
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
