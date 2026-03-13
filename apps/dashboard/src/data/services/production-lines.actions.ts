'use server';
import { revalidateTag } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import type { ProductionLine, UpdateProductionLineDto } from '../types/production-lines.types';

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
