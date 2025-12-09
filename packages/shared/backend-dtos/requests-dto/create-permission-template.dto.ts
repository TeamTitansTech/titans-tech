import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { Permissions } from '../../types/permissions';

export class CreatePermissionTemplateBodyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsNotEmpty()
  permissions: Permissions;
}
