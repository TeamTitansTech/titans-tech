import { responseHandler } from '@/data/helpers/responseHandler';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  UpdateCompanyLimitsDto,
  CompanyUsageResponseDto,
  AdminManagerUserResponseDto,
} from '@titans-tech/shared/backend-dtos';

export interface Company {
  id: string;
  slug: string;
  name: string;
  logo?: string | null;
  loginLogo?: string | null;
  brandColor?: string | null;
  accentColor?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  isActive?: boolean;

  // Contract limits
  contractMaxBranches: number;
  contractMaxUsers: number;
  contractMaxMachines: number;
  contractMaxProductionLines: number;

  createdAt: string;
  updatedAt: string;
  _count?: {
    branches: number;
  };
}

export const getAllCompanies = async () => {
  return await responseHandler<Company[]>('/companies', {
    method: 'GET',
  });
};

export const getCompany = async (args: { companyId: string }) => {
  return await responseHandler<Company>(`/companies/${args.companyId}`, {
    method: 'GET',
  });
};

export const getCompanyPublicInfo = async (args: { companySlug: string }) => {
  return await responseHandler<Company>(`/companies/public/${args.companySlug}`, {
    method: 'GET',
    cache: 'no-store', // Always fetch fresh theme colors
  });
};

export const createCompany = async (args: { data: CreateCompanyDto }) => {
  return await responseHandler<Company>('/companies', {
    method: 'POST',
    body: args.data,
  });
};

export const updateCompany = async (args: { companyId: string; data: UpdateCompanyDto }) => {
  return await responseHandler<Company>(`/companies/${args.companyId}`, {
    method: 'PATCH',
    body: args.data,
  });
};

export const deleteCompany = async (args: { companyId: string }) => {
  return await responseHandler<void>(`/companies/${args.companyId}`, {
    method: 'DELETE',
  });
};

export const getAdminManagerUsers = async (companyId: string) => {
  return await responseHandler<AdminManagerUserResponseDto[]>(
    `/companies/${companyId}/admin-manager-users`,
    {
      method: 'GET',
    },
  );
};

export const updateCompanyLimits = async (args: {
  companyId: string;
  data: UpdateCompanyLimitsDto;
}) => {
  return await responseHandler<Company>(`/companies/${args.companyId}/limits`, {
    method: 'PATCH',
    body: args.data,
  });
};

export const getCompanyUsageStats = async (args: { companyId: string }) => {
  return await responseHandler<CompanyUsageResponseDto>(`/companies/${args.companyId}/usage`, {
    method: 'GET',
  });
};
