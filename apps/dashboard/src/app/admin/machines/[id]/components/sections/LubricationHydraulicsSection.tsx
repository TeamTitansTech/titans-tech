'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  type LubricationHydraulicsData,
  type LubricationHydraulicsCheck,
  type LubricationHydraulicsGauge,
  type Attachment,
  ServiceType,
  YesNoDncType,
  TemperatureUnit,
} from '@/data/types/services.types';
import { LubricationHydraulicsForm } from '../forms/LubricationHydraulicsForm';
import { isDataTouched } from './utils';
import { useSectionState } from '../../hooks/useSectionState';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

export const defaultLubricationHydraulicsCheck: LubricationHydraulicsCheck = {
  data: {
    gauges: [] as LubricationHydraulicsGauge[],
    changedOil: YesNoDncType.DNC,
    oilTemperature: undefined,
    oilTemperatureUnit: TemperatureUnit.FAHRENHEIT,
    oilMfgType: '',
    changedFilter: YesNoDncType.DNC,
  },
  notes: '',
};

export const validateLubricationHydraulicsCheck = (data: LubricationHydraulicsCheck): string[] => {
  const errors: string[] = [];

  // changedOil is required - YES, NO, or DNC are all valid
  if (!data.data.changedOil) {
    errors.push('Lubrication: Oil changed status is required');
  }

  return errors;
};

export interface LubricationHydraulicsSectionRef {
  getData: () => LubricationHydraulicsCheck | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: LubricationHydraulicsCheck;
  };
}

interface LubricationHydraulicsSectionProps {
  onSectionTouched?: () => void;
  initialData?: LubricationHydraulicsCheck;
}

export const LubricationHydraulicsSection = forwardRef<
  LubricationHydraulicsSectionRef,
  LubricationHydraulicsSectionProps
>(({ onSectionTouched, initialData }, ref) => {
  const t = useTranslations('inspections');

  // Use the section state hook
  const {
    initialSectionData,
    data,
    errors,
    updateField: baseUpdateField,
    reset,
  } = useSectionState<LubricationHydraulicsCheck>(initialData || defaultLubricationHydraulicsCheck);

  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);

  // Validate with translations
  const validateWithTranslations = (checkData: LubricationHydraulicsCheck): string[] => {
    const validationErrors: string[] = [];
    // changedOil is required - YES, NO, or DNC are all valid
    if (!checkData.data.changedOil) {
      validationErrors.push(t('form.lubricationHydraulics.validation.changedOilRequired'));
    }
    return validationErrors;
  };

  // Wrapper to call onSectionTouched
  // Note: This wrapper accepts a union type and casts to the base hook's generic type.
  // This is safe because the hook is typed with LubricationHydraulicsCheck, ensuring type safety at compile time.
  const updateField = (
    field: keyof LubricationHydraulicsData | 'notes',
    value:
      | string
      | number
      | boolean
      | YesNoDncType
      | LubricationHydraulicsGauge[]
      | TemperatureUnit
      | undefined,
  ) => {
    if (field === 'notes') {
      baseUpdateField('notes', value as string);
    } else {
      // Update nested data field
      const currentData = data.data;
      const updatedData = { ...currentData, [field]: value };
      baseUpdateField('data', updatedData);
    }
    onSectionTouched?.();
  };

  const handleBlur = (_field: keyof LubricationHydraulicsData) => {
    // All fields optional
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      return isDataTouched(data, initialSectionData);
    },

    validateAndGetData: (
      _serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: LubricationHydraulicsCheck } => {
      const touched = isDataTouched(data, initialSectionData);
      const hasInitialData = isDataTouched(initialSectionData, defaultLubricationHydraulicsCheck);

      // Always validate changedOil - it's required regardless of touch state
      const dataToValidate = touched ? data : initialSectionData;
      const validationErrors = validateWithTranslations(dataToValidate);
      const isValid = validationErrors.length === 0;

      if (isValid) {
        // Only return data if section was touched or has initial data
        const hasData = touched || hasInitialData;
        return {
          isValid: true,
          errors: [],
          data: hasData
            ? ({
                ...(touched ? data : initialSectionData),
                attachments,
              } as LubricationHydraulicsCheck)
            : undefined,
        };
      }

      return {
        isValid: false,
        errors: validationErrors,
      };
    },

    getData: (): LubricationHydraulicsCheck | undefined => {
      const touched = isDataTouched(data, initialSectionData);
      const hasData =
        touched || isDataTouched(initialSectionData, defaultLubricationHydraulicsCheck);
      return hasData
        ? ({
            ...(touched ? data : initialSectionData),
            attachments,
          } as LubricationHydraulicsCheck)
        : undefined;
    },

    validate: (_serviceType: ServiceType): string[] => {
      // Always validate changedOil - it's required regardless of touch state
      const touched = isDataTouched(data, initialSectionData);
      const dataToValidate = touched ? data : initialSectionData;
      return validateWithTranslations(dataToValidate);
    },

    reset,
  }));

  return (
    <div className="space-y-6">
      <LubricationHydraulicsForm
        data={{ ...data.data, notes: data.notes }}
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

LubricationHydraulicsSection.displayName = 'LubricationHydraulicsSection';
