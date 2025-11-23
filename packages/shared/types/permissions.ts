/**
 * Permissions System Types and Presets
 *
 * This file defines types and constants for the Titans Tech permissions system.
 * It includes role presets, permission groupings, and helper functions.
 */

/**
 * Individual permission names
 * These correspond to the UserBranch model fields
 */
export type PermissionName =
  // User Management
  | 'readUsers'
  | 'createUsers'
  | 'updateUsers'
  | 'deleteUsers'
  | 'manageUserPermissions'
  | 'assignUsersToBranches'
  // Branch Management
  | 'readBranches'
  | 'updateBranches'
  // Blueprint Management
  | 'readBlueprints'
  | 'createBlueprints'
  | 'updateBlueprints'
  | 'deleteBlueprints'
  // Machine Management
  | 'readMachines'
  | 'createMachines'
  | 'updateMachines'
  | 'deleteMachines'
  // Service Management
  | 'readServices'
  | 'createServices'
  | 'updateServices'
  | 'deleteServices';

/**
 * Complete set of permissions (UserBranch model)
 */
export interface Permissions {
  // User Management (6)
  readUsers: boolean;
  createUsers: boolean;
  updateUsers: boolean;
  deleteUsers: boolean;
  manageUserPermissions: boolean;
  assignUsersToBranches: boolean;

  // Branch Management (2)
  readBranches: boolean;
  updateBranches: boolean;

  // Blueprint Management (4)
  readBlueprints: boolean;
  createBlueprints: boolean;
  updateBlueprints: boolean;
  deleteBlueprints: boolean;

  // Machine Management (4)
  readMachines: boolean;
  createMachines: boolean;
  updateMachines: boolean;
  deleteMachines: boolean;

  // Service Management (4)
  readServices: boolean;
  createServices: boolean;
  updateServices: boolean;
  deleteServices: boolean;
}

/**
 * Permission categories for UI grouping
 */
export enum PermissionCategory {
  USER_MANAGEMENT = 'userManagement',
  BRANCH_MANAGEMENT = 'branchManagement',
  BLUEPRINT_MANAGEMENT = 'blueprintManagement',
  MACHINE_MANAGEMENT = 'machineManagement',
  SERVICE_MANAGEMENT = 'serviceManagement',
}

/**
 * Grouped permissions for UI display
 */
export interface PermissionGroup {
  category: PermissionCategory;
  permissions: PermissionName[];
}

/**
 * All permission groups organized by category
 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    category: PermissionCategory.USER_MANAGEMENT,
    permissions: [
      'readUsers',
      'createUsers',
      'updateUsers',
      'deleteUsers',
      'manageUserPermissions',
      'assignUsersToBranches',
    ],
  },
  {
    category: PermissionCategory.BRANCH_MANAGEMENT,
    permissions: ['readBranches', 'updateBranches'],
  },
  {
    category: PermissionCategory.MACHINE_MANAGEMENT,
    permissions: ['readMachines', 'createMachines', 'updateMachines', 'deleteMachines'],
  },
  {
    category: PermissionCategory.SERVICE_MANAGEMENT,
    permissions: ['readServices'],
  },
];

/**
 * Role preset types
 */
export enum RolePreset {
  MANAGER = 'manager',
  WORKER = 'worker',
  CUSTOM = 'custom',
}

/**
 * Manager Preset - Full branch control
 * Includes all user-level permissions (blueprints are sysadmin-only)
 */
export const MANAGER_PERMISSIONS: Permissions = {
  // User Management
  readUsers: true,
  createUsers: true,
  updateUsers: true,
  deleteUsers: true,
  manageUserPermissions: true,
  assignUsersToBranches: true,

  // Branch Management
  readBranches: true,
  updateBranches: true,

  // Blueprint Management (sysadmin-only, not available to regular users)
  readBlueprints: false,
  createBlueprints: false,
  updateBlueprints: false,
  deleteBlueprints: false,

  // Machine Management
  readMachines: true,
  createMachines: true,
  updateMachines: true,
  deleteMachines: true,

  // Service Management (read-only for regular users)
  readServices: true,
  createServices: false,
  updateServices: false,
  deleteServices: false,
};

/**
 * Worker/Employee Preset - Operational access
 * Can view machines and services (read-only)
 */
export const WORKER_PERMISSIONS: Permissions = {
  // User Management
  readUsers: false,
  createUsers: false,
  updateUsers: false,
  deleteUsers: false,
  manageUserPermissions: false,
  assignUsersToBranches: false,

  // Branch Management
  readBranches: false,
  updateBranches: false,

  // Blueprint Management (sysadmin-only, not available to regular users)
  readBlueprints: false,
  createBlueprints: false,
  updateBlueprints: false,
  deleteBlueprints: false,

  // Machine Management
  readMachines: true,
  createMachines: false,
  updateMachines: false,
  deleteMachines: false,

  // Service Management (read-only for regular users)
  readServices: true,
  createServices: false,
  updateServices: false,
  deleteServices: false,
};

/**
 * Empty permissions (all false)
 */
