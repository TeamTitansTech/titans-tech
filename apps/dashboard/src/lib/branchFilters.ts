import type { UserResponseDto, UserBranchDto } from '@titans-tech/shared/backend-dtos';

export interface Branch {
  id: string;
  name: string;
}

/**
 * Get branches where user has specific permission
 * Company admins and managers see all branches
 * Regular users only see branches where they have the specified permission
 */
export function getBranchesWithPermission(
  companyUser: UserResponseDto | null,
  permission: 'readMachines' | 'readProductionLines' | 'readServices',
): Branch[] {
  if (!companyUser) return [];

  // Company admins and managers can see all branches
  if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) {
    return companyUser.branches.map((ub: UserBranchDto) => ({
      id: ub.branchId,
      name: ub.branch.name,
    }));
  }

  // Regular users only see branches where they have the specific permission
  return companyUser.branches
    .filter((ub: UserBranchDto) => ub[permission])
    .map((ub: UserBranchDto) => ({
      id: ub.branchId,
      name: ub.branch.name,
    }));
}

/**
 * Filter items by branch with permission checks
 * Company admins and managers can see all items
 * Regular users only see items from branches where they have the specified permission
 */
export function filterByBranchPermission<T extends { branchId: string }>(
  items: T[],
  companyUser: UserResponseDto | null,
  selectedBranchFilter: string,
  permission: 'readMachines' | 'readProductionLines' | 'readServices',
): T[] {
  if (!companyUser) return [];

  // Company admins and managers can see all items
  if (companyUser.isCompanyAdmin || companyUser.isCompanyManager) {
    if (selectedBranchFilter === 'all') return items;
    return items.filter((item) => item.branchId === selectedBranchFilter);
  }

  // Regular users: filter by branches where they have the permission
  const allowedBranchIds = companyUser.branches
    .filter((ub: UserBranchDto) => ub[permission])
    .map((ub: UserBranchDto) => ub.branchId);

  if (selectedBranchFilter === 'all') {
    return items.filter((item) => allowedBranchIds.includes(item.branchId));
  }

  return items.filter((item) => item.branchId === selectedBranchFilter);
}
