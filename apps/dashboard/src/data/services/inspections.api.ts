'use server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import type { CreateInspectionPayload, Inspection } from '@/data/types/inspections.types';

export const createInspection = async (payload: CreateInspectionPayload) => {
  const response = await responseHandler<Inspection>('/services', {
    method: 'POST',
    body: payload,
  });

  if (!response.errors) {
    revalidateTag(`inspections-${payload.machineId}`, 'max');
    revalidatePath(`/machines/${payload.machineId}`);
    revalidatePath(`/machines/${payload.machineId}/sections/bearing_clearance`);
  }

  return response;
};

export const getInspections = async () => {
  return await responseHandler<Inspection[]>('/services', {
    method: 'GET',
  });
};

export const getInspectionById = async (id: string) => {
  return await responseHandler<Inspection>(`/services/${id}`, {
    method: 'GET',
  });
};

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

  return await responseHandler<Inspection[]>(`/services/machine/${machineId}`, options);
};
