import {
  IsOptional,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ParallelismType,
  YesNoNaDncType,
  YesNoDncType,
} from '@titans-tech/shared/types';

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

export class UpdateSlideDto {
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
