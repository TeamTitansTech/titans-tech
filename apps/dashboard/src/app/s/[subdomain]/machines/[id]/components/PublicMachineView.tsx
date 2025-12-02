'use client';

import { useState, useMemo, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  Building2,
  MapPin,
  Wrench,
  CheckCircle,
  Loader2,
  LogIn,
  Upload,
  X,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { PublicMachineInfo } from '@/data/services/public.api';
import { submitPublicServiceRequest } from '@/data/services/public.api';
import { hexToHSL, getForegroundHSL } from '@/lib/colors';
import { isValidEmail } from '@/lib/validators';
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@/config/uploads';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface PublicMachineViewProps {
  machine: PublicMachineInfo;
  machineId: string;
}

export function PublicMachineView({ machine, machineId }: PublicMachineViewProps) {
  const t = useTranslations('public.machine');
  const tCommon = useTranslations('common.imageUpload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [problemDescription, setProblemDescription] = useState('');

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate CSS variables from company brand color
  const themeStyles = useMemo(() => {
    const brandColor = machine.company.brandColor;
    if (!brandColor) return {};

    const primaryHSL = hexToHSL(brandColor);
    const foregroundHSL = getForegroundHSL(brandColor);

    return {
      '--primary': primaryHSL,
      '--primary-foreground': foregroundHSL,
      '--ring': primaryHSL,
    } as React.CSSProperties;
  }, [machine.company.brandColor]);

  const hasBrandColor = Boolean(machine.company.brandColor);

  // Build the login URL with redirect back to this machine page
  // Encode the redirect path to handle special characters in the URL
  const loginUrl = `/?redirect=${encodeURIComponent(`/machines/${machineId}`)}`;

  // Image upload handlers
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

    if (!requesterName.trim() || !requesterEmail.trim() || !problemDescription.trim()) {
      toast.error(t('form.validation.required'));
      return;
    }

    // Basic email validation
    if (!isValidEmail(requesterEmail)) {
      toast.error(t('form.validation.invalidEmail'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitPublicServiceRequest({
        machineId: machine.id,
        requesterName: requesterName.trim(),
        requesterEmail: requesterEmail.trim().toLowerCase(),
        requesterPhone: requesterPhone.trim() || undefined,
        problemDescription: problemDescription.trim(),
        imageUrl: imageUrl || undefined,
      });

      if (response.errors) {
        toast.error(response.errors[0] || t('form.error'));
        return;
      }

      setIsSubmitted(true);
      toast.success(t('form.success'));
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast.error(t('form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b to-white dark:from-gray-900 dark:to-gray-800 ${
        hasBrandColor ? 'from-primary/10' : 'from-orange-50'
      }`}
      style={themeStyles}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Login button at the top */}
        <div className="flex justify-end mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href={loginUrl}>
              <LogIn className="w-4 h-4 mr-2" />
              {t('login')}
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              hasBrandColor
                ? 'bg-primary/20 dark:bg-primary/30'
                : 'bg-orange-100 dark:bg-orange-900/30'
            }`}
          >
            <Wrench className={`w-8 h-8 ${hasBrandColor ? 'text-primary' : 'text-orange-500'}`} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
        </div>

        {/* Machine Info Card */}
        <Card
          className={`mb-6 ${
            hasBrandColor
              ? 'border-primary/30 dark:border-primary/50'
              : 'border-orange-200 dark:border-orange-800'
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Box className={`w-5 h-5 ${hasBrandColor ? 'text-primary' : 'text-orange-500'}`} />
              {t('machineInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="shrink-0">
                {machine.imageUrl ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={machine.imageUrl}
                      alt={machine.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <Box className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">{machine.name}</h3>
                {machine.serialNumber && (
                  <p className="text-sm text-muted-foreground">
                    {t('serialNumber')}: {machine.serialNumber}
                  </p>
                )}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  {machine.company.name}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {machine.branch.name}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success or Form */}
        {isSubmitted ? (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                  {t('form.successTitle')}
                </h3>
                <p className="text-green-600 dark:text-green-500">{t('form.successMessage')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench
                  className={`w-5 h-5 ${hasBrandColor ? 'text-primary' : 'text-orange-500'}`}
                />
                {t('form.title')}
              </CardTitle>
              <CardDescription>{t('form.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requesterName">{t('form.name')} *</Label>
                  <Input
                    id="requesterName"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder={t('form.namePlaceholder')}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requesterEmail">{t('form.email')} *</Label>
                  <Input
                    id="requesterEmail"
                    type="email"
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    placeholder={t('form.emailPlaceholder')}
                    disabled={isSubmitting}
                    required
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
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {tCommon('jpgOrPngMax')}
                        </p>
                      </div>
                    </button>
                  )}

                  {uploadError && (
                    <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className={`w-full ${
                    hasBrandColor
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
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
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>{t('footer')}</p>
        </div>
      </div>
    </div>
  );
}
