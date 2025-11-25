'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  PermissionTemplateResponseDto,
  CreatePermissionTemplateDto,
  UpdatePermissionTemplateDto,
} from '@titans-tech/shared/backend-dtos';

/**
 * Busca todos os templates de permissão de uma empresa
 */
export const getPermissionTemplates = async (companyId: string) => {
  return await responseHandler<PermissionTemplateResponseDto[]>(
    `/permission-templates?companyId=${companyId}`,
    {
      method: 'GET',
    },
  );
};

/**
 * Busca um template de permissão específico por ID
 */
export const getPermissionTemplateById = async (id: string) => {
  return await responseHandler<PermissionTemplateResponseDto>(`/permission-templates/${id}`, {
    method: 'GET',
  });
};

/**
 * Cria um novo template de permissão
 */
export const createPermissionTemplate = async (data: CreatePermissionTemplateDto) => {
  return await responseHandler<PermissionTemplateResponseDto>('/permission-templates', {
    method: 'POST',
    body: data,
  });
};

/**
 * Atualiza um template de permissão existente
 */
export const updatePermissionTemplate = async (id: string, data: UpdatePermissionTemplateDto) => {
  return await responseHandler<PermissionTemplateResponseDto>(`/permission-templates/${id}`, {
    method: 'PATCH',
    body: data,
  });
};

/**
 * Deleta um template de permissão
 */
export const deletePermissionTemplate = async (id: string) => {
  return await responseHandler<void>(`/permission-templates/${id}`, {
    method: 'DELETE',
  });
};
