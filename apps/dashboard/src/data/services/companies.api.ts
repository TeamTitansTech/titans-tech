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

export const getCompany = async (args?: { companyId?: string }) => {
  return await responseHandler<Company>('/companies/single', {
    method: 'GET',
    companyId: args?.companyId,
  });
};

export const createCompany = async (args: { data: CreateCompanyDto }) => {
  return await responseHandler<Company>('/companies', {
    method: 'POST',
    body: args.data,
  });
};

export const updateCompany = async (args: { companyId?: string; data: UpdateCompanyDto }) => {
  return await responseHandler<Company>('/companies/single', {
    method: 'PATCH',
    body: args.data,
    companyId: args.companyId,
  });
};

export const deleteCompany = async (args?: { companyId?: string }) => {
  return await responseHandler<void>('/companies/single', {
    method: 'DELETE',
    companyId: args?.companyId,
  });
};
