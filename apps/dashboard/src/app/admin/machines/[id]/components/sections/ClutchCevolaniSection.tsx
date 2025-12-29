'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { type Attachment, ServiceType, type ClutchData } from '@/data/types/services.types';
import { ClutchCevolaniForm } from '../forms/ClutchCevolaniForm';
import { isDataTouched } from './utils';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

export const defaultClutchCevolaniData: ClutchData = {};

// Helper to check if a value is filled (not undefined/null/NaN, but 0 is valid)
const isValueFilled = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'number' && isNaN(value)) return false;
  return true;
};

export const validateClutchCevolaniData = (
  data: ClutchData,
  _serviceType: ServiceType,
): string[] => {
  const errors: string[] = [];

  // Required field: pneumatic clutch clearance total
  if (!isValueFilled(data.pneumaticClutchClearanceTotal)) {
    errors.push('Clutch Cevolani: Pneumatic Clutch Clearance Total is required');
  }

  return errors;
};

export interface ClutchCevolaniSectionData {
  data?: ClutchData;
  attachments?: Attachment[];
}

export interface ClutchCevolaniSectionRef {
  getData: () => ClutchCevolaniSectionData | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: ClutchCevolaniSectionData;
  };
}

interface ClutchCevolaniSectionProps {
  onSectionTouched?: () => void;
  initialData?: ClutchCevolaniSectionData;
}

export const ClutchCevolaniSection = forwardRef<
  ClutchCevolaniSectionRef,
  ClutchCevolaniSectionProps
>(({ onSectionTouched, initialData }, ref) => {
  const t = useTranslations('inspections');

  // Store initial loaded data for "touched" detection
  const [initialClutchCevolaniData, setInitialClutchCevolaniData] = useState<ClutchData>(
    initialData?.data || defaultClutchCevolaniData,
  );

  const [data, setData] = useState<ClutchData>(initialData?.data || defaultClutchCevolaniData);
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  // Sync state with initialData prop changes
  useEffect(() => {
    if (initialData && initialData !== prevInitialData) {
      setPrevInitialData(initialData);
      setData(initialData.data || defaultClutchCevolaniData);
      setInitialClutchCevolaniData(initialData.data || defaultClutchCevolaniData);
      setAttachments(initialData.attachments ?? []);
    }
  }, [initialData, prevInitialData]);

  // Validate with translations
  const validateWithTranslations = (clutchCevolaniData: ClutchData): string[] => {
    const validationErrors: string[] = [];
    if (!isValueFilled(clutchCevolaniData.pneumaticClutchClearanceTotal)) {
      validationErrors.push(
        t('form.clutchCevolani.validation.pneumaticClutchClearanceTotalRequired'),
      );
    }
    return validationErrors;
  };

  const updateField = (field: keyof ClutchData, value: string | number | undefined) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched?.();
  };

  const handleBlur = (_field: keyof ClutchData) => {
    // All fields optional except pneumaticClutchClearanceTotal
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      return isDataTouched(data, initialClutchCevolaniData);
    },

    validateAndGetData: (
      _serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: ClutchCevolaniSectionData } => {
      const touched = isDataTouched(data, initialClutchCevolaniData);
      const hasInitialData = isDataTouched(initialClutchCevolaniData, defaultClutchCevolaniData);

      // Always validate required fields regardless of touch state
      const dataToValidate = touched ? data : initialClutchCevolaniData;
      const validationErrors = validateWithTranslations(dataToValidate);
      const isValid = validationErrors.length === 0;

      if (isValid) {
        // Only return data if section was touched or has initial data
        const hasData = touched || hasInitialData;
        return {
          isValid: true,
          errors: [],
          data: hasData
            ? {
                data: touched ? data : initialClutchCevolaniData,
                attachments,
              }
            : undefined,
        };
      }

      return {
        isValid: false,
        errors: validationErrors,
      };
    },

    getData: (): ClutchCevolaniSectionData | undefined => {
      const touched = isDataTouched(data, initialClutchCevolaniData);
      const hasData =
        touched || isDataTouched(initialClutchCevolaniData, defaultClutchCevolaniData);
      return hasData
        ? {
            data: touched ? data : initialClutchCevolaniData,
            attachments,
          }
        : undefined;
    },

    validate: (_serviceType: ServiceType): string[] => {
      // Always validate required fields regardless of touch state
      const touched = isDataTouched(data, initialClutchCevolaniData);
      const dataToValidate = touched ? data : initialClutchCevolaniData;
      return validateWithTranslations(dataToValidate);
    },

    reset: () => {
      setData(defaultClutchCevolaniData);
      setErrors({});
    },
  }));

  return (
    <div className="space-y-6">
      <ClutchCevolaniForm
        data={data}
        updateFn={updateField}
        errors={errors}
        handleBlur={handleBlur}
      />

      {/* Section Attachments */}
      <div className="pt-4 border-t">
        <Typography variant="h4" className="mb-3">
          {t('form.common.attachments')}
        </Typography>
        <DocumentUpload
          value={attachments}
          onChange={(files) => {
            setAttachments(files);
            onSectionTouched?.();
          }}
          maxFiles={10}
        />
      </div>
    </div>
  );
});

ClutchCevolaniSection.displayName = 'ClutchCevolaniSection';
