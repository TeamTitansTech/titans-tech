'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  updateUser,
  updateUserPermissions,
  updateUserPermissionsAllBranches,
} from '@/data/services/users.api';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';
import { Permissions } from '@titans-tech/shared/types';
import { PermissionsEditor } from '@/components/permissions/PermissionsEditor';
import { hasPermissionInBranch } from '@titans-tech/shared/types';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponseDto | null;
  branchId: string;
  onSuccess: () => void;
  /**
   * Translation namespace
   */
  translationNamespace?: string;
  /**
   * Current user for permission checks (null = sysadmin with full permissions)
   */
  currentUser?: UserResponseDto | null;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  branchId,
  onSuccess,
  translationNamespace = 'settings.editUserDialog',
  currentUser = null,
}: EditUserDialogProps) {
  const t = useTranslations(translationNamespace);
  const tValidation = useTranslations('validation');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateScope, setUpdateScope] = useState<'thisBranch' | 'allBranches'>('thisBranch');
  const [permissions, setPermissions] = useState<Permissions | null>(null);

  // Check current user permissions (sysadmin has all permissions)
  const canUpdateUserInfo =
    !currentUser || hasPermissionInBranch(currentUser, branchId, 'updateUsers');
  const canManagePermissions =
    !currentUser || hasPermissionInBranch(currentUser, branchId, 'manageUserPermissions');

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

  // Initialize form when user changes
  useEffect(() => {
    if (user && open) {
      reset({
        name: user.name || '',
        email: user.email,
      });

      // Get permissions for this branch
      const branchData = user.branches?.find((b) => b.branchId === branchId);
      if (branchData) {
        setPermissions(branchData);
      }

      setUpdateScope('thisBranch');
    }
  }, [user, branchId, open, reset]);

  const onSubmit = async (data: UserFormData) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Update user info (name, email) if permission exists
      if (canUpdateUserInfo && (data.name !== user.name || data.email !== user.email)) {
        const updateResponse = await updateUser({
          companyId: user.companyId,
          userId: user.id,
          data: {
            name: data.name,
            email: data.email,
          },
        });

        if (!updateResponse.data) {
          toast.error(t('error'));
          setIsSubmitting(false);
          return;
        }
      }

      // Update permissions if permission exists and permissions changed
      if (canManagePermissions && permissions) {
        if (updateScope === 'allBranches') {
          const response = await updateUserPermissionsAllBranches({
            branchId,
            userId: user.id,
            permissions,
            applyToAllBranches: true,
          });

          if (!response.data) {
            toast.error(t('error'));
            setIsSubmitting(false);
            return;
          }
        } else {
          const response = await updateUserPermissions({
            branchId,
            userId: user.id,
            permissions,
          });

          if (!response.data) {
            toast.error(t('error'));
            setIsSubmitting(false);
            return;
          }
        }
      }

      toast.success(t('success'));
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      reset();
      setPermissions(null);
    }
  };

  if (!user) return null;

  // Don't allow editing company admins
  if (user.isCompanyAdmin) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Company Administrators cannot be edited. Please contact system support to modify admin
              accounts.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Info - Only show if user has updateUsers permission */}
          {canUpdateUserInfo && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('form.name.label')}</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder={t('form.name.placeholder')}
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('form.email.label')}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder={t('form.email.placeholder')}
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>
              </div>

              {canManagePermissions && <Separator />}
            </>
          )}

          {/* Permissions Section - Only show if user has manageUserPermissions */}
          {canManagePermissions && permissions && (
            <>
              {/* Update Scope */}
              <div className="space-y-2">
                <Label htmlFor="updateScope">{t('form.updateScope.label')}</Label>
                <Select
                  value={updateScope}
                  onValueChange={(value) => setUpdateScope(value as 'thisBranch' | 'allBranches')}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="updateScope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thisBranch">{t('form.updateScope.thisBranch')}</SelectItem>
                    <SelectItem value="allBranches">{t('form.updateScope.allBranches')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">{t('form.updateScope.description')}</p>
              </div>

              <Separator />

              {/* Permissions Editor */}
              <PermissionsEditor
                permissions={permissions}
                onChange={setPermissions}
                disabled={isSubmitting}
                showPresetSelector={true}
                companyId={user.companyId}
              />
            </>
          )}

          {/* Show message if user has no permissions to edit anything */}
          {!canUpdateUserInfo && !canManagePermissions && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-center">
              <p className="text-sm text-yellow-800">
                {t('noPermissionToEdit') || 'Você não tem permissão para editar este usuário.'}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            {(canUpdateUserInfo || canManagePermissions) && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('submitting') : t('submit')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
