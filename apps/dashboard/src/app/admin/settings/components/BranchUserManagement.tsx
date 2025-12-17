'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Pencil, Ban, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllUsers } from '@/data/services/users.api';
import { getBranch } from '@/data/services/company-branches.api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditUserDialog } from './EditUserDialog';
import { DeleteUserDialog } from './DeleteUserDialog';
import { ReactivateUserDialog } from './ReactivateUserDialog';
import { UserTableSkeleton } from './UserTableSkeleton';
import type { UserResponseDto } from '@titans-tech/shared/backend-dtos';
import { detectRolePreset, RolePreset, type Permissions } from '@titans-tech/shared/types';
import type { CompanyBranch } from '@/data/services/company-branches.api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Transform UserResponseDto to UI User format
function transformUserToUI(user: UserResponseDto, branchId: string): User {
  // Company-level roles take precedence
  if (user.isCompanyAdmin) {
    return {
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: 'companyAdmin',
    };
  }

  // Determine role based on branch-specific permissions
  let role = 'employee'; // Default: Funcionário (Worker)

  // Check branch-specific permissions
  const branchPermissions = user.branches?.find((b) => b.branchId === branchId);
  if (branchPermissions) {
    // Extract permission fields from branch data
    const permissions: Permissions = {
      readUsers: branchPermissions.readUsers,
      createUsers: branchPermissions.createUsers,
      updateUsers: branchPermissions.updateUsers,
      deleteUsers: branchPermissions.deleteUsers,
      manageUserPermissions: branchPermissions.manageUserPermissions,
      assignUsersToBranches: branchPermissions.assignUsersToBranches,
      readBranches: branchPermissions.readBranches,
      updateBranches: branchPermissions.updateBranches,
      readMachines: branchPermissions.readMachines,
      createMachines: branchPermissions.createMachines,
      updateMachines: branchPermissions.updateMachines,
      deleteMachines: branchPermissions.deleteMachines,
      readServices: branchPermissions.readServices,
      createServices: branchPermissions.createServices,
      updateServices: branchPermissions.updateServices,
      deleteServices: branchPermissions.deleteServices,
      readProductionLines: branchPermissions.readProductionLines,
      createProductionLines: branchPermissions.createProductionLines,
      updateProductionLines: branchPermissions.updateProductionLines,
      deleteProductionLines: branchPermissions.deleteProductionLines,
    };

    const preset = detectRolePreset(permissions);
    switch (preset) {
      case RolePreset.MANAGER:
        role = 'branchManager';
        break;
      case RolePreset.WORKER:
        role = 'employee';
        break;
      case RolePreset.CUSTOM:
        role = 'custom';
        break;
    }
  }

  return {
    id: user.id,
    name: user.name || 'Unknown User',
    email: user.email,
    role,
  };
}

interface BranchUserManagementProps {
  branchId: string;
}

export function BranchUserManagement({ branchId }: BranchUserManagementProps) {
  const t = useTranslations('adminSettings.userManagement');
  const [users, setUsers] = useState<User[]>([]);
  const [usersData, setUsersData] = useState<UserResponseDto[]>([]);
  const [branch, setBranch] = useState<CompanyBranch | null>(null);
  const branchName = branch?.name || '';
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [isReactivateUserDialogOpen, setIsReactivateUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);

  const loadUsers = useCallback(
    async (isRefresh = false) => {
      if (!branchId) return;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsInitialLoading(true);
      }

      try {
        const branchResponse = await getBranch({ branchId });
        if (branchResponse.data) {
          setBranch(branchResponse.data);

          const usersResponse = await getAllUsers({ companyId: branchResponse.data.companyId });
          if (usersResponse.data) {
            // Filter users for this branch (include company admins and branch users)
            const filteredUsers = usersResponse.data.filter((user) => {
              // Include company admins (they have access to all branches)
              if (user.isCompanyAdmin) {
                return true;
              }
              // Include users with permissions for this branch
              return user.branches?.some((b: { branchId: string }) => b.branchId === branchId);
            });

            setUsersData(filteredUsers);

            const transformedUsers = filteredUsers.map((user) => transformUserToUI(user, branchId));
            setUsers(transformedUsers);
          }
        }
      } catch {
        toast.error(t('loadingFailed'));
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    },
    [branchId, t],
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEditUser = (userId: string) => {
    const user = usersData.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsEditUserDialogOpen(true);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = usersData.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsDeleteUserDialogOpen(true);
    }
  };

  const handleReactivateUser = (userId: string) => {
    const user = usersData.find((u) => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsReactivateUserDialogOpen(true);
    }
  };

  const handleEditUserSuccess = () => {
    loadUsers(true);
  };

  const handleDeleteUserSuccess = () => {
    loadUsers(true);
  };

  const handleReactivateUserSuccess = () => {
    loadUsers(true);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      companyAdmin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      companyManager: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      branchManager: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      employee: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      custom: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    };
    return colors[role] || colors.employee;
  };

  if (isInitialLoading) {
    return <UserTableSkeleton />;
  }

  // Separate active and deactivated users based on branch assignment
  const activeUsers = users.filter((user) => {
    const userData = usersData.find((u) => u.id === user.id);
    const userBranch = userData?.branches?.find((b) => b.branchId === branchId);
    return userBranch && !userBranch.deletedAt;
  });

  const deactivatedUsers = users.filter((user) => {
    const userData = usersData.find((u) => u.id === user.id);
    const userBranch = userData?.branches?.find((b) => b.branchId === branchId);
    return userBranch && userBranch.deletedAt;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t('title')} - {branchName}
          {isRefreshing && (
            <span className="ml-2 text-xs text-muted-foreground animate-pulse">Updating...</span>
          )}
        </h3>
      </div>

      {/* Active Users Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{t('activeUsers') || 'Active Users'}</h4>
        <div
          className={`rounded-md border transition-opacity ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.email')}</TableHead>
                <TableHead>{t('table.role')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {t('noUsers')}
                  </TableCell>
                </TableRow>
              ) : (
                activeUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                      >
                        {t(`roles.${user.role}`)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Deactivated Users Section */}
      {deactivatedUsers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            {t('deactivatedUsers') || 'Deactivated Users'}
          </h4>
          <div className="rounded-md border border-muted">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.email')}</TableHead>
                  <TableHead>{t('table.role')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deactivatedUsers.map((user) => (
                  <TableRow key={user.id} className="opacity-60">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                      >
                        {t(`roles.${user.role}`)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                        onClick={() => handleReactivateUser(user.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <EditUserDialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
        user={selectedUser}
        branchId={branchId}
        onSuccess={handleEditUserSuccess}
      />

      <DeleteUserDialog
        open={isDeleteUserDialogOpen}
        onOpenChange={setIsDeleteUserDialogOpen}
        user={selectedUser}
        branchId={branchId}
        onSuccess={handleDeleteUserSuccess}
      />

      <ReactivateUserDialog
        open={isReactivateUserDialogOpen}
        onOpenChange={setIsReactivateUserDialogOpen}
        user={selectedUser}
        branchId={branchId}
        onSuccess={handleReactivateUserSuccess}
      />
    </div>
  );
}
