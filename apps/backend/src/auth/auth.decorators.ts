import { SetMetadata } from '@nestjs/common';

export const BRANCH_PERMISSION_KEY = 'branchPermission';

export type BranchPermissionType =
  | 'createUser'
  | 'updateUser'
  | 'deleteUser'
  | 'changeUserPermissions'
  | 'assignUserToBranch';

/**
 * Decorator to specify required branch permission for a route
 * This will check if the user has the specified permission in the branch
 * Routes with :branchId parameter will validate the user is part of the branch and has the permission
 * Routes without :branchId but with :companyId will only allow company admins
 *
 * @param permission - The permission required from UserBranch schema
 * @example
 * @BranchPermission('createUser')
 * @Post(':branchId/users')
 * createUser(@Param('branchId') branchId: string) { ... }
 */
export const BranchPermission = (permission: BranchPermissionType) =>
  SetMetadata(BRANCH_PERMISSION_KEY, permission);
