import {
  IsOptional,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { YesNoDncType } from '@titans-tech/shared/types';

class GibsDataDto {
  @IsEnum(YesNoDncType)
  hasBeenAdjusted: YesNoDncType;

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

export class UpdateGibsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GibsDataDto)
  outerBefore?: GibsDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsDataDto)
  outerData?: GibsDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsDataDto)
  innerBefore?: GibsDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GibsDataDto)
  innerData?: GibsDataDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
