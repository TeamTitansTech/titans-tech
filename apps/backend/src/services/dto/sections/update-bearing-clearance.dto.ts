import {
  IsOptional,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MatingPartType,
  YesNoNaDncType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncDamagedType,
  ConditionOkNaDncBrokenLooseType,
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

export class UpdateBearingClearanceDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDataDto)
  outerBefore?: BearingClearanceDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDataDto)
  outerData?: BearingClearanceDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDataDto)
  innerBefore?: BearingClearanceDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDataDto)
  innerData?: BearingClearanceDataDto;
}
