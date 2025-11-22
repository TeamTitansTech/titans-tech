'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createUser, setCompanyManager } from '@/data/services/users.api';
import { setUserPermissions } from '@/data/services/company-branches.api';
import { PermissionsEditor } from '@/components/permissions/PermissionsEditor';
import { Permissions, WORKER_PERMISSIONS } from '@titans-tech/shared/types';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { isCompanyAdmin } from '@/lib/permissions';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
  onSuccess: () => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  branchId,
  branchName,
  onSuccess,
}: AddUserDialogProps) {
  const t = useTranslations('settings.addUserDialog');
  const tValidation = useTranslations('validation');
  const { companyUser } = useCompanyUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<Permissions>({
    ...WORKER_PERMISSIONS,
  });
  const [applyToAllBranches, setApplyToAllBranches] = useState(false);
  const [promoteToManager, setPromoteToManager] = useState(false);

  const userSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, tValidation('fullNameRequired')),
        email: z.string().email(tValidation('invalidEmail')),
      }),
    [tValidation],
  );

  type UserFormData = z.infer<typeof userSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    try {
      // Create the user
      const response = await createUser({
        branchId,
        data: {
          name: data.name,
          email: data.email,
          isCompanyAdmin: false,
          isCompanyManager: false,
        },
      });

      if (!response.data) {
        toast.error(t('error'));
        setIsSubmitting(false);
        return;
      }

      const userId = response.data.id;

      // Set branch-specific permissions
      await setUserPermissions({
        branchId,
        userId,
        permissions: permissions as unknown as Record<string, boolean>,
      });

      // If applying to all branches, we'd need to get all branches and set permissions
      // For now, the user can be added to other branches later
      // TODO: Implement multi-branch assignment on creation

      // Promote to Company Manager if requested and user has permission
      if (promoteToManager && isCompanyAdmin(companyUser)) {
        await setCompanyManager({
          branchId,
          userId,
          isCompanyManager: true,
        });
      }

      toast.success(t('success'));
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setPermissions({ ...WORKER_PERMISSIONS });
      setApplyToAllBranches(false);
      setPromoteToManager(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description', { branchName })}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('form.name.label')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t('form.name.placeholder')}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t('form.email.label')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={t('form.email.placeholder')}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <Separator />

          {/* Options */}
          <div className="space-y-3">
            {/* Apply to All Branches */}
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                id="applyToAllBranches"
                checked={applyToAllBranches}
                onCheckedChange={(checked) => setApplyToAllBranches(checked as boolean)}
                disabled={isSubmitting}
              />
              <div className="flex-1 space-y-1">
                <Label htmlFor="applyToAllBranches" className="text-sm font-medium cursor-pointer">
                  {t('form.applyToAllBranches.label')}
                </Label>
                <p className="text-xs text-gray-500">{t('form.applyToAllBranches.description')}</p>
              </div>
            </div>

            {/* Promote to Company Manager (only for Company Admins) */}
            {isCompanyAdmin(companyUser) && (
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="companyManager"
                  checked={promoteToManager}
                  onCheckedChange={(checked) => setPromoteToManager(checked as boolean)}
                  disabled={isSubmitting}
                />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="companyManager" className="text-sm font-medium cursor-pointer">
                    {t('form.companyManager.label')}
                  </Label>
                  <p className="text-xs text-gray-500">{t('form.companyManager.description')}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Permissions Editor */}
          <PermissionsEditor
            permissions={permissions}
            onChange={setPermissions}
            disabled={isSubmitting}
            showPresetSelector={true}
            companyId={companyUser?.companyId}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
