'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HexColorPicker } from 'react-colorful';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCompany, type Company } from '@/data/services/companies.api';
import { toast } from 'sonner';

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newCompany?: Company) => void;
}

export function CreateCompanyDialog({ open, onOpenChange, onSuccess }: CreateCompanyDialogProps) {
  const t = useTranslations('adminSettings.createCompany');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const companySchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, tValidation('companyNameRequired')),
        slug: z.string().min(1, tValidation('companySlugRequired')),
        logo: z.string().url(tValidation('invalidUrl')).optional().or(z.literal('')),
        brandColor: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, tValidation('invalidHexColor'))
          .optional()
          .or(z.literal('')),
        description: z.string().optional().or(z.literal('')),
      }),
    [tValidation],
  );

  type CompanyFormData = z.infer<typeof companySchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setError,
    setValue,
    control,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      brandColor: '#000000',
    },
  });

  const brandColor = useWatch({
    control,
    name: 'brandColor',
    defaultValue: '#000000',
  });

  const handleClose = () => {
    if (isDirty && !isSubmitting) {
      setShowConfirmDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    const response = await createCompany({ data });

    if (response.errors) {
      const errorData = response.errors[0];
      if (typeof errorData === 'object' && errorData !== null) {
        Object.entries(errorData).forEach(([field, message]) => {
          if (field in data) {
            setError(field as keyof CompanyFormData, {
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
    <>
      <Dialog open={open} onOpenChange={handleClose}>
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
              <Label htmlFor="slug">{t('form.slug.label')}</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder={t('form.slug.placeholder')}
                disabled={isSubmitting}
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">{t('form.logo.label')}</Label>
              <Input
                id="logo"
                {...register('logo')}
                placeholder={t('form.logo.placeholder')}
                disabled={isSubmitting}
              />
              {errors.logo && <p className="text-sm text-destructive">{errors.logo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandColor">{t('form.brandColor.label')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={isSubmitting}
                    type="button"
                  >
                    <div
                      className="w-6 h-6 rounded border mr-2"
                      style={{ backgroundColor: brandColor }}
                    />
                    {brandColor}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker
                    color={brandColor}
                    onChange={(color) => setValue('brandColor', color, { shouldDirty: true })}
                  />
                </PopoverContent>
              </Popover>
              {errors.brandColor && (
                <p className="text-sm text-destructive">{errors.brandColor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('form.description.label')}</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder={t('form.description.placeholder')}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('submitting') : t('submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmClose}
        title={tCommon('confirmClose.title')}
        description={tCommon('confirmClose.description')}
        confirmText={tCommon('confirmClose.confirm')}
        cancelText={tCommon('confirmClose.cancel')}
      />
    </>
  );
}
