import {
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MatingPartType,
  ParallelismType,
  MeasurementUnit,
} from '@titans-tech/db';

class BearingClearanceDto {
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
  slide_adj_nut_to_screw_sleeve_RH: number;

  @IsNumber()
  slide_adj_nut_to_screw_sleeve_LH: number;

  @IsNumber()
  extra_double_lockOpen_RH: number;

  @IsNumber()
  extra_double_lockOpen_LH: number;

  @IsNumber()
  ball_box_area_RH: number;

  @IsNumber()
  ball_box_area_LH: number;

  @IsNumber()
  innerTotalClearance_RH: number;

  @IsNumber()
  innerTotalClearance_LH: number;

  @IsNumber()
  innerMainBearings_RH: number;

  @IsNumber()
  innerMainBearings_LH: number;

  @IsNumber()
  innerUpperConnectionBearings_RH: number;

  @IsNumber()
  innerUpperConnectionBearings_LH: number;

  @IsNumber()
  innerWristPinToMatingPart_RH: number;

  @IsNumber()
  innerWristPinToMatingPart_LH: number;

  @IsNumber()
  innerWristPinToBushing_RH: number;

  @IsNumber()
  innerWristPinToBushing_LH: number;

  @IsNumber()
  innerSlide_adj_nut_to_screw_sleeve_RH: number;

  @IsNumber()
  innerSlide_adj_nut_to_screw_sleeve_LH: number;

  @IsNumber()
  innerExtra_double_lockOpen_RH: number;

  @IsNumber()
  innerExtra_double_lockOpen_LH: number;

  @IsNumber()
  innerBall_box_area_RH: number;

  @IsNumber()
  innerBall_box_area_LH: number;

  @IsString()
  combined_with: string;

  @IsEnum(MatingPartType)
  mating_part: MatingPartType;
}

class BearingClearanceCheckDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDto)
  before?: BearingClearanceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceDto)
  after?: BearingClearanceDto;
}

class SlideDataDto {
  @IsEnum(ParallelismType)
  parallelism: ParallelismType;

  @IsBoolean()
  hasBeenAdjusted: boolean;

  @IsNumber()
  position1: number;

  @IsNumber()
  position2: number;

  @IsNumber()
  position3: number;

  @IsEnum(MeasurementUnit)
  unit: MeasurementUnit;

  @IsBoolean()
  shutheightChecked: boolean;

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
  before?: SlideDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideDataDto)
  after?: SlideDataDto;
}

class SlideInspectionDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SlideCheckDto)
  outerSlide?: SlideCheckDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideCheckDto)
  innerSlide?: SlideCheckDto;
}

export class CreateInspectionDto {
  @IsString()
  machineId: string;

  @IsDateString()
  date: string;

  @IsBoolean()
  isMaintenance: boolean;

  @IsOptional()
  @IsString()
  performedBy?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BearingClearanceCheckDto)
  bearingClearance?: BearingClearanceCheckDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideInspectionDto)
  slide?: SlideInspectionDto;
}
