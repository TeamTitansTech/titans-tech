import { SetMetadata } from '@nestjs/common';
import { BranchPermissionType } from '@titans-tech/shared';
export const IS_PUBLIC_KEY = 'isPublic';
export const BRANCH_PERMISSION_KEY = 'branchPermission';
export const IS_SYS_ADMIN_KEY = 'isAdmin';
export const IS_COMPANY_ADMIN_KEY = 'isCompanyAdmin';
export const IS_AUTHENTICATED_KEY = 'isAuthenticated';
export const IS_COMPANY_MEMBER_KEY = 'isCompanyMember';

export const Admin = () => SetMetadata(IS_SYS_ADMIN_KEY, true);

export const CompanyAdmin = () => SetMetadata(IS_COMPANY_ADMIN_KEY, true);

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
 * Decorator to validate that the user belongs to the company specified in :companyId param.
 * SysAdmins can access any company.
 *
 * @example
 * @CompanyMember()
 * @Get(':companyId')
 * findOne(@Param('companyId') companyId: string) { ... }
 */
export const CompanyMember = () => SetMetadata(IS_COMPANY_MEMBER_KEY, true);

/**
 * Decorator to specify required branch permission for a route.
 * This will check if the user has the specified permission in the branch.
 *
 * The branchId is extracted from:
 * 1. URL params (`:branchId`) - for routes like `/branches/:branchId/resource`
 * 2. Request body (`branchId`) - for POST routes creating new resources
 *
 * Routes without :branchId but with :companyId will check if user has the permission
 * in any branch of that company.
 *
 * @param permission - The permission required from UserBranch schema
 *
 * @example
 * // branchId from URL params
 * @BranchPermission('createUsers')
 * @Post(':branchId/users')
 * createUser(@Param('branchId') branchId: string) { ... }
 *
 * @example
 * // branchId from request body (for creating new resources)
 * @BranchPermission('createMachines')
 * @Post()
 * create(@Body() dto: CreateMachineDto) { ... } // dto.branchId is used
 */
export const BranchPermission = (permission: BranchPermissionType) =>
  SetMetadata(BRANCH_PERMISSION_KEY, permission);

export const RESOURCE_PERMISSION_KEY = 'resourcePermission';

export type ResourceType =
  | 'machine'
  | 'service'
  | 'productionLine'
  | 'serviceRequest';

export interface ResourcePermissionMetadata {
  resourceType: ResourceType;
  permission: BranchPermissionType;
  paramName?: string; // defaults to 'id'
  fromBody?: boolean; // if true, get resourceId from body instead of params
}

/**
 * Decorator to specify required permission for a resource-based route.
 * This will automatically resolve the branchId from the resource ID and validate permissions.
 *
 * @param resourceType - The type of resource ('machine', 'service', 'productionLine', 'serviceRequest')
 * @param permission - The permission required from UserBranch schema
 * @param options - Optional configuration for param name and body extraction
 *
 * @example
 * // Get service by ID - extracts 'id' from params
 * @ResourcePermission('service', 'readServices')
 * @Get(':id')
 * findOne(@Param('id') id: string) { ... }
 *
 * @example
 * // Get services by machine - extracts 'machineId' from params
 * @ResourcePermission('machine', 'readServices', { paramName: 'machineId' })
 * @Get('machine/:machineId')
 * findByMachine(@Param('machineId') machineId: string) { ... }
 *
 * @example
 * // Create service - extracts 'machineId' from body
 * @ResourcePermission('machine', 'createServices', { paramName: 'machineId', fromBody: true })
 * @Post()
 * create(@Body() dto: CreateServiceDto) { ... }
 */
export const ResourcePermission = (
  resourceType: ResourceType,
  permission: BranchPermissionType,
  options?: { paramName?: string; fromBody?: boolean },
) =>
  SetMetadata(RESOURCE_PERMISSION_KEY, {
    resourceType,
    permission,
    paramName: options?.paramName,
    fromBody: options?.fromBody,
  });
