'use client';

import { AddUserDialog as SharedAddUserDialog } from '@/components/shared/settings/AddUserDialog';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onSuccess: () => void;
}

export function AddUserDialog({ companyId, ...props }: AddUserDialogProps) {
  return (
    <SharedAddUserDialog
      {...props}
      companyId={companyId}
      currentUser={null}
      translationNamespace="settings.addUserDialog"
    />
  );
}
