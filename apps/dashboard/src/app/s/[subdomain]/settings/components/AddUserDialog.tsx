'use client';

import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { AddUserDialog as SharedAddUserDialog } from '@/components/shared/settings/AddUserDialog';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onSuccess: () => void;
}

export function AddUserDialog({ companyId, ...props }: AddUserDialogProps) {
  const { companyUser } = useCompanyUser();

  return (
    <SharedAddUserDialog
      {...props}
      companyId={companyId}
      currentUser={companyUser}
      translationNamespace="settings.addUserDialog"
    />
  );
}
