import { responseHandler } from '@/data/helpers/responseHandler';
import type { ProductionLine, CreateProductionLineDto } from '../types/production-lines.types';

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
 * Deleta uma linha de produção
 */
export const deleteProductionLine = async (id: string) => {
  return await responseHandler<void>(`/production-lines/${id}`, {
    method: 'DELETE',
  });
};

export { updateProductionLine } from './production-lines.actions';
