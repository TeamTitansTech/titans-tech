'use client';

import { forwardRef, useImperativeHandle } from 'react';
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

export const validateLubricationHydraulicsCheck = (_data: LubricationHydraulicsCheck): string[] => {
  // All fields are optional for this section
  return [];
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
  // Use the section state hook
  const {
    initialSectionData,
    data,
    errors,
    updateField: baseUpdateField,
    reset,
  } = useSectionState<LubricationHydraulicsCheck>(initialData || defaultLubricationHydraulicsCheck);

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
      const hasData =
        touched || isDataTouched(initialSectionData, defaultLubricationHydraulicsCheck);

      // If no data at all (initial or touched), validation passes with no data
      if (!hasData) {
        return { isValid: true, errors: [] };
      }

      const validationErrors = touched ? validateLubricationHydraulicsCheck(data) : [];
      const isValid = validationErrors.length === 0;

      if (isValid) {
        return {
          isValid: true,
          errors: [],
          data: touched ? data : initialSectionData,
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
      const touched = isDataTouched(data, initialSectionData);
      if (touched) {
        return validateLubricationHydraulicsCheck(data);
      }
      return [];
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
