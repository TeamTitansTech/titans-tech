'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@/config/uploads';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ImageUploadFieldProps {
  /** Current uploaded image URL */
  imageUrl: string | null;
  /** Callback when image URL changes */
  onImageUrlChange: (url: string | null) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Optional label text (uses translation if not provided) */
  label?: string;
  /** Optional description text (uses translation if not provided) */
  description?: string;
  /** Optional class name for the container */
  className?: string;
  /** Callback when uploading state changes */
  onUploadingChange?: (isUploading: boolean) => void;
}

export function ImageUploadField({
  imageUrl,
  onImageUrlChange,
  disabled = false,
  label,
  description,
  className,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const t = useTranslations('common.imageUpload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return t('onlyJpgPngAllowed');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('fileTooLarge', { size: MAX_FILE_SIZE_MB });
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
    onUploadingChange?.(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('uploadFailed'));
      }

      const data = await response.json();
      onImageUrlChange(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : t('uploadFailed'));
      setImagePreview(null);
      onImageUrlChange(null);
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    onImageUrlChange(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentPreview = imagePreview || imageUrl;

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label>{label || t('label')}</Label>
        {description && <p className="text-xs text-muted-foreground mb-2">{description}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {currentPreview ? (
          <div className="relative">
            <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-border overflow-hidden">
              <Image
                src={currentPreview}
                alt="Preview"
                fill
                className="object-contain"
                unoptimized={currentPreview.startsWith('data:')}
              />
            </div>
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 h-8 w-8"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm">{t('uploading')}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="h-8 w-8" />
            <div className="text-sm text-center px-4">
              <p className="font-medium">{t('clickToUpload')}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{t('jpgOrPngMax')}</p>
            </div>
          </button>
        )}

        {uploadError && <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>}
      </div>
    </div>
  );
}
