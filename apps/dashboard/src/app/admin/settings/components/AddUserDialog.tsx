'use client';

import { AddUserDialog as SharedAddUserDialog } from '@/components/shared/settings/AddUserDialog';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
  onSuccess: () => void;
}

export function AddUserDialog(props: AddUserDialogProps) {
  return (
    <SharedAddUserDialog
      {...props}
      currentUser={null}
      translationNamespace="settings.addUserDialog"
    />
  );
}
