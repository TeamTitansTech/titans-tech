'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import { CreateCompanyDto, UpdateCompanyDto, UserResponseDto } from '@titans-tech/shared';

export interface Company {
  id: string;
  slug: string;
  name: string;
  logo?: string | null;
  brandColor?: string | null;
  description?: string | null;
  _count?: {
    branches: number;
  };
}

export interface LoginResponse {
  accessToken: string;
  user: UserResponseDto;
}

export const loginUser = async (args: { companyId: string; email: string; password: string }) => {
  return await responseHandler<LoginResponse>(`/companies/${args.companyId}/login`, {
    method: 'POST',
    body: {
      email: args.email,
      password: args.password,
    },
  });
};

export const getCompanyPublicInfo = async (args: { companySlug: string }) => {
  return await responseHandler<Company>(`/companies/${args.companySlug}/public-info`, {
    method: 'GET',
  });
};

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
