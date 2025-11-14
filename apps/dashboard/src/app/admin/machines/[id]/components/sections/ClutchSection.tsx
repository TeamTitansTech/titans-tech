'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { type ClutchData, ServiceType } from '@/data/types/services.types';
import { ClutchForm } from '../forms/ClutchForm';
import { isDataTouched } from './utils';
import { useSectionState } from '../../hooks/useSectionState';
import { SectionContainer } from '../shared/SectionContainer';

export const defaultClutchData: ClutchData = {
  clutchType: '',
  clutchLocation: '',
  brakeSpringBrake: undefined,
  brakeSpringClutch: undefined,
  brakeSpringStudBolt: '',
  brakeAnchorClearanceFB: undefined,
  brakeAnchorClearanceFTB: undefined,
  brakeAnchorClearanceRTB: undefined,
  brakeStoppingTime: undefined,
  brakeLining: '',
  brakeClearing: undefined,
  brakeClearanceTotal: undefined,
  brakeClearanceRear: undefined,
  flywheelStoppingTime: undefined,
  flywheelBearings: '',
  flywheelBrake: '',
  clutchEngagements: undefined,
  clutchLining: '',
  clutchSeals: '',
  gearBacklashBefore: undefined,
  gearBacklashAfter: undefined,
  crankEndplayBefore: undefined,
  crankEndplayAfter: undefined,
  airRegulatorPSI: undefined,
  airClutchTravel: undefined,
  airLineOilerSetting: '',
  hydClutchClearanceTotal: undefined,
  hydClutchClearanceRear: undefined,
  hydraulicPressurePSI: undefined,
  accumulatorPSI: undefined,
  rotaryUnion: '',
  splinesDriveRingDisc: '',
  adjustingNutLockSecure: '',
  separateBrakeSeals: '',
  flexDisc: '',
};

export const validateClutchData = (_data: ClutchData): string[] => {
  // All fields are optional for this section
  return [];
};

export interface ClutchSectionRef {
  getData: () => ClutchData | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: ClutchData;
  };
}

interface ClutchSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
}

export const ClutchSection = forwardRef<ClutchSectionRef, ClutchSectionProps>(
  ({ isOpen, onOpenChange, onSectionTouched }, ref) => {
    // Use the section state hook
    const {
      data,
      errors,
      updateField: baseUpdateField,
      reset,
    } = useSectionState<ClutchData>(defaultClutchData);

    // Wrapper to call onSectionTouched
    const updateField = (field: keyof ClutchData, value: string | number | undefined) => {
      baseUpdateField(field, value as any);
      onSectionTouched?.();
    };

    const handleBlur = (_field: keyof ClutchData) => {
      // All fields optional
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        return isDataTouched(data, defaultClutchData);
      },

      validateAndGetData: (
        _serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: ClutchData } => {
        const touched = isDataTouched(data, defaultClutchData);

        if (!touched) {
          return { isValid: true, errors: [] };
        }

        const validationErrors = validateClutchData(data);
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

      getData: (): ClutchData | undefined => {
        const touched = isDataTouched(data, defaultClutchData);
        return touched ? data : undefined;
      },

      validate: (_serviceType: ServiceType): string[] => {
        const touched = isDataTouched(data, defaultClutchData);
        if (touched) {
          return validateClutchData(data);
        }
        return [];
      },

      reset,
    }));

    return (
      <SectionContainer title="Clutch" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ClutchForm data={data} updateFn={updateField} errors={errors} handleBlur={handleBlur} />
      </SectionContainer>
    );
  },
);

ClutchSection.displayName = 'ClutchSection';
