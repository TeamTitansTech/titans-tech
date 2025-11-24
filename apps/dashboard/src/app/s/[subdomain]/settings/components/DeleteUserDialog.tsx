'use client';

import { DeleteUserDialog as SharedDeleteUserDialog } from '@/components/shared/settings/DeleteUserDialog';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
}

export function DeleteUserDialog(props: DeleteUserDialogProps) {
  return <SharedDeleteUserDialog {...props} translationNamespace="settings.deleteUserDialog" />;
}
