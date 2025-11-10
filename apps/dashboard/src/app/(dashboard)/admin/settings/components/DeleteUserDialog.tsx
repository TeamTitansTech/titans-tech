'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { deleteUser } from '@/data/services/users.api';
import { getBranch } from '@/data/services/company-branches.api';
import type { UserResponseDto } from '@titans-tech/shared';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  branchId,
  onSuccess,
}: DeleteUserDialogProps) {
  const t = useTranslations('adminSettings.deleteUserDialog');
  const [isDeleting, setIsDeleting] = useState(false);
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    const fetchCompanyId = async () => {
      if (branchId) {
        const response = await getBranch({ branchId });
        if (response.data) {
          setCompanyId(response.data.companyId);
        }
      }
    };
    fetchCompanyId();
  }, [branchId]);

  const handleDelete = async () => {
    if (!user || !companyId) return;

    setIsDeleting(true);

    try {
      const response = await deleteUser({
        companyId,
        userId: user.id,
      });

      if (response.errors) {
        toast.error(t('error'));
        return;
      }

      toast.success(t('success'));
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error(t('error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('description', { userName: user?.name || 'this user' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t('deleting') : t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
