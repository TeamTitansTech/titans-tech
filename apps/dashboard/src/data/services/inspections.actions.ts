'use server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import type { Service, CreateServicePayload } from '@/data/types/services.types';

/**
 * Create an inspection (service with type='INSPECTION')
 */
export const createInspection = async (payload: CreateServicePayload) => {
  const response = await responseHandler<Service>('/services', {
    method: 'POST',
    body: {
      ...payload,
      type: 'INSPECTION', // Force type to INSPECTION
    },
  });

  if (!response.errors) {
    revalidateTag(`inspections-${payload.machineId}`, 'max');
    revalidatePath(`/machines/${payload.machineId}`);
    revalidatePath(`/machines/${payload.machineId}/sections/bearing_clearance`);
  }

  return response;
};
