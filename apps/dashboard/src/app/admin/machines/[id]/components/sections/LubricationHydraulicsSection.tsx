'use client';

import { forwardRef, useImperativeHandle } from 'react';
import {
  type LubricationHydraulicsData,
  type LubricationHydraulicsGauge,
  ServiceType,
  YesNoDncType,
} from '@/data/types/services.types';
import { LubricationHydraulicsForm } from '../forms/LubricationHydraulicsForm';
import { isDataTouched } from './utils';
import { useSectionState } from '../../hooks/useSectionState';

export const defaultLubricationHydraulicsData: LubricationHydraulicsData = {
  gauges: [] as LubricationHydraulicsGauge[],
  changedOil: YesNoDncType.DNC,
  oilTemperatureF: undefined,
  oilMfgType: '',
  changedFilter: YesNoDncType.DNC,
  notes: '',
};

export const validateLubricationHydraulicsData = (_data: LubricationHydraulicsData): string[] => {
  // All fields are optional for this section
  return [];
};

export interface LubricationHydraulicsSectionRef {
  getData: () => LubricationHydraulicsData | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: LubricationHydraulicsData;
  };
}

interface LubricationHydraulicsSectionProps {
  onSectionTouched?: () => void;
  initialData?: LubricationHydraulicsData;
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
  } = useSectionState<LubricationHydraulicsData>(initialData || defaultLubricationHydraulicsData);

  // Wrapper to call onSectionTouched
  const updateField = (
    field: keyof LubricationHydraulicsData,
    value: string | number | boolean | YesNoDncType | LubricationHydraulicsGauge[] | undefined,
  ) => {
    baseUpdateField(field, value as any);
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
    ): { isValid: boolean; errors: string[]; data?: LubricationHydraulicsData } => {
      const touched = isDataTouched(data, initialSectionData);
      const hasData =
        touched || isDataTouched(initialSectionData, defaultLubricationHydraulicsData);

      // If no data at all (initial or touched), validation passes with no data
      if (!hasData) {
        return { isValid: true, errors: [] };
      }

      const validationErrors = touched ? validateLubricationHydraulicsData(data) : [];
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

    getData: (): LubricationHydraulicsData | undefined => {
      const touched = isDataTouched(data, initialSectionData);
      const hasData =
        touched || isDataTouched(initialSectionData, defaultLubricationHydraulicsData);
      return hasData ? (touched ? data : initialSectionData) : undefined;
    },

    validate: (_serviceType: ServiceType): string[] => {
      const touched = isDataTouched(data, initialSectionData);
      if (touched) {
        return validateLubricationHydraulicsData(data);
      }
      return [];
    },

    reset,
  }));

  return (
    <div className="p-6 space-y-6">
      <LubricationHydraulicsForm
        data={data}
        updateFn={updateField}
        errors={errors}
        handleBlur={handleBlur}
      />
    </div>
  );
});

LubricationHydraulicsSection.displayName = 'LubricationHydraulicsSection';
