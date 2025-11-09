'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import { CreateCompanyBranchDto, UpdateCompanyBranchDto } from '@titans-tech/shared';

export interface CompanyBranch {
  id: string;
  name: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getAllBranches = async (companyId: string) => {
  return await responseHandler<CompanyBranch[]>('/company-branches', {
    method: 'GET',
    headers: {
      'x-company-id': companyId,
    },
  });
};

export const getBranch = async (companyId: string, branchId: string) => {
  return await responseHandler<CompanyBranch>(`/company-branches/${branchId}`, {
    method: 'GET',
    headers: {
      'x-company-id': companyId,
    },
  });
};

export const createBranch = async (companyId: string, data: CreateCompanyBranchDto) => {
  return await responseHandler<CompanyBranch>('/company-branches', {
    method: 'POST',
    body: data,
    headers: {
      'x-company-id': companyId,
    },
  });
};

export const updateBranch = async (
  companyId: string,
  branchId: string,
  data: UpdateCompanyBranchDto,
) => {
  return await responseHandler<CompanyBranch>(`/company-branches/${branchId}`, {
    method: 'PATCH',
    body: data,
    headers: {
      'x-company-id': companyId,
    },
  });
};

export const deleteBranch = async (companyId: string, branchId: string) => {
  return await responseHandler<void>(`/company-branches/${branchId}`, {
    method: 'DELETE',
    headers: {
      'x-company-id': companyId,
    },
  });
};
