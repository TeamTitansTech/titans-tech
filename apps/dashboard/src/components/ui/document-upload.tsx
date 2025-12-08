'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './button';
import { Input } from './input';
import { Typography } from './typography';
import { X, Upload, Loader2, FileText, FileSpreadsheet } from 'lucide-react';
import { uploadDocument } from '@/data/services/upload.api';
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  ALLOWED_DOCUMENT_TYPES,
  type AllowedDocumentType,
} from '@/config/uploads';
import type { Attachment } from '@/data/types/services.types';

export type { Attachment };

interface DocumentUploadProps {
  value: Attachment[];
  onChange: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

export function DocumentUpload({ value, onChange, disabled }: DocumentUploadProps) {
  const t = useTranslations('common.documentUpload');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as AllowedDocumentType)) {
      return t('onlyPdfCsvAllowed');
    }

    if (file.size > MAX_FILE_SIZE) {
      return t('fileTooLarge', { size: MAX_FILE_SIZE_MB });
    }

    return null;
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);

    const newAttachments: Attachment[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        continue;
      }

      try {
        const result = await uploadDocument(file);

        if (result.error || !result.url || !result.originalName) {
          errors.push(`${file.name}: ${result.error || t('uploadFailed')}`);
        } else {
          newAttachments.push({
            name: result.originalName,
            url: result.url,
          });
        }
      } catch {
        errors.push(`${file.name}: ${t('uploadFailed')}`);
      }
    }

    if (newAttachments.length > 0) {
      onChange([...value, ...newAttachments]);
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newAttachments = value.filter((_, i) => i !== index);
    onChange(newAttachments);
    setError(null);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    }
    return <FileText className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-3">
      <Input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv,application/pdf,text/csv"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        multiple
        className="hidden"
      />

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((attachment, index) => (
            <div
              key={`${attachment.url}-${index}`}
              className="flex items-center justify-between gap-3 p-3 border rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(attachment.name)}
                <Typography variant="small" className="truncate">
                  {attachment.name}
                </Typography>
              </div>
              {!disabled && !isUploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={disabled || isUploading}
        className="w-full h-auto py-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-transparent flex flex-col items-center justify-center gap-2 text-muted-foreground"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <Typography variant="small">{t('uploading')}</Typography>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6" />
            <div className="text-center px-4">
              <Typography variant="small">{t('clickToUpload')}</Typography>
              <Typography variant="muted" className="mt-1">
                {t('pdfOrCsvMax')}
              </Typography>
            </div>
          </>
        )}
      </Button>

      {error && (
        <Typography variant="small" className="text-red-600 dark:text-red-400 whitespace-pre-line">
          {error}
        </Typography>
      )}
    </div>
  );
}
