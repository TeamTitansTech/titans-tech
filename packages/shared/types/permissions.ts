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
export type BranchPermissionType =
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
  | 'deleteServices'
  // Production Line Management
  | 'readProductionLines'
  | 'createProductionLines'
  | 'updateProductionLines'
  | 'deleteProductionLines';

/**
 * Permission dependency map.
 * - null: No dependencies (base permission)
 * - string[]: Array of required permissions (checked recursively)
 *
 * This is the single source of truth for permission dependencies.
 * Used by both frontend (auto-check/uncheck) and backend (validation).
 */
export const PERMISSION_DEPENDENCIES: Record<BranchPermissionType, BranchPermissionType[] | null> =
  {
    // Branch Management (base permissions)
    readBranches: null,
    updateBranches: ['readBranches'],

    // Blueprint Management (global, not branch-linked)
    readBlueprints: null,
    createBlueprints: ['readBlueprints'],
    updateBlueprints: ['readBlueprints'],
    deleteBlueprints: ['readBlueprints'],

    // User Management (users belong to branches)
    readUsers: ['readBranches'],
    createUsers: ['readUsers'],
    updateUsers: ['readUsers'],
    deleteUsers: ['readUsers'],
    manageUserPermissions: ['readUsers'],
    assignUsersToBranches: ['readUsers', 'readBranches'],

    // Machine Management (machines belong to branches)
    readMachines: ['readBranches'],
    createMachines: ['readMachines'],
    updateMachines: ['readMachines'],
    deleteMachines: ['readMachines'],

    // Service Management (services are on machines)
    readServices: ['readMachines'],
    createServices: ['readServices'],
    updateServices: ['readServices'],
    deleteServices: ['readServices'],

    // Production Line Management (production lines belong to branches)
    readProductionLines: ['readBranches'],
    createProductionLines: ['readProductionLines'],
    updateProductionLines: ['readProductionLines'],
    deleteProductionLines: ['readProductionLines'],
  };

/**
 * Recursively resolves all prerequisites for a permission.
 * Prerequisites are permissions that must be enabled before this one can work.
 *
 * @example
 * resolvePrerequisites('createServices')
 * // Returns: ['readServices', 'readMachines', 'readBranches']
 */
export function resolvePrerequisites(
  permission: BranchPermissionType,
  visited: Set<BranchPermissionType> = new Set(),
): BranchPermissionType[] {
  // Prevent circular dependencies
  if (visited.has(permission)) return [];
  visited.add(permission);

  const directPrereqs = PERMISSION_DEPENDENCIES[permission];
  if (!directPrereqs) return [];

  const allPrereqs: BranchPermissionType[] = [...directPrereqs];

  // Recursively resolve transitive prerequisites
  for (const prereq of directPrereqs) {
    const transitivePrereqs = resolvePrerequisites(prereq, new Set(visited));
    for (const tp of transitivePrereqs) {
      if (!allPrereqs.includes(tp)) {
        allPrereqs.push(tp);
      }
    }
  }

  return allPrereqs;
}

/**
 * Gets all permissions that depend on a given permission (reverse lookup).
 * Dependents are permissions that require this one as a prerequisite.
 *
 * @example
 * getDependents('readUsers')
 * // Returns: ['createUsers', 'updateUsers', 'deleteUsers', 'manageUserPermissions', 'assignUsersToBranches']
 */
export function getDependents(permission: BranchPermissionType): BranchPermissionType[] {
  const dependents: BranchPermissionType[] = [];

  for (const [perm, prereqs] of Object.entries(PERMISSION_DEPENDENCIES)) {
    if (prereqs && prereqs.includes(permission)) {
      dependents.push(perm as BranchPermissionType);
      // Also get transitive dependents (permissions that depend on this dependent)
      dependents.push(...getDependents(perm as BranchPermissionType));
    }
  }

  return [...new Set(dependents)]; // Remove duplicates
}

/**
 * Validates a permissions object ensuring all prerequisites are satisfied.
 * Returns an object with validation result and any violations found.
 *
 * @example
 * validatePermissions({ createUsers: true, readUsers: false, readBranches: false })
 * // Returns: { valid: false, violations: [{ permission: 'createUsers', missing: ['readUsers', 'readBranches'] }] }
 */
