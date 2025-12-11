'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import {
  type LubricationHydraulicsData,
  type LubricationHydraulicsCheck,
  type LubricationHydraulicsGauge,
  ServiceType,
  YesNoDncType,
  TemperatureUnit,
} from '@/data/types/services.types';
import { LubricationHydraulicsForm } from '../forms/LubricationHydraulicsForm';
import { isDataTouched } from './utils';
import { useSectionState } from '../../hooks/useSectionState';

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

  // changedOil is required and must be YES or NO (not DNC)
  if (!data.data.changedOil || data.data.changedOil === YesNoDncType.DNC) {
    errors.push('Lubrication: Oil changed status is required (YES or NO)');
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

  // Validate with translations
  const validateWithTranslations = (checkData: LubricationHydraulicsCheck): string[] => {
    const validationErrors: string[] = [];
    if (!checkData.data.changedOil || checkData.data.changedOil === YesNoDncType.DNC) {
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
          data: hasData ? dataToValidate : undefined,
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
      return hasData ? (touched ? data : initialSectionData) : undefined;
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
    <LubricationHydraulicsForm
      data={{ ...data.data, notes: data.notes }}
      updateFn={updateField}
      errors={errors}
      handleBlur={handleBlur}
    />
  );
});

LubricationHydraulicsSection.displayName = 'LubricationHydraulicsSection';
