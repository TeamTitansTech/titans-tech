import {
  IsArray,
  IsOptional,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  YesNoDncType,
  LubeHydMonitorFlowPressSwGibType,
  OkNaDncDamageType,
} from '@titans-tech/shared/types';

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

export class UpdateLubricationHydraulicsDto {
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
