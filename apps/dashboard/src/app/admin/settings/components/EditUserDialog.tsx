'use client';

import { EditUserDialog as SharedEditUserDialog } from '@/components/shared/settings/EditUserDialog';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
}

export function EditUserDialog(props: EditUserDialogProps) {
  return (
    <SharedEditUserDialog
      {...props}
      currentUser={null}
      translationNamespace="settings.editUserDialog"
    />
  );
}
