import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FoundationType,
  FrameType,
  MachineClutchType,
  PneumaticSystemType,
  PressMountingType,
  MachineFeaturesType,
} from '@titans-tech/shared/types';

class MachineFieldDto {
  @IsString()
  fieldSlug: string;

  @IsString()
  value: string;
}

export class UpdateMachineDto {
  @IsOptional()
  @IsString()
  blueprintId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MachineFieldDto)
  fields?: MachineFieldDto[];

  // Optional machine specifications
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  sizeTonnage?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  stroke?: string;

  @IsOptional()
  @IsEnum(FoundationType)
  foundationType?: FoundationType;

  @IsOptional()
  @IsEnum(FrameType)
  frameType?: FrameType;

  @IsOptional()
  @IsEnum(MachineClutchType)
  clutchType?: MachineClutchType;

  @IsOptional()
  @IsEnum(PneumaticSystemType)
  pneumaticSystem?: PneumaticSystemType;

  @IsOptional()
  @IsEnum(PressMountingType)
  pressMounting?: PressMountingType;

  @IsOptional()
  @IsEnum(MachineFeaturesType)
  features?: MachineFeaturesType;
}
