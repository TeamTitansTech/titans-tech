import {
  IsOptional,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { YesNoDncType } from '@titans-tech/shared/types';

class TrammingDataDto {
  // Top Position measurements
  @IsNumber()
  outerTopTop: number;

  @IsNumber()
  outerTopBottom: number;

  @IsNumber()
  outerTopLeft: number;

  @IsNumber()
  outerTopRight: number;

  // Bottom Position measurements
  @IsNumber()
  outerBottomTop: number;

  @IsNumber()
  outerBottomBottom: number;

  @IsNumber()
  outerBottomLeft: number;

  @IsNumber()
  outerBottomRight: number;

  // Left Position measurements
  @IsNumber()
  outerLeftTop: number;

  @IsNumber()
  outerLeftBottom: number;

  @IsNumber()
  outerLeftLeft: number;

  @IsNumber()
  outerLeftRight: number;

  // Right Position measurements
  @IsNumber()
  outerRightTop: number;

  @IsNumber()
  outerRightBottom: number;

  @IsNumber()
  outerRightLeft: number;

  @IsNumber()
  outerRightRight: number;

  // Inner measurements follow the same pattern
  @IsNumber()
  innerTopTop: number;

  @IsNumber()
  innerTopBottom: number;

  @IsNumber()
  innerTopLeft: number;

  @IsNumber()
  innerTopRight: number;

  @IsNumber()
  innerBottomTop: number;

  @IsNumber()
  innerBottomBottom: number;

  @IsNumber()
  innerBottomLeft: number;

  @IsNumber()
  innerBottomRight: number;

  @IsNumber()
  innerLeftTop: number;

  @IsNumber()
  innerLeftBottom: number;

  @IsNumber()
  innerLeftLeft: number;

  @IsNumber()
  innerLeftRight: number;

  @IsNumber()
  innerRightTop: number;

  @IsNumber()
  innerRightBottom: number;

  @IsNumber()
  innerRightLeft: number;

  @IsNumber()
  innerRightRight: number;
}

export class UpdateTrammingDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TrammingDataDto)
  outerData?: TrammingDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TrammingDataDto)
  innerData?: TrammingDataDto;

  @IsOptional()
  @IsEnum(YesNoDncType)
  slideTram?: YesNoDncType;

  @IsOptional()
  @IsString()
  notes?: string;
}
