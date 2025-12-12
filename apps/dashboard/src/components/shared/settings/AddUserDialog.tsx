'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { createUser, assignUserToBranch, getAllUsers } from '@/data/services/users.api';
import {
  setUserPermissions,
  getAllBranches,
  CompanyBranch,
} from '@/data/services/company-branches.api';
import { PermissionsEditor } from '@/components/permissions/PermissionsEditor';
import { Permissions, EMPTY_PERMISSIONS } from '@titans-tech/shared/types';
import { SetUserPermissionsDto } from '@titans-tech/shared/backend-dtos';
import { Loader2 } from 'lucide-react';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /**
   * Translation namespace (e.g., 'settings.addUserDialog' or 'adminSettings.addUserDialog')
   */
  translationNamespace?: string;
  /**
   * Current user context for permission checks
   * If not provided, assumes admin with full permissions
   */
  currentUser?: {
    isCompanyAdmin: boolean;
    companyId?: string;
  } | null;
  /**
   * Company ID for permission templates and fetching branches
   */
  companyId: string;
}

// Maps backend error messages to translation keys
const API_ERROR_MAP: Record<string, string> = {
  'Email already in use': 'emailAlreadyInUse',
  'User not found': 'userNotFound',
  'User is already assigned to this branch': 'userAlreadyAssigned',
  'User is not assigned to this branch': 'userNotAssignedToBranch',
  'User does not belong to this company': 'userNotBelongToCompany',
  'Connection error': 'connectionError',
};

export function AddUserDialog({
  open,
  onOpenChange,
  onSuccess,
  translationNamespace = 'settings.addUserDialog',
  companyId,
}: AddUserDialogProps) {
  const t = useTranslations(translationNamespace);
  const tValidation = useTranslations('validation');
  const tApiErrors = useTranslations('errors.api');

  /**
   * Translates a backend error message to the user's language
   */
  const translateApiError = (error: string): string => {
    const translationKey = API_ERROR_MAP[error];
    if (translationKey) {
      return tApiErrors(translationKey);
    }
    // If no mapping found, return the original error
    return error;
  };

  /**
   * Translates an array of backend errors
   */
  const translateApiErrors = (errors: string[]): string => {
    return errors.map(translateApiError).join(', ');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<Permissions>({
    ...EMPTY_PERMISSIONS,
  });
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<string>>(new Set());
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Fetch branches when dialog opens
  useEffect(() => {
    if (open && companyId) {
      setIsLoadingBranches(true);
      getAllBranches({ companyId })
        .then((response) => {
          if (response.data) {
            setBranches(response.data);
          }
        })
        .finally(() => setIsLoadingBranches(false));
    }
  }, [open, companyId]);

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

  const onSubmit = async (data: UserFormData) => {
    // Validate at least one branch is selected
    if (selectedBranchIds.size === 0) {
      toast.error(t('form.branches.selectAtLeastOne'));
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedBranchesArray = Array.from(selectedBranchIds);
      const permissionsDto = permissions as unknown as SetUserPermissionsDto;

      // Check if user with this email already exists in the company
      const existingUsersResponse = await getAllUsers({ companyId });
      const existingUser = existingUsersResponse.data?.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase(),
      );

      if (existingUser) {
        // User already exists - assign them to selected branches
        const userId = existingUser.id;

        // Filter out branches where user is already assigned
        const userExistingBranchIds = new Set(existingUser.branches?.map((b) => b.branchId) || []);
        const newBranches = selectedBranchesArray.filter(
          (branchId) => !userExistingBranchIds.has(branchId),
        );

        if (newBranches.length === 0) {
          toast.error(t('userAlreadyInAllBranches'));
          setIsSubmitting(false);
          return;
        }

        // Assign to new branches (this only creates the UserBranch link, no permissions)
        const assignResults = await Promise.all(
          newBranches.map((branchId) =>
            assignUserToBranch({
              branchId,
              userId,
              permissions: permissionsDto,
            }),
          ),
        );

        // Check for assignment errors
        const failedAssignments = assignResults.filter((r) => r.errors);
        if (failedAssignments.length > 0) {
          const errorMessages = failedAssignments
            .flatMap((r) => r.errors || [])
            .map(translateApiError);
          toast.error(errorMessages.join(', '));
          setIsSubmitting(false);
          return;
        }

        // Now set permissions for each new branch
        await Promise.all(
          newBranches.map((branchId) =>
            setUserPermissions({
              branchId,
              userId,
              permissions: permissions as unknown as Record<string, boolean>,
            }),
          ),
        );

        toast.success(t('successExistingUser', { count: newBranches.length }));
      } else {
        // New user - create first, then assign to additional branches
        const firstBranchId = selectedBranchesArray[0];

        const response = await createUser({
          branchId: firstBranchId,
          data: {
            name: data.name,
            email: data.email,
            isCompanyAdmin: false,
          },
        });

        if (!response.data) {
          const errorMessage = response.errors ? translateApiErrors(response.errors) : t('error');
          toast.error(errorMessage);
          setIsSubmitting(false);
          return;
        }

        const userId = response.data.id;

        // Set permissions for the first branch
        await setUserPermissions({
          branchId: firstBranchId,
          userId,
          permissions: permissions as unknown as Record<string, boolean>,
        });

        // Assign user to remaining selected branches
        const remainingBranches = selectedBranchesArray.slice(1);
        if (remainingBranches.length > 0) {
          // First assign user to branches (creates UserBranch link)
          await Promise.all(
            remainingBranches.map((branchId) =>
              assignUserToBranch({
                branchId,
                userId,
                permissions: permissionsDto,
              }),
            ),
          );

          // Then set permissions for each branch
          await Promise.all(
            remainingBranches.map((branchId) =>
              setUserPermissions({
                branchId,
                userId,
                permissions: permissions as unknown as Record<string, boolean>,
              }),
            ),
          );
        }

        toast.success(t('success'));
      }

      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage =
        error instanceof Error ? `${t('error')}: ${translateApiError(error.message)}` : t('error');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setPermissions({ ...EMPTY_PERMISSIONS });
      setSelectedBranchIds(new Set());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('descriptionCompanyLevel')}</DialogDescription>
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

          {/* Branch Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{t('form.branches.label')}</Label>
                <p className="text-xs text-muted-foreground">{t('form.branches.description')}</p>
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
                    {t('form.branches.selectAll')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={isSubmitting || selectedBranchIds.size === 0}
                  >
                    {t('form.branches.deselectAll')}
                  </Button>
                </div>
              )}
            </div>

            {isLoadingBranches ? (
              <div className="flex items-center justify-center p-4 border rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">{t('form.branches.loading')}</span>
              </div>
            ) : branches.length > 0 ? (
              <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                {branches.map((branch) => {
                  const isSelected = selectedBranchIds.has(branch.id);

                  return (
                    <div
                      key={branch.id}
                      className="flex items-center space-x-3 p-3 hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`branch-${branch.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleBranchToggle(branch.id, checked as boolean)
                        }
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`branch-${branch.id}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        {branch.name}
                        {branch.isMainBranch && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({t('form.branches.main')})
                          </span>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 border rounded-lg text-center text-sm text-muted-foreground">
                {t('form.branches.noBranches')}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {t('form.branches.selectedCount', { count: selectedBranchIds.size })}
            </p>
          </div>

          <Separator />

          {/* Permissions Editor */}
          <PermissionsEditor
            permissions={permissions}
            onChange={setPermissions}
            disabled={isSubmitting}
            showPresetSelector={true}
            companyId={companyId}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedBranchIds.size === 0}>
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
