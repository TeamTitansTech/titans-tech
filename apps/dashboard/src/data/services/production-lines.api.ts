'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  ProductionLine,
  CreateProductionLineDto,
  UpdateProductionLineDto,
  UpdateNodePositionsDto,
  UpdateEdgesDto,
} from '../types/production-lines.types';

/**
 * Busca todas as linhas de produção
 */
export const getProductionLines = async () => {
  return await responseHandler<ProductionLine[]>('/production-lines', {
    method: 'GET',
  });
};

/**
 * Busca uma linha de produção específica por ID
 */
export const getProductionLineById = async (id: string) => {
  return await responseHandler<ProductionLine>(`/production-lines/${id}`, {
    method: 'GET',
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
  return await responseHandler<ProductionLine>(`/production-lines/${id}`, {
    method: 'PATCH',
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

/**
 * Update node positions for React Flow canvas
 */
export const updateNodePositions = async (id: string, data: UpdateNodePositionsDto) => {
  return await responseHandler<ProductionLine>(`/production-lines/${id}/positions`, {
    method: 'PATCH',
    body: data,
  });
};

/**
 * Update edges for React Flow canvas (bulk replace)
 */
export const updateEdges = async (id: string, data: UpdateEdgesDto) => {
  return await responseHandler<ProductionLine>(`/production-lines/${id}/edges`, {
    method: 'PATCH',
    body: data,
  });
};
