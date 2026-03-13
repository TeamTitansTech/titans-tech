import { responseHandler } from '@/data/helpers/responseHandler';
import type { Service, LatestReport, CounterbalanceAlert } from '@/data/types/services.types';
import type { AlertsSummaryResponseDto } from '@titans-tech/shared/backend-dtos';
import type { LengthUnitFromEnum } from '@/contexts/UnitManagerContext';

// Extended Service type that includes machine relations as returned by the backend
export interface ServiceWithMachineRelations extends Service {
  machine?: {
    branch?: {
      defaultMeasurementUnit: LengthUnitFromEnum;
    };
  };
}

export const getServices = async () => {
  return await responseHandler<Service[]>('/services', {
    method: 'GET',
  });
};

export const getServiceById = async (id: string) => {
  return await responseHandler<ServiceWithMachineRelations>(`/services/${id}`, {
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

export const getLatestReport = async (machineId: string) => {
  return await responseHandler<LatestReport>(`/services/machines/${machineId}/latest-report`, {
    method: 'GET',
    tags: [`latest-report-${machineId}`, 'latest-reports'],
  });
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

export {
  createService,
  updateService,
  updateServiceSection,
  completeService,
  deleteService,
} from './services.actions';
