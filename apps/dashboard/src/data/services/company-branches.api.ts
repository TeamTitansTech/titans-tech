'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { responseHandler } from '@/data/helpers/responseHandler';
import {
  CreateCompanyBranchDto,
  UpdateCompanyBranchDto,
  UserResponseDto,
} from '@titans-tech/shared/backend-dtos';

export type MeasurementUnit = 'INCHES' | 'MM';

export interface CompanyBranch {
  id: string;
  name: string;
  isMainBranch: boolean;
  location?: string | null;
  defaultMeasurementUnit: MeasurementUnit;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    id: string;
    name: string;
  };
  _count?: {
    machines: number;
    users: number;
  };
}

/**
 * Get all branches across all companies (SysAdmin only)
 */
export const getAllBranchesForSysAdmin = async () => {
  return await responseHandler<CompanyBranch[]>(`/company-branches`, {
    method: 'GET',
  });
};

export const getAllBranches = async (args: { companyId: string }) => {
  return await responseHandler<CompanyBranch[]>(`/companies/${args.companyId}/branches`, {
    method: 'GET',
    tags: [`branches-${args.companyId}`],
  });
};

export const getBranch = async (args: { branchId: string }) => {
  return await responseHandler<CompanyBranch>(`/company-branches/${args.branchId}`, {
    method: 'GET',
  });
};

export const createBranch = async (args: { companyId: string; data: CreateCompanyBranchDto }) => {
  const result = await responseHandler<CompanyBranch>(`/companies/${args.companyId}/branches`, {
    method: 'POST',
    body: args.data,
  });

  if (!result.errors) {
    revalidateTag(`branches-${args.companyId}`, 'max');
    revalidatePath('/admin/companies', 'page');
    revalidatePath('/s/[subdomain]/settings', 'page');
  }

  return result;
};

export const updateBranch = async (args: { branchId: string; data: UpdateCompanyBranchDto }) => {
  const result = await responseHandler<CompanyBranch>(`/company-branches/${args.branchId}`, {
    method: 'PATCH',
    body: args.data,
  });

  if (!result.errors && result.data) {
    revalidateTag(`branches-${result.data.companyId}`, 'max');
    revalidatePath('/s/[subdomain]/settings', 'page');
  }

  return result;
};

export const deleteBranch = async (args: { branchId: string; companyId: string }) => {
  const result = await responseHandler<void>(`/company-branches/${args.branchId}`, {
    method: 'DELETE',
  });

  if (!result.errors) {
    revalidateTag(`branches-${args.companyId}`, 'max');
    revalidatePath('/admin/companies', 'page');
    revalidatePath('/s/[subdomain]/settings', 'page');
  }

  return result;
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
