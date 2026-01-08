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
import { updateBranch, type CompanyBranch } from '@/data/services/company-branches.api';
import { toast } from 'sonner';

interface EditBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: CompanyBranch | null;
  onSuccess?: () => void;
}

export function EditBranchDialog({ open, onOpenChange, branch, onSuccess }: EditBranchDialogProps) {
  const t = useTranslations('settings.editBranchDialog');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branchSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, tValidation('branchNameRequired')),
        location: z.string().optional().or(z.literal('')),
        isMainBranch: z.boolean().optional(),
      }),
    [tValidation],
  );

  type BranchFormData = z.infer<typeof branchSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
    setError,
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const isMainBranch = watch('isMainBranch');

  // Initialize form when branch changes
  useEffect(() => {
    if (branch && open) {
      reset({
        name: branch.name,
        location: branch.location || '',
        isMainBranch: branch.isMainBranch,
      });
    }
  }, [branch, open, reset]);

  const handleDialogClose = (open: boolean) => {
    if (!open && isDirty && !isSubmitting) {
      if (confirm(tCommon('unsavedChanges'))) {
        reset();
        onOpenChange(false);
      }
    } else {
      onOpenChange(open);
    }
  };

  const onSubmit = async (data: BranchFormData) => {
    if (!branch) return;

    setIsSubmitting(true);
    const response = await updateBranch({
      branchId: branch.id,
      data: {
        name: data.name,
        location: data.location || undefined,
        isMainBranch: data.isMainBranch,
      },
    });

    if (response.errors) {
      const errorData = response.errors[0];
      if (typeof errorData === 'object' && errorData !== null) {
        Object.entries(errorData).forEach(([field, message]) => {
          if (field in data) {
            setError(field as keyof BranchFormData, {
              type: 'manual',
              message: String(message),
            });
          }
        });
      } else {
        toast.error(t('error'));
      }
    } else {
      toast.success(t('success'));
      reset();
      onOpenChange(false);
      onSuccess?.();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open && !!branch} onOpenChange={handleDialogClose}>
      <DialogContent data-testid="edit-branch-dialog">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('form.name.label')}</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('form.name.placeholder')}
              disabled={isSubmitting}
              data-testid="branch-name-input"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('form.location.label')}</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder={t('form.location.placeholder')}
              disabled={isSubmitting}
              data-testid="branch-location-input"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMainBranch"
              checked={isMainBranch}
              onCheckedChange={(checked) => setValue('isMainBranch', checked as boolean)}
              disabled={isSubmitting || branch?.isMainBranch}
              data-testid="branch-main-checkbox"
            />
            <Label
              htmlFor="isMainBranch"
              className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('form.isMainBranch.label')}
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              data-testid="branch-edit-cancel"
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="branch-edit-submit">
              {isSubmitting ? t('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