export const EMPTY_PERMISSIONS: Permissions = {
  readUsers: false,
  createUsers: false,
  updateUsers: false,
  deleteUsers: false,
  manageUserPermissions: false,
  assignUsersToBranches: false,
  readBranches: false,
  updateBranches: false,
  readBlueprints: false,
  createBlueprints: false,
  updateBlueprints: false,
  deleteBlueprints: false,
  readMachines: false,
  createMachines: false,
  updateMachines: false,
  deleteMachines: false,
  readServices: false,
  createServices: false,
  updateServices: false,
  deleteServices: false,
};

/**
 * Get permissions for a role preset
 */
export function getPresetPermissions(preset: RolePreset): Permissions {
  switch (preset) {
    case RolePreset.MANAGER:
      return { ...MANAGER_PERMISSIONS };
    case RolePreset.WORKER:
      return { ...WORKER_PERMISSIONS };
    case RolePreset.CUSTOM:
      return { ...EMPTY_PERMISSIONS };
    default:
      return { ...EMPTY_PERMISSIONS };
  }
}

/**
 * Determine if permissions match a preset
 */
export function detectRolePreset(permissions: Permissions): RolePreset {
  // Check if all permissions match MANAGER preset
  const isManager = Object.keys(MANAGER_PERMISSIONS).every(
    (key) => permissions[key as PermissionName] === MANAGER_PERMISSIONS[key as PermissionName],
  );

  if (isManager) return RolePreset.MANAGER;

  // Check if all permissions match WORKER preset
  const isWorker = Object.keys(WORKER_PERMISSIONS).every(
    (key) => permissions[key as PermissionName] === WORKER_PERMISSIONS[key as PermissionName],
  );

  if (isWorker) return RolePreset.WORKER;

  // Otherwise it's custom
  return RolePreset.CUSTOM;
}

/**
 * Check if user has specific permission in a branch
 */
export function hasPermission(
  userBranches: Array<{ branchId: string } & Permissions> | undefined,
  branchId: string,
  permission: PermissionName,
): boolean {
  if (!userBranches) return false;

  const branch = userBranches.find((b) => b.branchId === branchId);
  if (!branch) return false;

  return branch[permission];
}

/**
 * Check if user has all permissions in a category
 */
export function hasCategoryPermissions(
  permissions: Permissions,
  category: PermissionCategory,
): boolean {
  const group = PERMISSION_GROUPS.find((g) => g.category === category);
  if (!group) return false;

  return group.permissions.every((perm) => permissions[perm]);
}

/**
 * Check if permissions set is completely empty (all false)
 */
export function arePermissionsEmpty(permissions: Permissions): boolean {
  return Object.values(permissions).every((value) => value === false);
}

/**
 * Check if permissions set is completely full (all true)
 */
export function arePermissionsFull(permissions: Permissions): boolean {
  return Object.values(permissions).every((value) => value === true);
}

/**
 * Count how many permissions are enabled
 */
export function countEnabledPermissions(permissions: Permissions): number {
  return Object.values(permissions).filter((value) => value === true).length;
}

/**
 * Get all permission names as an array
 */
export function getAllPermissionNames(): PermissionName[] {
  return PERMISSION_GROUPS.flatMap((group) => group.permissions);
}

/**
 * Get permissions for a specific category
 */
export function getPermissionsByCategory(category: PermissionCategory): PermissionName[] {
  const group = PERMISSION_GROUPS.find((g) => g.category === category);
  return group ? group.permissions : [];
}

/**
 * Set all permissions in a category to a value
 */
export function setCategoryPermissions(
  permissions: Permissions,
  category: PermissionCategory,
  value: boolean,
): Permissions {
  const group = PERMISSION_GROUPS.find((g) => g.category === category);
  if (!group) return { ...permissions };

  const updated = { ...permissions };
  group.permissions.forEach((perm) => {
    updated[perm] = value;
  });

  return updated;
}

/**
 * Set all permissions to a value
 */
export function setAllPermissions(permissions: Permissions, value: boolean): Permissions {
  const updated = { ...permissions };
  Object.keys(updated).forEach((key) => {
    updated[key as PermissionName] = value;
  });
  return updated;
}

/**
 * User role types for display
 */
export enum UserRole {
  COMPANY_ADMIN = 'companyAdmin',
  COMPANY_MANAGER = 'companyManager',
  BRANCH_MANAGER = 'branchManager',
  EMPLOYEE = 'employee',
  CUSTOM = 'custom',
}

/**
 * Determine user's display role for a branch
 */
export function getUserRole(
  isCompanyAdmin: boolean,
  isCompanyManager: boolean,
  branchPermissions: Permissions | undefined,
): UserRole {
  // Company-level roles
  if (isCompanyAdmin) return UserRole.COMPANY_ADMIN;
  if (isCompanyManager) return UserRole.COMPANY_MANAGER;

  // No branch permissions
  if (!branchPermissions) return UserRole.EMPLOYEE;

  // Detect role by permissions
  const preset = detectRolePreset(branchPermissions);

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
 * Type guard for checking if user is admin or manager
 */
export function isCompanyAdminOrManager(user: {
  isCompanyAdmin: boolean;
  isCompanyManager: boolean;
}): boolean {
  return user.isCompanyAdmin || user.isCompanyManager;
}
