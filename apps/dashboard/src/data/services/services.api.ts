'use server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  CreateServicePayload,
  UpdateServicePayload,
  Service,
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

/**
 * Update a specific section of a service (calls Prisma directly)
 */
export const updateServiceSection = async (
  serviceId: string,
  sectionKey: string,
  sectionData: any,
  machineId?: string,
) => {
  try {
    // Import route handler logic
    const { PATCH } = await import('@/app/api/services/[serviceId]/sections/[sectionKey]/route');

    // Create mock request and context
    const mockRequest = {
      json: async () => sectionData,
    } as any;

    const mockContext = {
      params: Promise.resolve({ serviceId, sectionKey }),
    };

    // Call the route handler
    const response = await PATCH(mockRequest, mockContext);
    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        errors: data.errors || [data.error || 'Unknown error'],
        rawErrors: data,
      };
    }

    if (machineId) {
      revalidateTag(`services-${machineId}`, 'max');
      revalidatePath(`/machines/${machineId}`);
      revalidatePath(`/machines/${machineId}/sections/bearing_clearance`);
    }

    return { data: data.data, errors: null, rawErrors: null };
  } catch (error) {
    console.error('Error updating section:', error);
    return {
      data: null,
      errors: [error instanceof Error ? error.message : 'Connection error'],
      rawErrors: error as any,
    };
  }
};

/**
 * Mark a service as completed (calls Prisma directly)
 */
export const completeService = async (
  serviceId: string,
  performedBy: string,
  machineId?: string,
) => {
  try {
    // Import route handler logic
    const { POST } = await import('@/app/api/services/[serviceId]/complete/route');

    // Create mock request and context
    const mockRequest = {
      json: async () => ({ performedBy }),
    } as any;

    const mockContext = {
      params: Promise.resolve({ serviceId }),
    };

    // Call the route handler
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        errors: data.errors || [data.error || 'Unknown error'],
        rawErrors: data,
      };
    }

    if (machineId) {
      revalidateTag(`services-${machineId}`, 'max');
      revalidatePath(`/machines/${machineId}`);
      revalidatePath(`/machines/${machineId}/sections/bearing_clearance`);
    }

    return { data: data.data, errors: null, rawErrors: null };
  } catch (error) {
    console.error('Error completing service:', error);
    return {
      data: null,
      errors: [error instanceof Error ? error.message : 'Connection error'],
      rawErrors: error as any,
    };
  }
};

/**
 * Delete a service
 */
export const deleteService = async (serviceId: string, machineId?: string) => {
  try {
    // Import route handler logic
    const { DELETE } = await import('@/app/api/services/[serviceId]/route');

    // Create mock request and context
    const mockRequest = {} as any;

    const mockContext = {
      params: Promise.resolve({ serviceId }),
    };

    // Call the route handler
    const response = await DELETE(mockRequest, mockContext);
    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        errors: data.errors || [data.error || 'Unknown error'],
        rawErrors: data,
      };
    }

    if (machineId) {
      revalidateTag(`services-${machineId}`, 'max');
      revalidatePath(`/machines/${machineId}`);
      revalidatePath(`/machines/${machineId}/sections/bearing_clearance`);
    }

    return { data: data.data, errors: null, rawErrors: null };
  } catch (error) {
    console.error('Error deleting service:', error);
    return {
      data: null,
      errors: [error instanceof Error ? error.message : 'Connection error'],
      rawErrors: error as any,
    };
  }
};
