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
  isMainBranch: boolean;
  location?: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    machines: number;
  };
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

export const setUserPermissions = async (args: {
  branchId: string;
  userId: string;
  permissions: Record<string, boolean>;
}) => {
  return await responseHandler<UserResponseDto>(
    `/company-branches/${args.branchId}/users/${args.userId}/permissions`,
    {
      method: 'PATCH',
      body: args.permissions,
    },
  );
};

export const setCompanyAdmin = async (args: {
  branchId: string;
  userId: string;
  isCompanyAdmin: boolean;
}) => {
  return await responseHandler<UserResponseDto>(
    `/company-branches/${args.branchId}/users/${args.userId}/company-admin`,
    {
      method: 'PATCH',
      body: { isCompanyAdmin: args.isCompanyAdmin },
    },
  );
};

export const setCompanyManager = async (args: {
  branchId: string;
  userId: string;
  isCompanyManager: boolean;
}) => {
  return await responseHandler<UserResponseDto>(
    `/company-branches/${args.branchId}/users/${args.userId}/company-manager`,
    {
      method: 'PATCH',
      body: { isCompanyManager: args.isCompanyManager },
    },
  );
};
