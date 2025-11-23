'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { type ClutchData, ServiceType } from '@/data/types/services.types';
import { ClutchForm } from '../forms/ClutchForm';
import { isDataTouched } from './utils';

export const defaultClutchData: ClutchData = {
  clutchType: undefined,
  clutchLocation: undefined,
  brakeSpringBrake: undefined,
  brakeSpringClutch: undefined,
  brakeSpringFB: undefined,
  brakeSpringFTB: undefined,
  brakeSpringRTB: undefined,
  brakeSpringStudBolt: undefined,
  brakeStoppingTime: undefined,
  brakeLining: undefined,
  brakeClearing: undefined,
  brakeClearanceTotal: undefined,
  brakeClearanceRear: undefined,
  flywheelStoppingTime: undefined,
  flywheelBearings: undefined,
  flywheelBrake: undefined,
  rotaryUnion: undefined,
  clutchEngagements: undefined,
  clutchLining: undefined,
  clutchSeals: undefined,
  gearBacklashBefore: undefined,
  gearBacklashAfter: undefined,
  crankEndplayBefore: undefined,
  crankEndplayAfter: undefined,
  airRegulatorValue: undefined,
  airRegulatorUnit: undefined,
  airClutchTravel: undefined,
  airLineOilerSetting: undefined,
  splinesDriveRingDisc: undefined,
  adjustingNutLockSecure: undefined,
  hydClutchClearanceTotal: undefined,
  hydClutchClearanceRear: undefined,
  hydraulicPressureValue: undefined,
  hydraulicPressureUnit: undefined,
  accumulatorValue: undefined,
  accumulatorUnit: undefined,
  separateBrakeSeals: undefined,
  flexDisc: undefined,
  notes: undefined,
};

export const validateClutchData = (data: ClutchData, serviceType: ServiceType): string[] => {
  const errors: string[] = [];

  // Only clutch type is required for maintenance services
  if (serviceType === ServiceType.MAINTENANCE) {
    if (!data.clutchType) {
      errors.push('Clutch Type is required for maintenance and rebuild services');
    }
  }

  return errors;
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
  onSectionTouched?: () => void;
  initialData?: ClutchData;
}

export const ClutchSection = forwardRef<ClutchSectionRef, ClutchSectionProps>(
  ({ onSectionTouched, initialData }, ref) => {
    // Store initial loaded data for "touched" detection
    const [initialClutchData, setInitialClutchData] = useState<ClutchData>(
      initialData || defaultClutchData,
    );

    const [data, setData] = useState<ClutchData>(initialData || defaultClutchData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [prevInitialData, setPrevInitialData] = useState(initialData);

    if (initialData !== prevInitialData && initialData) {
      setPrevInitialData(initialData);
      setData(initialData);
      setInitialClutchData(initialData);
    }

    const updateField = (field: keyof ClutchData, value: string | number | undefined) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: '' }));
      onSectionTouched?.();
    };

    const handleBlur = (_field: keyof ClutchData) => {
      // All fields optional
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        return isDataTouched(data, initialClutchData);
      },

      validateAndGetData: (
        serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: ClutchData } => {
        const touched = isDataTouched(data, initialClutchData);
        const hasData = touched || isDataTouched(initialClutchData, defaultClutchData);

        // If no data at all (initial or touched), validation passes with no data
        if (!hasData) {
          return { isValid: true, errors: [] };
        }

        const validationErrors = touched ? validateClutchData(data, serviceType) : [];
        const isValid = validationErrors.length === 0;

        if (isValid) {
          return {
            isValid: true,
            errors: [],
            data: touched ? data : initialClutchData,
          };
        }

        return {
          isValid: false,
          errors: validationErrors,
        };
      },

      getData: (): ClutchData | undefined => {
        const touched = isDataTouched(data, initialClutchData);
        const hasData = touched || isDataTouched(initialClutchData, defaultClutchData);
        return hasData ? (touched ? data : initialClutchData) : undefined;
      },

      validate: (serviceType: ServiceType): string[] => {
        const touched = isDataTouched(data, initialClutchData);
        if (touched) {
          return validateClutchData(data, serviceType);
        }
        return [];
      },

      reset: () => {
        setData(defaultClutchData);
        setErrors({});
      },
    }));

    return (
      <div className="p-6 space-y-6">
        <ClutchForm data={data} updateFn={updateField} errors={errors} handleBlur={handleBlur} />
      </div>
    );
  },
);

ClutchSection.displayName = 'ClutchSection';
