'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './button';
import { X, Upload, Loader2 } from 'lucide-react';
import { uploadImage } from '@/data/services/upload.api';
import Image from 'next/image';
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@/config/uploads';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const t = useTranslations('common.imageUpload');
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const result = await uploadImage(file);

      if (result.error) {
        setError(result.error);
        setPreview(value || null);
        onChange(value || null);
      } else {
        onChange(result.url);
      }
    } catch {
      setError(t('uploadFailed'));
      setPreview(value || null);
      onChange(value || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg border-2 border-dashed border-border overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized={preview.startsWith('data:')}
            />
          </div>

          {!disabled && !isUploading && (
            <div className="absolute top-2 right-2 space-x-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="w-full h-48 rounded-lg border-2 border-dashed border-border hover:border-muted-foreground transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-8 w-8" />
          <div className="text-sm text-center px-4">
            <p className="font-medium">{t('clickToUpload')}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{t('jpgOrPngMax')}</p>
          </div>
        </button>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
