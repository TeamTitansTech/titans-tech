'use client';

import { useState, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HexColorPicker } from 'react-colorful';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
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
import { uploadLogo } from '@/data/services/upload.api';
import { toast } from 'sonner';

interface CompanyCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newCompany?: Company) => void;
}

export function CompanyCreationModal({ open, onOpenChange, onSuccess }: CompanyCreationModalProps) {
  const t = useTranslations('adminSettings.createCompany');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        accentColor: z
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
      brandColor: '#1e3a5f',
      accentColor: '#f97415',
    },
  });

  const brandColor = useWatch({
    control,
    name: 'brandColor',
    defaultValue: '#1e3a5f',
  });

  const accentColor = useWatch({
    control,
    name: 'accentColor',
    defaultValue: '#f97415',
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
    setLogoPreview(null);
    onOpenChange(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error(tValidation('invalidImageType'));
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(tValidation('fileTooLarge'));
      return;
    }

    setIsUploadingLogo(true);

    try {
      const result = await uploadLogo(file);

      if (result.error || !result.url) {
        toast.error(result.error || t('form.logo.uploadError'));
        return;
      }

      setLogoPreview(result.url);
      setValue('logo', result.url, { shouldDirty: true });
      toast.success(t('form.logo.uploadSuccess'));
    } catch {
      toast.error(t('form.logo.uploadError'));
    } finally {
      setIsUploadingLogo(false);
      // Reset file input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setValue('logo', '', { shouldDirty: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      setLogoPreview(null);
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
              <Label>{t('form.logo.label')}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={isSubmitting || isUploadingLogo}
              />
              {logoPreview ? (
                <div className="relative w-full h-32 border rounded-md overflow-hidden bg-muted/50">
                  <Image src={logoPreview} alt="Logo preview" fill className="object-contain p-2" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={handleRemoveLogo}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {t('form.logo.uploading')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {t('form.logo.uploadHint')}
                      </span>
                    </>
                  )}
                </div>
              )}
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
              <Label htmlFor="accentColor">{t('form.accentColor.label')}</Label>
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
                      style={{ backgroundColor: accentColor }}
                    />
                    {accentColor}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker
                    color={accentColor}
                    onChange={(color) => setValue('accentColor', color, { shouldDirty: true })}
                  />
                </PopoverContent>
              </Popover>
              {errors.accentColor && (
                <p className="text-sm text-destructive">{errors.accentColor.message}</p>
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
