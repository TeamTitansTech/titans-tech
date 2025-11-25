import { Permissions } from '../../types/permissions';

export class PermissionTemplateResponseDto {
  id: string;
  name: string;
  description: string | null;
  permissions: Permissions;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
