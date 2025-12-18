'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { reactivateUserFromBranchOrCompany } from '@/data/services/users.api';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';
import { RotateCcw } from 'lucide-react';

interface ReactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
  /**
   * Translation namespace
   */
  translationNamespace?: string;
}

export function ReactivateUserDialog({
  open,
  onOpenChange,
  user,
  branchId,
  onSuccess,
  translationNamespace = 'settings.reactivateUserDialog',
}: ReactivateUserDialogProps) {
  const t = useTranslations(translationNamespace);
  const [isReactivating, setIsReactivating] = useState(false);
  const [reactivateScope, setReactivateScope] = useState<'branch' | 'company'>('branch');

  const handleReactivate = async () => {
    if (!user) return;

    setIsReactivating(true);

    try {
      const response = await reactivateUserFromBranchOrCompany({
        branchId,
        userId: user.id,
        scope: reactivateScope,
      });

      if (response.data) {
        toast.success(t('success'));
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(t('error'));
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error(t('error'));
    } finally {
      setIsReactivating(false);
    }
  };

  const handleClose = () => {
    if (!isReactivating) {
      onOpenChange(false);
      setReactivateScope('branch');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <RotateCcw className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle>{t('title')}</DialogTitle>
              <DialogDescription className="mt-1">{t('description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t('userInfo')}</p>
            <div className="rounded-lg bg-muted p-3 border border-border">
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Reactivate Scope Selector */}
          <div className="space-y-2">
            <Label htmlFor="reactivateScope" className="text-sm font-medium">
              {t('scopeLabel')}
            </Label>
            <Select
              value={reactivateScope}
              onValueChange={(value) => setReactivateScope(value as 'branch' | 'company')}
              disabled={isReactivating}
            >
              <SelectTrigger id="reactivateScope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="branch">
                  <div className="space-y-0.5">
                    <div className="font-medium">{t('scopeOptions.branch')}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('scopeDescriptions.branch')}
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="company">
                  <div className="space-y-0.5">
                    <div className="font-medium">{t('scopeOptions.company')}</div>
                    <div className="text-xs text-muted-foreground">
                      {t('scopeDescriptions.company')}
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isReactivating}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleReactivate}
            disabled={isReactivating}
          >
            {isReactivating ? t('confirming') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
