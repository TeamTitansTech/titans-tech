'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Plus } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { AddUserDialog } from './AddUserDialog';
import type { UserResponseDto } from '@titans-tech/shared';

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
  const t = useTranslations('settings.userManagement');
  const { companyUser } = useCompanyUser();
  const [users, setUsers] = useState<User[]>([]);
  const [branchName, setBranchName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  // Check if current user can create users in this branch
  const canCreateUsers =
    companyUser?.isCompanyAdmin ||
    companyUser?.isCompanyManager ||
    companyUser?.branches?.some((b) => b.branchId === branchId && b.createUsers);

  const loadUsers = useCallback(
    async () => {
      if (!branchId) return;

      setIsLoading(true);

      try {
        const branchResponse = await getBranch({ branchId });
        if (branchResponse.data) {
          setBranchName(branchResponse.data.name);

          const usersResponse = await getAllUsers({ companyId: branchResponse.data.companyId });
          if (usersResponse.data) {
            // Filter users for this branch
            const filteredUsers = usersResponse.data.filter((user) => {
              // Exclude company admins and managers - they are shown at company level
              if (user.isCompanyAdmin || user.isCompanyManager) {
                return false;
              }
              // Include only users with permissions for this branch
              return user.branches?.some((b) => b.branchId === branchId);
            });

            const transformedUsers = filteredUsers.map((user) => transformUserToUI(user, branchId));
            setUsers(transformedUsers);
          }
        }
      } catch {
        toast.error(t('loadingFailed'));
      } finally {
        setIsLoading(false);
      }
    },
    [branchId, t],
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      branchManager: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      employee: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[role] || colors.employee;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.email')}</TableHead>
                <TableHead>{t('table.role')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <h3 className="text-base font-semibold">
            {t('title')} - {branchName}
          </h3>
        </div>
        {canCreateUsers && (
          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addUser')}
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.email')}</TableHead>
              <TableHead>{t('table.role')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
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
        onSuccess={loadUsers}
      />
    </div>
  );
}
