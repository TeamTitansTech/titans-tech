'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, X, Wrench, Lock } from 'lucide-react';
import { submitPublicServiceRequest } from '@/data/services/public.api';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@/config/uploads';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface UrgentServiceModalProps {
  machineId: string;
  machineName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UrgentServiceModal({
  machineId,
  machineName,
  open,
  onOpenChange,
  onSuccess,
}: UrgentServiceModalProps) {
  const t = useTranslations('public.machine');
  const tCommon = useTranslations('common.imageUpload');
  const tActions = useTranslations('actions');
  const tMachines = useTranslations('machines');
  const { companyUser } = useCompanyUser();

  // Pre-fill with company user info (read-only)
  const prefilledName = companyUser?.name || '';
  const prefilledEmail = companyUser?.email || '';

  const [requesterPhone, setRequesterPhone] = useState('');
  const [problemDescription, setProblemDescription] = useState('');

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset form
      setRequesterPhone('');
      setProblemDescription('');
      setImageUrl(null);
      setImagePreview(null);
      setUploadError(null);
    }
    onOpenChange(isOpen);
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return tCommon('onlyJpgPngAllowed');
    }
    if (file.size > MAX_FILE_SIZE) {
      return tCommon('fileTooLarge', { size: MAX_FILE_SIZE_MB });
    }
    return null;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || tCommon('uploadFailed'));
      }

      const data = await response.json();
      setImageUrl(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : tCommon('uploadFailed'));
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prefilledName.trim() || !prefilledEmail.trim() || !problemDescription.trim()) {
      toast.error(t('form.validation.required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitPublicServiceRequest({
        machineId,
        requesterName: prefilledName.trim(),
        requesterEmail: prefilledEmail.trim().toLowerCase(),
        requesterPhone: requesterPhone.trim() || undefined,
        problemDescription: problemDescription.trim(),
        imageUrl: imageUrl || undefined,
      });

      if (response.errors) {
        toast.error(response.errors[0] || t('form.error'));
        return;
      }

      toast.success(t('form.success'));
      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast.error(t('form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" />
            {tMachines('requestUrgentService')}
          </DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Machine name display */}
          <div className="space-y-2">
            <Label>{tMachines('machine')}</Label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">{machineName}</div>
          </div>

          {/* Pre-filled name (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="requesterName" className="flex items-center gap-1">
              {t('form.name')} *
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <Input
              id="requesterName"
              value={prefilledName}
              readOnly
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>

          {/* Pre-filled email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="requesterEmail" className="flex items-center gap-1">
              {t('form.email')} *
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <Input
              id="requesterEmail"
              type="email"
              value={prefilledEmail}
              readOnly
              disabled
              className="bg-muted cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requesterPhone">{t('form.phone')}</Label>
            <Input
              id="requesterPhone"
              type="tel"
              value={requesterPhone}
              onChange={(e) => setRequesterPhone(e.target.value)}
              placeholder={t('form.phonePlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemDescription">{t('form.problem')} *</Label>
            <Textarea
              id="problemDescription"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder={t('form.problemPlaceholder')}
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>{t('form.image')}</Label>
            <p className="text-xs text-muted-foreground mb-2">{t('form.imageDescription')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              disabled={isSubmitting || isUploading}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative">
                <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-border overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized={imagePreview.startsWith('data:')}
                  />
                </div>
                {!isUploading && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 h-8 w-8"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p className="text-sm">{tCommon('uploading')}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isUploading}
                className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="h-8 w-8" />
                <div className="text-sm text-center px-4">
                  <p className="font-medium">{tCommon('clickToUpload')}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{tCommon('jpgOrPngMax')}</p>
                </div>
              </button>
            )}

            {uploadError && <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting || isUploading}
              className="flex-1"
            >
              {tActions('cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('form.submitting')}
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tCommon('uploading')}
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  {t('form.submit')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
