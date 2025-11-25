'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import {
  CreateUserDto,
  SysAdminCreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  SetUserPermissionsDto,
  SetCompanyManagerDto,
  UpdateUserPermissionsDto,
  DeleteUserDto,
} from '@titans-tech/shared/backend-dtos';
import { Permissions } from '@titans-tech/shared/types';

export const getAllUsers = async (args: { companyId: string }) => {
  return await responseHandler<UserResponseDto[]>(`/companies/${args.companyId}/users`, {
    method: 'GET',
  });
};

export const createUser = async (args: {
  branchId: string;
  data: SysAdminCreateUserDto | CreateUserDto;
}) => {
  return await responseHandler<UserResponseDto>(`/company-branches/${args.branchId}/users`, {
    method: 'POST',
    body: args.data,
  });
};

export const updateUser = async (args: {
  companyId: string;
  userId: string;
  data: UpdateUserDto;
}) => {
  return await responseHandler<UserResponseDto>(
    `/companies/${args.companyId}/users/${args.userId}`,
    {
      method: 'PATCH',
      body: args.data,
    },
  );
};

export const deleteUser = async (args: { companyId: string; userId: string }) => {
  return await responseHandler<void>(`/companies/${args.companyId}/users/${args.userId}`, {
    method: 'DELETE',
  });
};

/**
 * Get current user (/me endpoint)
 */
export const getMe = async () => {
  return await responseHandler<UserResponseDto>('/users/me', {
    method: 'GET',
  });
};

/**
 * Update user permissions for a specific branch
 */
export const updateUserPermissions = async (args: {
  branchId: string;
  userId: string;
  permissions: SetUserPermissionsDto;
}) => {
  return await responseHandler<UserResponseDto>(
    `/company-branches/${args.branchId}/users/${args.userId}/permissions`,
    {
      method: 'PATCH',
      body: args.permissions,
    },
  );
};

/**
 * Update user permissions across all branches they belong to
 */
export const updateUserPermissionsAllBranches = async (args: {
  branchId: string;
  userId: string;
  permissions: Partial<Permissions>;
  applyToAllBranches: boolean;
}) => {
  const body: UpdateUserPermissionsDto = {
    ...args.permissions,
    applyToAllBranches: args.applyToAllBranches,
  };

  return await responseHandler<UserResponseDto>(
    `/company-branches/${args.branchId}/users/${args.userId}/permissions-all-branches`,
    {
      method: 'PATCH',
      body,
    },
  );
};

/**
 * Set Company Manager status for a user
 */
export const setCompanyManager = async (args: {
  branchId: string;
  userId: string;
  isCompanyManager: boolean;
}) => {
  const body: SetCompanyManagerDto = {
    isCompanyManager: args.isCompanyManager,
  };

  return await responseHandler<UserResponseDto>(
    `/company-branches/${args.branchId}/users/${args.userId}/company-manager`,
    {
      method: 'PATCH',
      body,
    },
  );
};

/**
 * Delete user from branch or company
 * @param scope - 'branch' to remove from specific branch, 'company' to delete completely
 */
export const deleteUserFromBranchOrCompany = async (args: {
  branchId: string;
  userId: string;
  scope: 'branch' | 'company';
}) => {
  const body: DeleteUserDto = {
    scope: args.scope,
  };

  return await responseHandler<{ success: boolean; message: string }>(
    `/company-branches/${args.branchId}/users/${args.userId}/delete`,
    {
      method: 'DELETE',
      body,
    },
  );
};

/**
 * Get all users in a branch
 */
export const getBranchUsers = async (args: { branchId: string }) => {
  return await responseHandler<UserResponseDto[]>(`/company-branches/${args.branchId}/users`, {
    method: 'GET',
  });
};

/**
 * Assign user to a branch with permissions
 */
export const assignUserToBranch = async (args: {
  branchId: string;
  userId: string;
  permissions: SetUserPermissionsDto;
}) => {
  return await responseHandler<UserResponseDto>(
    `/company-branches/${args.branchId}/users/${args.userId}`,
    {
      method: 'POST',
      body: args.permissions,
    },
  );
};

/**
 * Remove user from a branch
 */
export const removeUserFromBranch = async (args: { branchId: string; userId: string }) => {
  return await responseHandler<void>(`/company-branches/${args.branchId}/users/${args.userId}`, {
    method: 'DELETE',
  });
};
