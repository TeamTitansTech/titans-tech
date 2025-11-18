import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ServiceType, ServiceStatus } from '@titans-tech/shared/types';

// All section DTOs have been moved to separate files in dto/sections/
// Create service now only requires basic service information
// Sections should be added via individual PATCH endpoints after service creation

export class CreateServiceDto {
  @IsString()
  machineId: string;

  @IsDateString()
  date: string;

  @IsEnum(ServiceType)
  type: ServiceType;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsString()
  performedBy?: string;

  @IsOptional()
  @IsString()
  currentStep?: string;

  @IsOptional()
  @IsString()
  currentSectionKey?: string;

  @IsOptional()
  @IsArray()
  selectedSections?: string[];
}
