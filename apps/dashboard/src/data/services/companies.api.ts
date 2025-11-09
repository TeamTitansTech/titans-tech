'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import { CreateCompanyDto, UpdateCompanyDto } from '@titans-tech/shared';

export interface Company {
  id: string;
  slug: string;
  name: string;
  logo?: string | null;
  brandColor?: string | null;
}

export const getAllCompanies = async () => {
  return await responseHandler<Company[]>('/companies', {
    method: 'GET',
  });
};

export const getCompany = async (companyId: string) => {
  return await responseHandler<Company>('/companies/single', {
    method: 'GET',
    headers: {
      'x-company-id': companyId,
    },
  });
};

export const createCompany = async (data: CreateCompanyDto) => {
  return await responseHandler<Company>('/companies', {
    method: 'POST',
    body: data,
  });
};

export const updateCompany = async (companyId: string, data: UpdateCompanyDto) => {
  return await responseHandler<Company>('/companies/single', {
    method: 'PATCH',
    body: data,
    headers: {
      'x-company-id': companyId,
    },
  });
};

export const deleteCompany = async (companyId: string) => {
  return await responseHandler<void>('/companies/single', {
    method: 'DELETE',
    headers: {
      'x-company-id': companyId,
    },
  });
};
