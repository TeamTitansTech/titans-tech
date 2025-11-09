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

export const getAllBranches = async (args?: { companyId?: string }) => {
  return await responseHandler<CompanyBranch[]>('/company-branches', {
    method: 'GET',
    companyId: args?.companyId,
  });
};

export const getBranch = async (args: { companyId?: string; branchId: string }) => {
  return await responseHandler<CompanyBranch>(`/company-branches/${args.branchId}`, {
    method: 'GET',
    companyId: args.companyId,
  });
};

export const createBranch = async (args: { companyId?: string; data: CreateCompanyBranchDto }) => {
  return await responseHandler<CompanyBranch>('/company-branches', {
    method: 'POST',
    body: args.data,
    companyId: args.companyId,
  });
};

export const updateBranch = async (args: {
  companyId?: string;
  branchId: string;
  data: UpdateCompanyBranchDto;
}) => {
  return await responseHandler<CompanyBranch>(`/company-branches/${args.branchId}`, {
    method: 'PATCH',
    body: args.data,
    companyId: args.companyId,
  });
};

export const deleteBranch = async (args: { companyId?: string; branchId: string }) => {
  return await responseHandler<void>(`/company-branches/${args.branchId}`, {
    method: 'DELETE',
    companyId: args.companyId,
  });
};
