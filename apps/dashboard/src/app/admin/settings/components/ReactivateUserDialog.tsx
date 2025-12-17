'use client';

import { ReactivateUserDialog as SharedReactivateUserDialog } from '@/components/shared/settings/ReactivateUserDialog';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';

interface ReactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
}

export function ReactivateUserDialog(props: ReactivateUserDialogProps) {
  return (
    <SharedReactivateUserDialog
      {...props}
      translationNamespace="adminSettings.reactivateUserDialog"
    />
  );
}
