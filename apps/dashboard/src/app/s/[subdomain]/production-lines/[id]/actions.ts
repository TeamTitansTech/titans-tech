'use server';

import { revalidatePath } from 'next/cache';
import { updateProductionLine } from '@/data/services/production-lines.api';

export async function updateProductionLineName(
  productionLineId: string,
  name: string,
  currentPath: string,
) {
  try {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return {
        success: false,
        error: 'nameRequired',
      };
    }

    const response = await updateProductionLine(productionLineId, {
      name: trimmedName,
    });

    if (response.errors) {
      return {
        success: false,
        error: 'errorSavingName',
      };
    }

    if (response.data) {
      revalidatePath(currentPath);
      revalidatePath('/production-lines');
      revalidatePath('/admin/production-lines');

      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: 'errorSavingName',
    };
  } catch (error) {
    console.error('Error updating production line name:', error);
    return {
      success: false,
      error: 'errorSavingName',
    };
  }
}
