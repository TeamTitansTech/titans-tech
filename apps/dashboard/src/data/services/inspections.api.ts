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

/**
 * Get all inspections (services filtered by type='INSPECTION')
 * Note: Backend should handle filtering by type
 */
export const getInspections = async () => {
  const response = await responseHandler<Service[]>('/services', {
    method: 'GET',
  });

  // Filter inspections on client-side (until backend implements filtering)
  if (response.data) {
    response.data = response.data.filter((service) => service.type === 'INSPECTION');
  }

  return response;
};

/**
 * Get inspection by ID
 */
export const getInspectionById = async (id: string) => {
  return await responseHandler<Service>(`/services/${id}`, {
    method: 'GET',
  });
};

/**
 * Get inspections for a specific machine
 */
export const getInspectionsByMachine = async (machineId: string) => {
  const options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    tags?: string[];
  } = {
    method: 'GET',
    tags: [`inspections-${machineId}`],
  };

  const response = await responseHandler<Service[]>(`/services/machine/${machineId}`, options);

  // Filter inspections on client-side (until backend implements filtering)
  if (response.data) {
    response.data = response.data.filter((service) => service.type === 'INSPECTION');
  }

  return response;
};
