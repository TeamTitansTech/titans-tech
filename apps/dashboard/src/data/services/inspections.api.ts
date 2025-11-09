'use server';
import { revalidateTag } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  CreateInspectionPayload,
  Inspection,
} from '@/data/types/inspections.types';

export const createInspection = async (payload: CreateInspectionPayload) => {
  const response = await responseHandler<Inspection>('/inspections', {
    method: 'POST',
    body: payload,
  });

  if (!response.errors) {
    revalidateTag(`inspections-${payload.machineId}`, 'default');
  }

  return response;
};

export const getInspections = async () => {
  return await responseHandler<Inspection[]>('/inspections', {
    method: 'GET',
  });
};

export const getInspectionById = async (id: string) => {
  return await responseHandler<Inspection>(`/inspections/${id}`, {
    method: 'GET',
  });
};

export const getInspectionsByMachine = async (machineId: string) => {
  const options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    tags?: string[];
  } = {
    method: 'GET',
    tags: [`inspections-${machineId}`],
  };

  return await responseHandler<Inspection[]>(`/inspections/machine/${machineId}`, options);
};
