'use server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  CreateServicePayload,
  UpdateServicePayload,
  Service,
  LatestReport,
  CounterbalanceAlert,
} from '@/data/types/services.types';
import type { AlertsSummaryResponseDto } from '@titans-tech/shared/backend-dtos';

export const createService = async (payload: CreateServicePayload) => {
  const response = await responseHandler<Service>('/services', {
    method: 'POST',
    body: payload,
  });

  if (!response.errors) {
    revalidateTag(`services-${payload.machineId}`, 'max');
    revalidateTag(`latest-report-${payload.machineId}`, 'max');
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
    revalidateTag(`latest-report-${machineId}`, 'max');
    revalidatePath(`/machines/${machineId}`);
    revalidatePath(`/machines/${machineId}/sections/bearing_clearance`);
  }

  return response;
};

export const getLatestReport = async (machineId: string) => {
  return await responseHandler<LatestReport>(`/services/machines/${machineId}/latest-report`, {
    method: 'GET',
    tags: [`latest-report-${machineId}`, 'latest-reports'],
  });
};

/**
 * Update a specific section of a service
 * @param sectionData - Section-specific data (type varies by section)
 */
export const updateServiceSection = async (
  serviceId: string,
  sectionKey: string,
  sectionData:
    | UpdateServicePayload['bearingClearance']
    | UpdateServicePayload['slideSingleHammer']
    | UpdateServicePayload['slideDoubleHammer']
    | UpdateServicePayload['gibs']
    | UpdateServicePayload['lubricationHydraulics']
    | UpdateServicePayload['clutch']
    | UpdateServicePayload['counterbalanceCylinder']
    | UpdateServicePayload['tramming']
    | UpdateServicePayload['pistons'],
  machineId?: string,
) => {
  // Map section keys to backend endpoint paths
  const sectionEndpointMap: Record<string, string> = {
    BEARING_CLEARANCE: 'bearing-clearance',
    SLIDE_SINGLE_HAMMER: 'slide-single-hammer',
    SLIDE_DOUBLE_HAMMER: 'slide-double-hammer',
    GIBS: 'gibs',
    LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubrication-hydraulics',
    CLUTCH: 'clutch',
    COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalance-cylinder',
    TRAMMING: 'tramming',
    PISTONS: 'pistons',
  };

  const endpoint = sectionEndpointMap[sectionKey];
  if (!endpoint) {
    return {
      data: null,
      errors: [`Invalid section key: ${sectionKey}`],
      rawErrors: { error: 'Invalid section key' },
    };
  }

  const response = await responseHandler<Service>(`/services/${serviceId}/sections/${endpoint}`, {
    method: 'PATCH',
    body: sectionData,
  });

  if (!response.errors && machineId) {
    revalidateTag(`services-${machineId}`, 'max');
    revalidateTag(`latest-report-${machineId}`, 'max');
    revalidatePath(`/machines/${machineId}`);
    revalidatePath(`/machines/${machineId}/sections/bearing_clearance`);
  }

  return response;
};

/**
 * Mark a service as completed
 */
export const completeService = async (
  serviceId: string,
  performedBy: string,
  machineId?: string,
) => {
  const response = await responseHandler<Service>(`/services/${serviceId}/complete`, {
    method: 'PATCH',
    body: { completedBy: performedBy },
  });

  if (!response.errors && machineId) {
    revalidateTag(`services-${machineId}`, 'max');
    revalidateTag(`latest-report-${machineId}`, 'max');
    revalidatePath(`/machines/${machineId}`);
    revalidatePath(`/machines/${machineId}/sections/bearing_clearance`);
  }

  return response;
};

/**
 * Delete a service
 */
export const deleteService = async (serviceId: string, machineId?: string) => {
  const response = await responseHandler<void>(`/services/${serviceId}`, {
    method: 'DELETE',
  });

  if (!response.errors && machineId) {
    revalidateTag(`services-${machineId}`, 'max');
    revalidateTag(`latest-report-${machineId}`, 'max');
    revalidatePath(`/machines/${machineId}`);
    revalidatePath(`/machines/${machineId}/sections/bearing_clearance`);
  }

  return response;
};

/**
 * Get counterbalance alerts for a specific service
 */
export const getCounterbalanceAlertsForService = async (serviceId: string) => {
  return await responseHandler<CounterbalanceAlert[]>(
    `/alerts/counterbalance/service/${serviceId}`,
    {
      method: 'GET',
    },
  );
};

/**
 * Get alerts summary for a service
 */
export const getAlertsSummary = async (serviceId: string) => {
  return await responseHandler<AlertsSummaryResponseDto>(`/services/${serviceId}/alerts-summary`, {
    method: 'GET',
  });
};
