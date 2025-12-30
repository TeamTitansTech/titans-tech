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
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  updateUser,
  updateUserPermissionsAllBranches,
  assignUserToBranch,
  removeUserFromBranch,
} from '@/data/services/users.api';
import {
  setUserPermissions,
  getAllBranches,
  type CompanyBranch,
} from '@/data/services/company-branches.api';
import { UserResponseDto } from '@titans-tech/shared/backend-dtos';
import { Permissions } from '@titans-tech/shared/types';
import { PermissionsEditor } from '@/components/permissions/PermissionsEditor';
import { hasPermissionInBranch } from '@titans-tech/shared/types';
import { Loader2 } from 'lucide-react';

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

  const tAddUser = useTranslations('settings.addUserDialog');
  const tBranches = useTranslations('settings.addUserDialog.form.branches');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<string>>(new Set());
  const [initialBranchIds, setInitialBranchIds] = useState<Set<string>>(new Set());
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Check current user permissions (sysadmin has all permissions)
  const canUpdateUserInfo =
    !currentUser || hasPermissionInBranch(currentUser, branchId, 'updateUsers');
  const canManagePermissions =
    !currentUser || hasPermissionInBranch(currentUser, branchId, 'manageUserPermissions');
  const canAssignToBranches =
    !currentUser || hasPermissionInBranch(currentUser, branchId, 'assignUsersToBranches');

  const handleBranchToggle = (branchIdToToggle: string, checked: boolean) => {
    setSelectedBranchIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(branchIdToToggle);
      } else {
        newSet.delete(branchIdToToggle);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedBranchIds(new Set(branches.map((b) => b.id)));
  };

  const handleDeselectAll = () => {
    setSelectedBranchIds(new Set());
  };

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

      // Initialize selected branches from user's current branches
      const userBranchIds = new Set(user.branches?.map((b) => b.branchId) || []);
      setSelectedBranchIds(userBranchIds);
      setInitialBranchIds(userBranchIds);

      // Fetch all branches for the company
      if (canAssignToBranches) {
        setIsLoadingBranches(true);
        getAllBranches({ companyId: user.companyId })
          .then((response) => {
            if (response.data) {
              setBranches(response.data);
            }
          })
          .finally(() => setIsLoadingBranches(false));
      }
    }
  }, [user, branchId, open, reset, canAssignToBranches]);

  const onSubmit = async (data: UserFormData) => {
    if (!user) return;

    // Validate at least one branch is selected
    if (selectedBranchIds.size === 0) {
      toast.error(tAddUser('form.branches.selectAtLeastOne'));
      return;
    }

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

      // Handle branch membership changes
      if (canAssignToBranches) {
        // Find branches to add (in selected but not in initial)
        const branchesToAdd = [...selectedBranchIds].filter((id) => !initialBranchIds.has(id));
        // Find branches to remove (in initial but not in selected)
        const branchesToRemove = [...initialBranchIds].filter((id) => !selectedBranchIds.has(id));

        // Add user to new branches
        if (branchesToAdd.length > 0 && permissions) {
          for (const newBranchId of branchesToAdd) {
            await assignUserToBranch({
              branchId: newBranchId,
              userId: user.id,
              permissions: permissions as unknown as Record<string, boolean>,
            });
            // Set permissions for the new branch
            await setUserPermissions({
              branchId: newBranchId,
              userId: user.id,
              permissions: permissions as unknown as Record<string, boolean>,
            });
          }
        }

        // Remove user from branches
        for (const removeBranchId of branchesToRemove) {
          await removeUserFromBranch({
            branchId: removeBranchId,
            userId: user.id,
          });
        }
      }

      // Update permissions for all branches (users have same permissions across all branches)
      if (canManagePermissions && permissions && selectedBranchIds.size > 0) {
        // Use any branch the user is in to update permissions
        const activeBranchId = selectedBranchIds.has(branchId)
          ? branchId
          : [...selectedBranchIds][0];

        const response = await updateUserPermissionsAllBranches({
          branchId: activeBranchId,
          userId: user.id,
          permissions,
          applyToAllBranches: true,
        });

        if (!response.data) {
          toast.error(t('error'));
          setIsSubmitting(false);
          return;
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
      <DialogContent className="sm:max-w-[700px]" data-testid="edit-user-dialog">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody className="space-y-6">
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

                {(canAssignToBranches || canManagePermissions) && <Separator />}
              </>
            )}

            {/* Branch Selection - Only show if user has assignUsersToBranches permission */}
            {canAssignToBranches && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{tBranches('label')}</Label>
                      <p className="text-xs text-muted-foreground">{tBranches('description')}</p>
                    </div>
                    {branches.length > 1 && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleSelectAll}
                          disabled={isSubmitting || selectedBranchIds.size === branches.length}
                        >
                          {tBranches('selectAll')}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleDeselectAll}
                          disabled={isSubmitting || selectedBranchIds.size === 0}
                        >
                          {tBranches('deselectAll')}
                        </Button>
                      </div>
                    )}
                  </div>

                  {isLoadingBranches ? (
                    <div className="flex items-center justify-center rounded-lg border p-4">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">{tBranches('loading')}</span>
                    </div>
                  ) : branches.length > 0 ? (
                    <div className="max-h-[200px] divide-y overflow-y-auto rounded-lg border">
                      {branches.map((branch) => {
                        const isSelected = selectedBranchIds.has(branch.id);

                        return (
                          <div
                            key={branch.id}
                            className="flex items-center space-x-3 p-3 hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`edit-branch-${branch.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleBranchToggle(branch.id, checked as boolean)
                              }
                              disabled={isSubmitting}
                            />
                            <Label
                              htmlFor={`edit-branch-${branch.id}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {branch.name}
                              {branch.isMainBranch && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({tBranches('main')})
                                </span>
                              )}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
                      {tBranches('noBranches')}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {tBranches('selectedCount', { count: selectedBranchIds.size })}
                  </p>
                </div>
              </>
            )}

            {/* Permissions Section - Only show if user has manageUserPermissions */}
            {canManagePermissions && permissions && (
              <>
                {(canUpdateUserInfo || canAssignToBranches) && <Separator />}

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
            {!canUpdateUserInfo && !canManagePermissions && !canAssignToBranches && (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-center">
                <p className="text-sm text-yellow-800">
                  {t('noPermissionToEdit') || 'Você não tem permissão para editar este usuário.'}
                </p>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            {(canUpdateUserInfo || canManagePermissions || canAssignToBranches) && (
              <Button type="submit" disabled={isSubmitting} data-testid="edit-user-submit-button">
                {isSubmitting ? t('submitting') : t('submit')}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
