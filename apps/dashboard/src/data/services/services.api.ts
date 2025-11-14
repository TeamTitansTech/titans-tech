'use server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  CreateServicePayload,
  UpdateServicePayload,
  Service,
  LatestReport,
} from '@/data/types/services.types';

export const createService = async (payload: CreateServicePayload) => {
  const response = await responseHandler<Service>('/services', {
    method: 'POST',
    body: payload,
  });

  if (!response.errors) {
    revalidateTag(`services-${payload.machineId}`, 'max');
    revalidatePath(`/machines/${payload.machineId}`);
    revalidatePath(`/machines/${payload.machineId}/sections/bearing_clearance`);
  }

  return response;
};

export const getServices = async () => {
  return await responseHandler<Service[]>('/services', {
    method: 'GET',
  });
};

export const getServiceById = async (id: string) => {
  return await responseHandler<Service>(`/services/${id}`, {
    method: 'GET',
  });
};

export const getServicesByMachine = async (machineId: string) => {
  const options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    tags?: string[];
  } = {
    method: 'GET',
    tags: [`services-${machineId}`],
  };

  return await responseHandler<Service[]>(`/services/machine/${machineId}`, options);
};

export const updateService = async (
  id: string,
  payload: UpdateServicePayload,
  machineId?: string,
) => {
  const response = await responseHandler<Service>(`/services/${id}`, {
    method: 'PUT',
    body: payload,
  });

  if (!response.errors && machineId) {
    revalidateTag(`services-${machineId}`, 'max');
    revalidatePath(`/machines/${machineId}`);
    revalidatePath(`/machines/${machineId}/sections/bearing_clearance`);
  }

  return response;
};

export const getLatestReport = async (machineId: string) => {
  const options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    tags?: string[];
  } = {
    method: 'GET',
    tags: [`latest-report-${machineId}`],
  };

  return await responseHandler<LatestReport>(
    `/services/machines/${machineId}/latest-report`,
    options,
  );
};
