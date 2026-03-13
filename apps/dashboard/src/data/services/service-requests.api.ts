import { responseHandler } from '@/data/helpers/responseHandler';

export type ServiceRequestStatus = 'OPEN' | 'CLOSED';

export interface ServiceRequestResponse {
  id: string;
  machineId: string;
  machineName: string;
  machineSerialNumber: string | null;
  companyName: string;
  branchName: string;
  status: ServiceRequestStatus;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string | null;
  problemDescription: string;
  imageUrl: string | null;
  ipAddress: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  isMobile: boolean;
  createdAt: string;
  closedAt: string | null;
  services: Array<{
    id: string;
    date: string;
    type: string;
    status: string;
  }>;
}

export interface CreateServiceFromRequestResponse {
  serviceId: string;
  serviceRequest: ServiceRequestResponse;
}

/**
 * Get all service requests (admin endpoint)
 */
export const getServiceRequests = async (params?: {
  status?: ServiceRequestStatus;
  machineId?: string;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.machineId) searchParams.append('machineId', params.machineId);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const queryString = searchParams.toString();
  return await responseHandler<ServiceRequestResponse[]>(
    `/service-requests${queryString ? `?${queryString}` : ''}`,
  );
};

/**
 * Get service requests for a specific machine
 */
export const getServiceRequestsByMachine = async (machineId: string) => {
  return await responseHandler<ServiceRequestResponse[]>(`/service-requests/machine/${machineId}`);
};

/**
 * Get a single service request by ID
 */
export const getServiceRequestById = async (id: string) => {
  return await responseHandler<ServiceRequestResponse>(`/service-requests/${id}`);
};

/**
 * Close a service request
 */
export const closeServiceRequest = async (id: string) => {
  return await responseHandler<ServiceRequestResponse>(`/service-requests/${id}/close`, {
    method: 'PATCH',
  });
};

/**
 * Reopen a closed service request
 */
export const reopenServiceRequest = async (id: string) => {
  return await responseHandler<ServiceRequestResponse>(`/service-requests/${id}/reopen`, {
    method: 'PATCH',
  });
};

/**
 * Create a service from a service request
 * This automatically closes the service request
 */
export const createServiceFromRequest = async (id: string, performedBy?: string) => {
  return await responseHandler<CreateServiceFromRequestResponse>(
    `/service-requests/${id}/create-service`,
    {
      method: 'POST',
      body: { performedBy },
    },
  );
};
