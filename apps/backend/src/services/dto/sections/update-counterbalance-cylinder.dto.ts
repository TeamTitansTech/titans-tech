import { IsOptional, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

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

export class UpdateCounterbalanceCylinderDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CounterbalanceCylinderDataDto)
  outerData?: CounterbalanceCylinderDataDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CounterbalanceCylinderDataDto)
  innerData?: CounterbalanceCylinderDataDto;
}
