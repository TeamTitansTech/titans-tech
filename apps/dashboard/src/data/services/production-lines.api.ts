'use server';
import { revalidateTag } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  ProductionLine,
  CreateProductionLineDto,
  UpdateProductionLineDto,
} from '../types/production-lines.types';

/**
 * Busca todas as linhas de produção
 */
export const getProductionLines = async () => {
  return await responseHandler<ProductionLine[]>('/production-lines', {
    method: 'GET',
    tags: ['production-lines'],
  });
};

/**
 * Busca uma linha de produção específica por ID
 */
export const getProductionLineById = async (id: string) => {
  return await responseHandler<ProductionLine>(`/production-lines/${id}`, {
    method: 'GET',
    tags: ['production-lines', `production-line-${id}`],
  });
};

/**
 * Cria uma nova linha de produção
 */
export const createProductionLine = async (data: CreateProductionLineDto) => {
  return await responseHandler<ProductionLine>('/production-lines', {
    method: 'POST',
    body: data,
  });
};

/**
 * Atualiza uma linha de produção existente
 */
export const updateProductionLine = async (id: string, data: UpdateProductionLineDto) => {
  const result = await responseHandler<ProductionLine>(`/production-lines/${id}`, {
    method: 'PATCH',
    body: data,
  });

  if (!result.errors) {
    revalidateTag('production-lines', 'max');
    revalidateTag(`production-line-${id}`, 'max');
  }

  return result;
};

/**
 * Deleta uma linha de produção
 */
export const deleteProductionLine = async (id: string) => {
  return await responseHandler<void>(`/production-lines/${id}`, {
    method: 'DELETE',
  });
};
