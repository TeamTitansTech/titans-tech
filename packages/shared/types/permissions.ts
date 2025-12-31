/**
 * Permissions System Types and Presets
 */

export type BranchPermissionType =
  | 'readUsers'
  | 'createUsers'
  | 'updateUsers'
  | 'deleteUsers'
  | 'manageUserPermissions'
  | 'assignUsersToBranches'
  | 'readBranches'
  | 'updateBranches'
  | 'readMachines'
  | 'createMachines'
  | 'updateMachines'
  | 'deleteMachines'
  | 'readServices'
  | 'createServices'
  | 'updateServices'
  | 'deleteServices'
  | 'readProductionLines'
  | 'createProductionLines'
  | 'updateProductionLines'
  | 'deleteProductionLines';

export const PERMISSION_DEPENDENCIES: Record<BranchPermissionType, BranchPermissionType[] | null> =
  {
    readBranches: null,
    updateBranches: ['readBranches'],
    readUsers: ['readBranches'],
    createUsers: ['readUsers'],
    updateUsers: ['readUsers'],
    deleteUsers: ['readUsers'],
    manageUserPermissions: ['readUsers', 'updateUsers'],
    assignUsersToBranches: ['readUsers', 'readBranches', 'updateUsers'],
    readMachines: ['readBranches'],
    createMachines: ['readMachines'],
    updateMachines: ['readMachines'],
    deleteMachines: ['readMachines'],
    readServices: ['readMachines'],
    createServices: ['readServices'],
    updateServices: ['readServices'],
    deleteServices: ['readServices'],
    readProductionLines: ['readBranches'],
    createProductionLines: ['readProductionLines'],
    updateProductionLines: ['readProductionLines'],
    deleteProductionLines: ['readProductionLines'],
  };

export interface Permissions {
  readUsers: boolean;
  createUsers: boolean;
  updateUsers: boolean;
  deleteUsers: boolean;
  manageUserPermissions: boolean;
  assignUsersToBranches: boolean;
  readBranches: boolean;
  updateBranches: boolean;
  readMachines: boolean;
  createMachines: boolean;
  updateMachines: boolean;
  deleteMachines: boolean;
  readServices: boolean;
  createServices: boolean;
  updateServices: boolean;
  deleteServices: boolean;
  readProductionLines: boolean;
  createProductionLines: boolean;
  updateProductionLines: boolean;
  deleteProductionLines: boolean;
}

export interface UserWithBranchPermissions {
  id: string;
  isCompanyAdmin: boolean;
  branches: Array<{ branchId: string } & Permissions>;
}

export enum PermissionCategory {
  USER_MANAGEMENT = 'userManagement',
  BRANCH_MANAGEMENT = 'branchManagement',
  MACHINE_MANAGEMENT = 'machineManagement',
  SERVICE_MANAGEMENT = 'serviceManagement',
  PRODUCTION_LINE_MANAGEMENT = 'productionLineManagement',
}

export interface PermissionGroup {
  category: PermissionCategory;
  permissions: BranchPermissionType[];
}

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

export enum RolePreset {
  MANAGER = 'manager',
  WORKER = 'worker',
  CUSTOM = 'custom',
}

export const MANAGER_PERMISSIONS: Permissions = {
  readUsers: true,
  createUsers: true,
  updateUsers: true,
  deleteUsers: true,
  manageUserPermissions: true,
  assignUsersToBranches: true,
  readBranches: true,
  updateBranches: true,
  readMachines: true,
  createMachines: true,
  updateMachines: true,
  deleteMachines: true,
  readServices: true,
  createServices: true,
  updateServices: true,
  deleteServices: true,
  readProductionLines: true,
  createProductionLines: true,
  updateProductionLines: true,
  deleteProductionLines: true,
};

