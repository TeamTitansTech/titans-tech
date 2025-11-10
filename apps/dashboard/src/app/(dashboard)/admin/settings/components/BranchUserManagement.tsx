'use client';

import { useState, useEffect } from 'react';
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

interface BranchUserManagementProps {
  branchId: string;
}

export function BranchUserManagement({ branchId }: BranchUserManagementProps) {
  const t = useTranslations('adminSettings.userManagement');
  const [users, setUsers] = useState<User[]>([]);
  const [branchName, setBranchName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!branchId) return;

      setIsLoading(true);
      try {
        // Get branch info
        const branchResponse = await getBranch({ branchId });
        if (branchResponse.data) {
          setBranchName(branchResponse.data.name);

          // Get users for the company
          const usersResponse = await getAllUsers({ companyId: branchResponse.data.companyId });
          if (usersResponse.data) {
            // Mock user data for now - in reality you'd filter by branch
            const mockUsers: User[] = [
              {
                id: '1',
                name: 'John Admin',
                email: 'john@acme.com',
                role: 'Admin',
                status: 'active',
              },
              {
                id: '2',
                name: 'Sarah User',
                email: 'sarah@acme.com',
                role: 'Inspector',
                status: 'active',
              },
              {
                id: '3',
                name: 'Mike Inspector',
                email: 'mike@acme.com',
                role: 'Operator',
                status: 'active',
              },
              {
                id: '4',
                name: 'Emily Manager',
                email: 'emily@acme.com',
                role: 'Viewer',
                status: 'active',
              },
              {
                id: '5',
                name: 'Tom Operator',
                email: 'tom@acme.com',
                role: 'Operator',
                status: 'inactive',
              },
            ];
            setUsers(mockUsers);
          }
        }
      } catch (error) {
        toast.error(t('loadingFailed'));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [branchId, t]);

  const handleAddUserSuccess = () => {
    // Reload user data after adding a new user
    // In a real app, you'd refetch the users from the API
    // For now, just show success toast (already handled in dialog)
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      Admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      Inspector: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      Operator: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      Viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[role] || colors.Viewer;
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('title')}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          {t('title')} - {branchName}
        </h3>
        <Button size="sm" onClick={() => setIsAddUserDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addUser')}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              <TableHead>{t('table.email')}</TableHead>
              <TableHead>{t('table.role')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
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
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}
                    >
                      {t(`status.${user.status}`)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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

      {/* Add User Dialog */}
      <AddUserDialog
        open={isAddUserDialogOpen}
        onOpenChange={setIsAddUserDialogOpen}
        branchName={branchName}
        onSuccess={handleAddUserSuccess}
      />
    </div>
  );
}
