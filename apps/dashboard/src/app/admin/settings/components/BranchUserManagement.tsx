'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';
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
import { AddUserDialog } from './AddUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { DeleteUserDialog } from './DeleteUserDialog';
import { UserTableSkeleton } from './UserTableSkeleton';
import type { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Transform UserResponseDto to UI User format
function transformUserToUI(user: UserResponseDto, branchId: string): User {
  // Determine role based on branch-specific permissions
  let role = 'employee'; // Default: Funcionário (Worker)

  // Check branch-specific permissions
  const branchPermissions = user.branches?.find((b) => b.branchId === branchId);
  if (branchPermissions) {
    const hasManagerPermissions =
      branchPermissions.createUsers ||
      branchPermissions.manageUserPermissions ||
      branchPermissions.updateBranches;

    if (hasManagerPermissions) {
      role = 'branchManager';
    }
    // Otherwise remains 'employee' (Worker)
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
  const [branchName, setBranchName] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
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
          setBranchName(branchResponse.data.name);

          const usersResponse = await getAllUsers({ companyId: branchResponse.data.companyId });
          if (usersResponse.data) {
            // Filter users for this branch (exclude company admins/managers - they show in company card)
            const filteredUsers = usersResponse.data.filter((user) => {
              // Exclude company admins and managers - they are shown at company level
              if (user.isCompanyAdmin || user.isCompanyManager) {
                return false;
              }
              // Include only users with permissions for this branch
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

  const handleAddUserSuccess = () => {
    loadUsers(true);
  };

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

  const handleEditUserSuccess = () => {
    loadUsers(true);
  };

  const handleDeleteUserSuccess = () => {
    loadUsers(true);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      branchManager: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      employee: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[role] || colors.employee;
  };

  if (isInitialLoading) {
    return <UserTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t('title')} - {branchName}
          {isRefreshing && (
            <span className="ml-2 text-xs text-muted-foreground animate-pulse">Updating...</span>
          )}
        </h3>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addUser')}
        </Button>
      </div>

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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t('noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        branchId={branchId}
        branchName={branchName}
        onSuccess={handleAddUserSuccess}
      />

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
    </div>
  );
}
