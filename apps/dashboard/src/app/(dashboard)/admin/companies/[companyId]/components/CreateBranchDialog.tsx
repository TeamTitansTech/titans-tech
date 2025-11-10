'use client';

import { useState } from 'react';
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
import { createBranch, type CompanyBranch } from '@/data/services/company-branches.api';
import { toast } from 'sonner';

const branchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  isMainBranch: z.boolean().optional(),
  location: z.string().optional().or(z.literal('')),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface CreateBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newBranch?: CompanyBranch) => void;
  companyId: string;
}

export function CreateBranchDialog({
  open,
  onOpenChange,
  onSuccess,
  companyId,
}: CreateBranchDialogProps) {
  const t = useTranslations('companies.createBranch');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    defaultValues: {
      isMainBranch: false,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const isMainBranch = watch('isMainBranch');

  const handleDialogClose = (open: boolean) => {
    if (!open && isDirty && !isSubmitting) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        reset();
        onOpenChange(false);
      }
    } else {
      onOpenChange(open);
    }
  };

  const onSubmit = async (data: BranchFormData) => {
    setIsSubmitting(true);
    const response = await createBranch({ companyId, data });

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
      onSuccess(response.data);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
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
              disabled={isSubmitting}
            />
            <Label
              htmlFor="isMainBranch"
              className="text-sm font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('form.isMainBranch.label')}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
