import { IsString, IsOptional, IsObject } from 'class-validator';
import { Permissions } from '../../types/permissions';

export class UpdatePermissionTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  permissions?: Permissions;
}
