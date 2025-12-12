'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { EditUserDialog } from './EditUserDialog';
import { DeleteUserDialog } from './DeleteUserDialog';
import {
  getUserRole,
  getUserRoleBadgeColor,
  hasPermissionInBranch,
} from '@titans-tech/shared/types';
import type { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface BranchUserManagementProps {
  branchId: string;
  refreshKey?: number;
}

export function BranchUserManagement({ branchId, refreshKey }: BranchUserManagementProps) {
  const t = useTranslations('settings.userManagement');
  const { companyUser } = useCompanyUser();

  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [branchName, setBranchName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);

  // Check permissions for this branch
  // Note: isCompanyAdmin already grants all permissions via hasPermission
  const canReadUsers =
    companyUser?.isCompanyAdmin ||
    companyUser?.branches?.some((b) => b.branchId === branchId && b.readUsers);

  const loadUsers = useCallback(async () => {
    if (!branchId) return;

    setIsLoading(true);

    try {
      const branchResponse = await getBranch({ branchId });
      if (branchResponse.data) {
        setBranchName(branchResponse.data.name);

        const usersResponse = await getAllUsers({
          companyId: branchResponse.data.companyId,
        });
        if (usersResponse.data) {
          // Filter users for this branch
          const filteredUsers = usersResponse.data.filter((user) => {
            // Exclude company admins - they are shown at company level
            if (user.isCompanyAdmin) {
              return false;
            }
            // Include only users with permissions for this branch
            return user.branches?.some((b) => b.branchId === branchId);
          });

          setUsers(filteredUsers);
        }
      }
    } catch {
      toast.error(t('loadingFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [branchId, t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, refreshKey]);

  const handleEdit = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleDelete = (user: UserResponseDto) => {
    setSelectedUser(user);
    setIsDeleteUserDialogOpen(true);
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
                <TableHead className="w-[100px]">{t('table.actions')}</TableHead>
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
                  <TableCell>
                    <Skeleton className="h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Check if user has permission to view users
  if (!canReadUsers) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <h3 className="text-base font-semibold">
            {t('title')} - {branchName}
          </h3>
        </div>
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-6 text-center">
          <p className="text-sm text-yellow-800">
            {t('noPermissionToViewUsers') ||
              'Você não tem permissão para visualizar usuários nesta filial.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <h3 className="text-base font-semibold">
          {t('title')} - {branchName}
        </h3>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.email')}</TableHead>
              <TableHead>{t('table.role')}</TableHead>
              <TableHead className="w-[120px]">{t('table.actions')}</TableHead>
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
              users.map((user) => {
                const role = getUserRole(user, branchId);

                const canEdit = hasPermissionInBranch(companyUser, branchId, 'updateUsers');
                const canDelete = hasPermissionInBranch(companyUser, branchId, 'deleteUsers');

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'Unknown User'}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getUserRoleBadgeColor(role)} variant="secondary">
                        {t(`roles.${role}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          disabled={!canEdit}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">{t('editUser')}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          disabled={!canDelete}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t('deleteUser')}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <EditUserDialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
        user={selectedUser}
        branchId={branchId}
        onSuccess={loadUsers}
      />

      <DeleteUserDialog
        open={isDeleteUserDialogOpen}
        onOpenChange={setIsDeleteUserDialogOpen}
        user={selectedUser}
        branchId={branchId}
        onSuccess={loadUsers}
      />
    </div>
  );
}
