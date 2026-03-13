import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  PermissionTemplateResponseDto,
  CreatePermissionTemplateBodyDto,
  UpdatePermissionTemplateDto,
} from '@titans-tech/shared/backend-dtos';

/**
 * Busca todos os templates de permissão de uma empresa
 */
export const getPermissionTemplates = async (companyId: string) => {
  return await responseHandler<PermissionTemplateResponseDto[]>(
    `/companies/${companyId}/permission-templates`,
    {
      method: 'GET',
    },
  );
};

/**
 * Busca um template de permissão específico por ID
 */
export const getPermissionTemplateById = async (companyId: string, id: string) => {
  return await responseHandler<PermissionTemplateResponseDto>(
    `/companies/${companyId}/permission-templates/${id}`,
    {
      method: 'GET',
    },
  );
};

/**
 * Cria um novo template de permissão
 */
export const createPermissionTemplate = async (
  companyId: string,
  data: CreatePermissionTemplateBodyDto,
) => {
  return await responseHandler<PermissionTemplateResponseDto>(
    `/companies/${companyId}/permission-templates`,
    {
      method: 'POST',
      body: data,
    },
  );
};

/**
 * Atualiza um template de permissão existente
 */
export const updatePermissionTemplate = async (
  companyId: string,
  id: string,
  data: UpdatePermissionTemplateDto,
) => {
  return await responseHandler<PermissionTemplateResponseDto>(
    `/companies/${companyId}/permission-templates/${id}`,
    {
      method: 'PATCH',
      body: data,
    },
  );
};

/**
 * Deleta um template de permissão
 */
export const deletePermissionTemplate = async (companyId: string, id: string) => {
  return await responseHandler<void>(`/companies/${companyId}/permission-templates/${id}`, {
    method: 'DELETE',
  });
};
