import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const BRANCH_PERMISSION_KEY = 'branchPermission';
export const IS_SYS_ADMIN_KEY = 'isAdmin';
export const IS_COMPANY_ADMIN_KEY = 'isCompanyAdmin';
export const IS_COMPANY_MANAGER_KEY = 'isCompanyManager';
export const IS_AUTHENTICATED_KEY = 'isAuthenticated';

export type BranchPermissionType =
  // User Management Permissions
  | 'readUsers'
  | 'createUsers'
  | 'updateUsers'
  | 'deleteUsers'
  | 'manageUserPermissions'
  | 'assignUsersToBranches'
  // Branch Management Permissions
  | 'readBranches'
  | 'updateBranches'
  // Blueprint Permissions
  | 'readBlueprints'
  | 'createBlueprints'
  | 'updateBlueprints'
  | 'deleteBlueprints'
  // Machine Permissions
  | 'readMachines'
  | 'createMachines'
  | 'updateMachines'
  | 'deleteMachines'
  // Service Permissions
  | 'readServices'
  | 'createServices'
  | 'updateServices'
  | 'deleteServices';

export const Admin = () => SetMetadata(IS_SYS_ADMIN_KEY, true);

export const CompanyAdmin = () => SetMetadata(IS_COMPANY_ADMIN_KEY, true);

export const CompanyManager = () => SetMetadata(IS_COMPANY_MANAGER_KEY, true);

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Decorator to indicate that a route only requires authentication
 * No specific permissions, roles, or branch access checks are performed
 * Use this for routes that any authenticated user can access
 *
 * @example
 * @Authenticated()
 * @Get('me')
 * getMe(@Request() req: ReqWithAuthUser) { ... }
 */
export const Authenticated = () => SetMetadata(IS_AUTHENTICATED_KEY, true);

/**
 * Decorator to specify required branch permission for a route
 * This will check if the user has the specified permission in the branch
 * Routes with :branchId parameter will validate the user is part of the branch and has the permission
 * Routes without :branchId but with :companyId will check company admin or manager status
 *
 * @param permission - The permission required from UserBranch schema
 * @example
 * @BranchPermission('createUsers')
 * @Post(':branchId/users')
 * createUser(@Param('branchId') branchId: string) { ... }
 */
export const BranchPermission = (permission: BranchPermissionType) =>
  SetMetadata(BRANCH_PERMISSION_KEY, permission);