const WORKER_PERMISSIONS: Permissions = {
  readUsers: false,
  createUsers: false,
  updateUsers: false,
  deleteUsers: false,
  manageUserPermissions: false,
  assignUsersToBranches: false,
  readBranches: true,
  updateBranches: false,
  readMachines: true,
  createMachines: false,
  updateMachines: false,
  deleteMachines: false,
  readServices: true,
  createServices: false,
  updateServices: false,
  deleteServices: false,
  readProductionLines: false,
  createProductionLines: false,
  updateProductionLines: false,
  deleteProductionLines: false,
};

export const EMPTY_PERMISSIONS: Permissions = {
  readUsers: false,
  createUsers: false,
  updateUsers: false,
  deleteUsers: false,
  manageUserPermissions: false,
  assignUsersToBranches: false,
  readBranches: false,
  updateBranches: false,
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

export const ALL_PERMISSION_KEYS = Object.keys(PERMISSION_DEPENDENCIES) as BranchPermissionType[];

export type PermissionRecord<T> = { [K in BranchPermissionType]: T };

export enum UserRole {
  COMPANY_ADMIN = 'companyAdmin',
  BRANCH_MANAGER = 'branchManager',
  EMPLOYEE = 'employee',
  CUSTOM = 'custom',
}

// Internal helper functions (not exported)

function resolvePrerequisites(
  permission: BranchPermissionType,
  visited: Set<BranchPermissionType> = new Set(),
): BranchPermissionType[] {
  if (visited.has(permission)) return [];
  visited.add(permission);

  const directPrereqs = PERMISSION_DEPENDENCIES[permission];
  if (!directPrereqs) return [];

  const allPrereqs: BranchPermissionType[] = [...directPrereqs];

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

function checkPrerequisites(permissions: Permissions, permission: BranchPermissionType): boolean {
  const required = resolvePrerequisites(permission);
  return required.every((r) => permissions[r]);
}

function getDependents(permission: BranchPermissionType): BranchPermissionType[] {
  const dependents: BranchPermissionType[] = [];

  for (const [perm, prereqs] of Object.entries(PERMISSION_DEPENDENCIES)) {
    if (prereqs && prereqs.includes(permission)) {
      dependents.push(perm as BranchPermissionType);
      dependents.push(...getDependents(perm as BranchPermissionType));
    }
  }

  return [...new Set(dependents)];
}

// Exported functions

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

export function detectRolePreset(permissions: Permissions): RolePreset {
  const isManager = Object.keys(MANAGER_PERMISSIONS).every(
    (key) =>
      permissions[key as BranchPermissionType] === MANAGER_PERMISSIONS[key as BranchPermissionType],
  );

  if (isManager) return RolePreset.MANAGER;

  const isWorker = Object.keys(WORKER_PERMISSIONS).every(
    (key) =>
      permissions[key as BranchPermissionType] === WORKER_PERMISSIONS[key as BranchPermissionType],
  );

  if (isWorker) return RolePreset.WORKER;

  return RolePreset.CUSTOM;
}

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

export function getUserRole(user: UserWithBranchPermissions, branchId: string): UserRole {
  if (user.isCompanyAdmin) return UserRole.COMPANY_ADMIN;
  const branch = user.branches.find((b) => b.branchId === branchId);
  if (!branch) return UserRole.EMPLOYEE;
  const preset = detectRolePreset(branch);
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

export function hasPermissionInBranch(
  user: UserWithBranchPermissions | null,
  branchId: string,
  permission: BranchPermissionType,
): boolean {
  if (!user) return false;
  if (user.isCompanyAdmin) return true;
  const branch = user.branches.find((b) => b.branchId === branchId);
  if (!branch || !branch[permission]) return false;
  return checkPrerequisites(branch, permission);
}

export function hasPermissionInAnyBranch(
  user: UserWithBranchPermissions | null,
  permission: BranchPermissionType,
) {
  if (!user) return false;
  if (user.isCompanyAdmin) return true;
  return user.branches.some((b) => b[permission] && checkPrerequisites(b, permission));
}

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
