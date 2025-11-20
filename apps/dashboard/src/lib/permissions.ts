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

  // Company Admins and Managers have all permissions
  if (user.isCompanyAdmin || user.isCompanyManager) {
    return true;
  }

  // Check branch-specific permissions
  const branchPermissions = user.branches?.find((b) => b.branchId === branchId);
  if (!branchPermissions) return false;

  return branchPermissions[permission];
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
 * Check if user is Company Admin or Manager
 */
export function isCompanyAdminOrManager(user: UserResponseDto | null | undefined): boolean {
  if (!user) return false;
  return user.isCompanyAdmin || user.isCompanyManager;
}

/**
 * Check if user is Company Admin
 */
export function isCompanyAdmin(user: UserResponseDto | null | undefined): boolean {
  if (!user) return false;
  return user.isCompanyAdmin;
}

/**
 * Check if user is Company Manager
 */
export function isCompanyManager(user: UserResponseDto | null | undefined): boolean {
  if (!user) return false;
  return user.isCompanyManager;
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

  // Company Admins and Managers have access to all branches
  if (user.isCompanyAdmin || user.isCompanyManager) {
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

  // Company-level roles
  if (user.isCompanyAdmin) return UserRole.COMPANY_ADMIN;
  if (user.isCompanyManager) return UserRole.COMPANY_MANAGER;

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
    [UserRole.COMPANY_MANAGER]: 'Company Manager',
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
    [UserRole.COMPANY_ADMIN]: 'bg-purple-100 text-purple-800',
    [UserRole.COMPANY_MANAGER]: 'bg-blue-100 text-blue-800',
    [UserRole.BRANCH_MANAGER]: 'bg-green-100 text-green-800',
    [UserRole.EMPLOYEE]: 'bg-gray-100 text-gray-800',
    [UserRole.CUSTOM]: 'bg-yellow-100 text-yellow-800',
  };

  return colors[role] || 'bg-gray-100 text-gray-800';
}

/**
 * Check if current user can edit another user's permissions
 * Rules:
 * - Company Admins can edit everyone except other Company Admins
 * - Company Managers can edit everyone except Company Admins
 * - Users with manageUserPermissions can edit regular users in their branch
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

  // Company Managers can edit everyone except Company Admins
  if (currentUser.isCompanyManager) {
    return !targetUser.isCompanyAdmin;
  }

  // Regular users can only edit if they have permission and target is not admin/manager
  if (targetUser.isCompanyAdmin || targetUser.isCompanyManager) {
    return false;
  }

  return hasPermission(currentUser, branchId, 'manageUserPermissions');
}

/**
 * Check if current user can delete another user
 * Same rules as canEditUser
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

  // Company Admins and Managers can delete most users
  if (currentUser.isCompanyAdmin || currentUser.isCompanyManager) {
    return !targetUser.isCompanyAdmin;
  }

  // Regular users need delete permission and target can't be admin/manager
  if (targetUser.isCompanyManager) return false;

  return hasPermission(currentUser, branchId, 'deleteUsers');
}

/**
 * Check if current user can promote to Company Manager
 * Only Company Admins can do this
 */
export function canPromoteToManager(currentUser: UserResponseDto | null | undefined): boolean {
  return isCompanyAdmin(currentUser);
}

/**
 * Count enabled permissions
 */
export function countEnabledPermissions(permissions: Permissions): number {
  return Object.values(permissions).filter((value) => value === true).length;
}

/**
 * Check if permissions object matches a role preset
 */
export function getPermissionPreset(permissions: Permissions): RolePreset {
  return detectRolePreset(permissions);
}
