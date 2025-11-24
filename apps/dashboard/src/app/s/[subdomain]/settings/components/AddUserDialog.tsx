'use client';

import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { AddUserDialog as SharedAddUserDialog } from '@/components/shared/settings/AddUserDialog';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
  onSuccess: () => void;
}

export function AddUserDialog(props: AddUserDialogProps) {
  const { companyUser } = useCompanyUser();

  return (
    <SharedAddUserDialog
      {...props}
      currentUser={companyUser}
      companyId={companyUser?.companyId}
      translationNamespace="settings.addUserDialog"
    />
  );
}
