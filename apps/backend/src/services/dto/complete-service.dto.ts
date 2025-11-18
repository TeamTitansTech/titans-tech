import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ServiceStatus } from '@titans-tech/shared/types';

export class CompleteServiceDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  completedBy?: string;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}
