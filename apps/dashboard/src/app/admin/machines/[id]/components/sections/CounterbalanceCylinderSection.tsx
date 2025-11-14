'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { type CounterbalanceCylinderData, ServiceType } from '@/data/types/services.types';
import { CounterbalanceCylinderForm } from '../forms/CounterbalanceCylinderForm';
import { isDataTouched } from './utils';
import { useSectionState } from '../../hooks/useSectionState';
import { SectionContainer } from '../shared/SectionContainer';

export const defaultCounterbalanceCylinderData: CounterbalanceCylinderData = {
  counterbalanceType: '',
  airbagPistonSeals: '',
  airbagPistonSealsLeakLocation: '',
  regulator: '',
  gaugePSI: undefined,
  pneumaticsPlumbing: '',
  rodSeals: '',
  rodBushing: '',
  oilWick: '',
};

export const validateCounterbalanceCylinderData = (_data: CounterbalanceCylinderData): string[] => {
  // All fields are optional for this section
  return [];
};

export interface CounterbalanceCylinderSectionRef {
  getData: () => CounterbalanceCylinderData | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: CounterbalanceCylinderData;
  };
}

interface CounterbalanceCylinderSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
}

export const CounterbalanceCylinderSection = forwardRef<
  CounterbalanceCylinderSectionRef,
  CounterbalanceCylinderSectionProps
>(({ isOpen, onOpenChange, onSectionTouched }, ref) => {
  // Use the section state hook
  const {
    data,
    errors,
    updateField: baseUpdateField,
    reset,
  } = useSectionState<CounterbalanceCylinderData>(defaultCounterbalanceCylinderData);

  // Wrapper to call onSectionTouched
  const updateField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
  ) => {
    baseUpdateField(field, value as any);
    onSectionTouched?.();
  };

  const handleBlur = (_field: keyof CounterbalanceCylinderData) => {
    // All fields optional
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      return isDataTouched(data, defaultCounterbalanceCylinderData);
    },

    validateAndGetData: (
      _serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: CounterbalanceCylinderData } => {
      const touched = isDataTouched(data, defaultCounterbalanceCylinderData);

      if (!touched) {
        return { isValid: true, errors: [] };
      }

      const validationErrors = validateCounterbalanceCylinderData(data);
      const isValid = validationErrors.length === 0;

      if (isValid) {
        return {
          isValid: true,
          errors: [],
          data,
        };
      }

      return {
        isValid: false,
        errors: validationErrors,
      };
    },

    getData: (): CounterbalanceCylinderData | undefined => {
      const touched = isDataTouched(data, defaultCounterbalanceCylinderData);
      return touched ? data : undefined;
    },

    validate: (_serviceType: ServiceType): string[] => {
      const touched = isDataTouched(data, defaultCounterbalanceCylinderData);
      if (touched) {
        return validateCounterbalanceCylinderData(data);
      }
      return [];
    },

    reset,
  }));

  return (
    <SectionContainer
      title="Counterbalance Cylinder / Airbag"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <CounterbalanceCylinderForm
        data={data}
        updateFn={updateField}
        errors={errors}
        handleBlur={handleBlur}
        title=""
      />
    </SectionContainer>
  );
});

CounterbalanceCylinderSection.displayName = 'CounterbalanceCylinderSection';
