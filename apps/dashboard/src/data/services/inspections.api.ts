import { responseHandler } from '@/data/helpers/responseHandler';
import type { Service } from '@/data/types/services.types';

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
 * Get all services (inspections and maintenances) for a specific machine
 * Used by section pages to display measurement data from all service types
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

  // Don't filter by type - section pages need data from both INSPECTION and MAINTENANCE services
  return response;
};

export { createInspection } from './inspections.actions';
