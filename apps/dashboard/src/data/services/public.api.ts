import { responseHandler } from '@/data/helpers/responseHandler';

export interface PublicMachineInfo {
  id: string;
  name: string;
  serialNumber: string | null;
  imageUrl: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    brandColor: string | null;
    accentColor: string | null;
  };
  branch: {
    id: string;
    name: string;
  };
}

export interface PublicServiceRequest {
  machineId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  problemDescription: string;
  imageUrl?: string;
}

export interface PublicServiceRequestResponse {
  success: boolean;
  serviceRequestId: string;
}

/**
 * Get public machine info (no authentication required)
 */
export const getPublicMachineInfo = async (machineId: string) => {
  return await responseHandler<PublicMachineInfo>(`/machines/${machineId}/public`);
};

/**
 * Submit a public service request (no authentication required)
 * Creates a new service request entry
 */
export const submitPublicServiceRequest = async (data: PublicServiceRequest) => {
  return await responseHandler<PublicServiceRequestResponse>('/service-requests/public', {
    method: 'POST',
    body: data,
  });
};
