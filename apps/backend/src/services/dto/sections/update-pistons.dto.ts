import {
  IsOptional,
  ValidateNested,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class PistonsDataDto {
  // OUTER SECTION - LH Piston (4 measurements around piston)
  @IsNumber()
  outerLhFrontTop: number;

  @IsNumber()
  outerLhFrontBottom: number;

  @IsNumber()
  outerLhLeft: number;

  @IsNumber()
  outerLhRight: number;

  // OUTER SECTION - RH Piston (4 measurements around piston)
  @IsNumber()
  outerRhFrontTop: number;

  @IsNumber()
  outerRhFrontBottom: number;

  @IsNumber()
  outerRhLeft: number;

  @IsNumber()
  outerRhRight: number;

  // INNER SECTION - LH Piston (4 measurements around piston)
  @IsNumber()
  innerLhFrontTop: number;

  @IsNumber()
  innerLhFrontBottom: number;

  @IsNumber()
  innerLhLeft: number;

  @IsNumber()
  innerLhRight: number;

  // INNER SECTION - RH Piston (4 measurements around piston)
  @IsNumber()
  innerRhFrontTop: number;

  @IsNumber()
  innerRhFrontBottom: number;

  @IsNumber()
  innerRhLeft: number;

  @IsNumber()
  innerRhRight: number;
}

export class UpdatePistonsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PistonsDataDto)
  outerData?: PistonsDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PistonsDataDto)
  innerData?: PistonsDataDto;

  @IsOptional()
  @IsString()
  guidSeals?: string;

  @IsOptional()
  @IsString()
  pistonSeals?: string;

  @IsOptional()
  @IsString()
  vacuumSystem?: string;

  @IsOptional()
  @IsNumber()
  vacuumSystemAirPressureSetting?: number;

  @IsOptional()
  @IsString()
  vacuumSystemAirPressureUnit?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
