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
