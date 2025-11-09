'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import {
  CreateCompanyBranchDto,
  UpdateCompanyBranchDto,
  UserResponseDto,
} from '@titans-tech/shared';

export interface CompanyBranch {
  id: string;
  name: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getAllBranches = async (args: { companyId: string }) => {
  return await responseHandler<CompanyBranch[]>(`/companies/${args.companyId}/branches`, {
    method: 'GET',
  });
};

export const getBranch = async (args: { branchId: string }) => {
  return await responseHandler<CompanyBranch>(`/company-branches/${args.branchId}`, {
    method: 'GET',
  });
};

export const createBranch = async (args: { companyId: string; data: CreateCompanyBranchDto }) => {
  return await responseHandler<CompanyBranch>(`/companies/${args.companyId}/branches`, {
    method: 'POST',
    body: args.data,
  });
};

export const updateBranch = async (args: { branchId: string; data: UpdateCompanyBranchDto }) => {
  return await responseHandler<CompanyBranch>(`/company-branches/${args.branchId}`, {
    method: 'PATCH',
    body: args.data,
  });
};

export const deleteBranch = async (args: { branchId: string }) => {
  return await responseHandler<void>(`/company-branches/${args.branchId}`, {
    method: 'DELETE',
  });
};

export const addUserToBranch = async (args: { branchId: string; userId: string }) => {
  return await responseHandler<UserResponseDto>(
    `/company-branches/${args.branchId}/users/${args.userId}`,
    {
      method: 'POST',
    },
  );
};

export const removeUserFromBranch = async (args: { branchId: string; userId: string }) => {
  return await responseHandler<UserResponseDto>(
    `/company-branches/${args.branchId}/users/${args.userId}`,
    {
      method: 'DELETE',
    },
  );
};
