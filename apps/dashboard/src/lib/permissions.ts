/**
 * Permission Helper Functions for Frontend
 *
 * These utilities help check user permissions and determine access levels
 * throughout the dashboard application.
 */

import {
  Permissions,
  PermissionName,
  UserRole,
  RolePreset,
  detectRolePreset,
} from '@titans-tech/shared/types';

import { UserResponseDto } from '@titans-tech/shared/backend-dtos';

/**
 * Check if user has a specific permission in a branch
 */
export function hasPermission(
  user: UserResponseDto | null | undefined,
  branchId: string,
  permission: PermissionName,
): boolean {
  if (!user) return false;

  // Company Admins have all permissions
  if (user.isCompanyAdmin) {
    return true;
  }

  // Check branch-specific permissions
  const branchPermissions = user.branches?.find((b) => b.branchId === branchId);
  if (!branchPermissions) return false;

  return branchPermissions[permission];
}

/**
 * Check if user has a specific permission in ANY branch
 * Useful for determining if a feature should be visible at all
 */
export function hasPermissionInAnyBranch(
  user: UserResponseDto | null | undefined,
  permission: PermissionName,
): boolean {
  if (!user) return false;

  // Company Admins have all permissions
  if (user.isCompanyAdmin) {
    return true;
  }

  // Check if user has the permission in any of their branches
  return user.branches?.some((b) => b[permission]) || false;
}

/**
 * Check if user has permission for a specific resource's branch
 * This is a convenience wrapper around hasPermission for resources with branchId
 */
export function hasPermissionForResource<T extends { branchId: string }>(
  user: UserResponseDto | null | undefined,
  resource: T | null | undefined,
  permission: PermissionName,
): boolean {
  if (!user || !resource) return false;

  return hasPermission(user, resource.branchId, permission);
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(
  user: UserResponseDto | null | undefined,
  branchId: string,
  permissions: PermissionName[],
): boolean {
  return permissions.some((permission) => hasPermission(user, branchId, permission));
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(
  user: UserResponseDto | null | undefined,
  branchId: string,
  permissions: PermissionName[],
): boolean {
  return permissions.every((permission) => hasPermission(user, branchId, permission));
}

/**
 * Check if user can manage users in a branch
 */
export function canManageUsers(
  user: UserResponseDto | null | undefined,
  branchId: string,
): boolean {
  return hasAnyPermission(user, branchId, [
    'createUsers',
    'updateUsers',
    'deleteUsers',
    'manageUserPermissions',
  ]);
}

/**
 * Check if user can edit user permissions
 */
export function canEditPermissions(
  user: UserResponseDto | null | undefined,
  branchId: string,
): boolean {
  return hasPermission(user, branchId, 'manageUserPermissions');
}

/**
 * Check if user is Company Admin
 * @deprecated Use `user?.isCompanyAdmin` directly. This function exists for backward compatibility.
 */
export function isCompanyAdminOrManager(user: UserResponseDto | null | undefined): boolean {
  if (!user) return false;
  return user.isCompanyAdmin;
}

/**
 * Check if user is Company Admin
 */
export function isCompanyAdmin(user: UserResponseDto | null | undefined): boolean {
  if (!user) return false;
  return user.isCompanyAdmin;
}

/**
 * Get user's permissions for a specific branch
 */
export function getBranchPermissions(
  user: UserResponseDto | null | undefined,
  branchId: string,
): Permissions | null {
  if (!user) return null;

  const branchData = user.branches?.find((b) => b.branchId === branchId);
  if (!branchData) return null;

  // Extract only the permission fields (excluding branch, userId, branchId, etc.)
  const { branchId: _branchId, ...permissions } = branchData;

  return permissions as Permissions;
}

/**
 * Get all branches the user has access to
 */
export function getAccessibleBranches(user: UserResponseDto | null | undefined) {
  if (!user || !user.branches) return [];
  return user.branches.map((b) => b.branch);
}

/**
 * Get all branch IDs the user has access to
 */
export function getAccessibleBranchIds(user: UserResponseDto | null | undefined): string[] {
  if (!user || !user.branches) return [];
  return user.branches.map((b) => b.branchId);
}

/**
 * Check if user has access to a specific branch
 */
export function hasAccessToBranch(
  user: UserResponseDto | null | undefined,
  branchId: string,
): boolean {
  if (!user) return false;

  // Company Admins have access to all branches
  if (user.isCompanyAdmin) {
    return true;
  }

  // Check if user has this branch in their list
  return user.branches?.some((b) => b.branchId === branchId) || false;
}

/**
 * Determine user's role for a specific branch
 */
export function getUserRole(user: UserResponseDto | null | undefined, branchId: string): UserRole {
  if (!user) return UserRole.EMPLOYEE;

  // Company-level role
  if (user.isCompanyAdmin) return UserRole.COMPANY_ADMIN;

  // Branch-level role
  const permissions = getBranchPermissions(user, branchId);
  if (!permissions) return UserRole.EMPLOYEE;

  const preset = detectRolePreset(permissions);

  switch (preset) {
    case RolePreset.MANAGER:
      return UserRole.BRANCH_MANAGER;
    case RolePreset.WORKER:
      return UserRole.EMPLOYEE;
    case RolePreset.CUSTOM:
      return UserRole.CUSTOM;
    default:
      return UserRole.EMPLOYEE;
  }
}

/**
 * Get user role label for display
 */
export function getUserRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.COMPANY_ADMIN]: 'Company Admin',
    [UserRole.BRANCH_MANAGER]: 'Branch Manager',
    [UserRole.EMPLOYEE]: 'Employee',
    [UserRole.CUSTOM]: 'Custom',
  };

  return labels[role] || 'Employee';
}

/**
 * Get user role badge color
 */
export function getUserRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.COMPANY_ADMIN]:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    [UserRole.BRANCH_MANAGER]:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    [UserRole.EMPLOYEE]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    [UserRole.CUSTOM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}

/**
 * Check if current user can edit another user (name, email, or permissions)
 * Rules:
 * - Company Admins can edit everyone except other Company Admins
 * - Users with updateUsers OR manageUserPermissions can edit regular users in their branch
 */
export function canEditUser(
  currentUser: UserResponseDto | null | undefined,
  targetUser: UserResponseDto | null | undefined,
  branchId: string,
): boolean {
  if (!currentUser || !targetUser) return false;

  // Can't edit yourself
  if (currentUser.id === targetUser.id) return false;

  // Company Admins can edit everyone except other Company Admins
  if (currentUser.isCompanyAdmin) {
    return !targetUser.isCompanyAdmin;
  }

  // Regular users can only edit if they have permission and target is not admin
  if (targetUser.isCompanyAdmin) {
    return false;
  }

  // Allow editing if user has updateUsers OR manageUserPermissions
  return hasAnyPermission(currentUser, branchId, ['updateUsers', 'manageUserPermissions']);
}

/**
 * Check if current user can delete another user
 * Rules:
 * - Company Admins can delete everyone except other Company Admins
 * - Users with deleteUsers can delete regular users in their branch
 */
export function canDeleteUser(
  currentUser: UserResponseDto | null | undefined,
  targetUser: UserResponseDto | null | undefined,
  branchId: string,
): boolean {
  if (!currentUser || !targetUser) return false;

  // Can't delete yourself
  if (currentUser.id === targetUser.id) return false;

  // Can't delete Company Admins
  if (targetUser.isCompanyAdmin) return false;

  // Company Admins can delete anyone except other admins
  if (currentUser.isCompanyAdmin) {
    return true;
  }

  // Regular users need delete permission
  return hasPermission(currentUser, branchId, 'deleteUsers');
}
