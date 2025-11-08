import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const BRANCH_PERMISSION_KEY = 'branchPermission';
export const IS_ADMIN_KEY = 'isAdmin';

export type BranchPermissionType =
  | 'createUser'
  | 'updateUser'
  | 'deleteUser'
  | 'changeUserPermissions'
  | 'assignUserToBranch';

export const Admin = () => SetMetadata(IS_ADMIN_KEY, true);

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Decorator to specify required branch permission for a route
 * This will check if the user has the specified permission in the branch
 * Routes with :branchId parameter will validate the user is part of the branch and has the permission
 * Routes without :branchId but with x-company-id header will only allow company admins
 *
 * @param permission - The permission required from UserBranch schema
 * @example
 * @BranchPermission('createUser')
 * @Post(':branchId/users')
 * createUser(@Param('branchId') branchId: string) { ... }
 */
export const BranchPermission = (permission: BranchPermissionType) =>
  SetMetadata(BRANCH_PERMISSION_KEY, permission);