export function validatePermissions(permissions: Permissions): {
  valid: boolean;
  violations: Array<{ permission: BranchPermissionType; missing: BranchPermissionType[] }>;
} {
  const violations: Array<{ permission: BranchPermissionType; missing: BranchPermissionType[] }> =
    [];

  for (const [perm, enabled] of Object.entries(permissions)) {
    if (!enabled) continue;

    const required = resolvePrerequisites(perm as BranchPermissionType);
    const missing = required.filter((r: BranchPermissionType) => !permissions[r]);

    if (missing.length > 0) {
      violations.push({ permission: perm as BranchPermissionType, missing });
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Auto-enables all prerequisites when enabling a permission.
 * Returns a new Permissions object with prerequisites satisfied.
 *
 * @example
 * enableWithPrerequisites(emptyPermissions, 'createServices')
 * // Returns permissions with: createServices, readServices, readMachines, readBranches = true
 */
export function enableWithPrerequisites(
  permissions: Permissions,
  permission: BranchPermissionType,
): Permissions {
  const newPermissions = { ...permissions, [permission]: true };
  const prereqs = resolvePrerequisites(permission);

  for (const prereq of prereqs) {
    newPermissions[prereq] = true;
  }

  return newPermissions;
}

/**
 * Auto-disables all dependent permissions when disabling a permission.
 * Returns a new Permissions object with dependents disabled.
 *
 * @example
 * disableWithDependents(fullPermissions, 'readMachines')
 * // Returns permissions with: readMachines, createMachines, updateMachines, deleteMachines,
 * //                          readServices, createServices, updateServices, deleteServices = false
 */
export function disableWithDependents(
  permissions: Permissions,
  permission: BranchPermissionType,
): Permissions {
  const newPermissions = { ...permissions, [permission]: false };
  const dependents = getDependents(permission);

  for (const dep of dependents) {
    newPermissions[dep] = false;
  }

  return newPermissions;
}

/**
 * Checks if a permission can be disabled without leaving orphaned dependents.
 * Returns true if disabling is safe (no enabled permissions depend on it).
 */
export function canDisable(permissions: Permissions, permission: BranchPermissionType): boolean {
  const dependents = getDependents(permission);
  return !dependents.some((dep: BranchPermissionType) => permissions[dep]);
}

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

  // Production Line Management (4)
  readProductionLines: boolean;
  createProductionLines: boolean;
  updateProductionLines: boolean;
  deleteProductionLines: boolean;
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
  PRODUCTION_LINE_MANAGEMENT = 'productionLineManagement',
}

/**
 * Grouped permissions for UI display
 */
export interface PermissionGroup {
  category: PermissionCategory;
  permissions: BranchPermissionType[];
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
    permissions: ['readServices', 'createServices', 'updateServices', 'deleteServices'],
  },
  {
    category: PermissionCategory.PRODUCTION_LINE_MANAGEMENT,
    permissions: [
      'readProductionLines',
      'createProductionLines',
      'updateProductionLines',
      'deleteProductionLines',
    ],
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

  // Service Management
  readServices: true,
  createServices: true,
  updateServices: true,
  deleteServices: true,

  // Production Line Management
  readProductionLines: true,
  createProductionLines: true,
  updateProductionLines: true,
  deleteProductionLines: true,
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
  readBranches: true, // Required by readMachines and readServices
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

  // Production Line Management
  readProductionLines: false,
  createProductionLines: false,
  updateProductionLines: false,
  deleteProductionLines: false,
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
  readProductionLines: false,
  createProductionLines: false,
  updateProductionLines: false,
  deleteProductionLines: false,
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
  console.debug('Detecting role preset for permissions:', permissions, MANAGER_PERMISSIONS);
  // Check if all permissions match MANAGER preset
  const isManager = Object.keys(MANAGER_PERMISSIONS).every(
    (key) =>
      permissions[key as BranchPermissionType] === MANAGER_PERMISSIONS[key as BranchPermissionType],
  );

  if (isManager) return RolePreset.MANAGER;

  // Check if all permissions match WORKER preset
  const isWorker = Object.keys(WORKER_PERMISSIONS).every(
    (key) =>
      permissions[key as BranchPermissionType] === WORKER_PERMISSIONS[key as BranchPermissionType],
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
  permission: BranchPermissionType,
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
export function getAllPermissionNames(): BranchPermissionType[] {
  return PERMISSION_GROUPS.flatMap((group) => group.permissions);
}

/**
 * Get permissions for a specific category
 */
export function getPermissionsByCategory(category: PermissionCategory): BranchPermissionType[] {
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
    updated[key as BranchPermissionType] = value;
  });
  return updated;
}

/**
 * User role types for display
 */
export enum UserRole {
  COMPANY_ADMIN = 'companyAdmin',
  BRANCH_MANAGER = 'branchManager',
  EMPLOYEE = 'employee',
  CUSTOM = 'custom',
}

/**
 * Determine user's display role for a branch
 */
export function getUserRole(
  isCompanyAdmin: boolean,
  branchPermissions: Permissions | undefined,
): UserRole {
  // Company-level role
  if (isCompanyAdmin) return UserRole.COMPANY_ADMIN;

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
