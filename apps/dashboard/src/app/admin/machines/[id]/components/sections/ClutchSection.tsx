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

  if (serviceType === ServiceType.MAINTENANCE) {
    // Only clutch type is required
    if (!data.clutchType) {
      errors.push('Clutch Type is required for maintenance and rebuild services');
    }

    const brakeSpringFields = [
      data.brakeSpringBrake,
      data.brakeSpringClutch,
      data.brakeSpringFB,
      data.brakeSpringFTB,
      data.brakeSpringRTB,
    ];
    const hasAnyBrakeSpring = brakeSpringFields.some(
      (field) => field !== undefined && field !== null,
    );

    if (hasAnyBrakeSpring) {
      if (
        data.brakeSpringBrake === undefined ||
        data.brakeSpringBrake === null ||
        isNaN(Number(data.brakeSpringBrake))
      ) {
        errors.push('Brake Spring - Brake measurement is required when measuring springs');
      }
      if (
        data.brakeSpringClutch === undefined ||
        data.brakeSpringClutch === null ||
        isNaN(Number(data.brakeSpringClutch))
      ) {
        errors.push('Brake Spring - Clutch measurement is required when measuring springs');
      }
      if (!data.brakeSpringStudBolt) {
        errors.push('Brake Spring - Stud/Bolt condition is required when measuring springs');
      }
    }

    // If gear backlash is measured, require both before and after
    if (
      data.gearBacklashBefore !== undefined &&
      data.gearBacklashBefore !== null &&
      (data.gearBacklashAfter === undefined || data.gearBacklashAfter === null)
    ) {
      errors.push('Gear Backlash - After measurement is required when Before is provided');
    }
    if (
      data.gearBacklashAfter !== undefined &&
      data.gearBacklashAfter !== null &&
      (data.gearBacklashBefore === undefined || data.gearBacklashBefore === null)
    ) {
      errors.push('Gear Backlash - Before measurement is required when After is provided');
    }

    // If crank endplay is measured, require both before and after
    if (
      data.crankEndplayBefore !== undefined &&
      data.crankEndplayBefore !== null &&
      (data.crankEndplayAfter === undefined || data.crankEndplayAfter === null)
    ) {
      errors.push('Crank Endplay - After measurement is required when Before is provided');
    }
    if (
      data.crankEndplayAfter !== undefined &&
      data.crankEndplayAfter !== null &&
      (data.crankEndplayBefore === undefined || data.crankEndplayBefore === null)
    ) {
      errors.push('Crank Endplay - Before measurement is required when After is provided');
    }

    // If air regulator value is provided, require unit
    if (
      data.airRegulatorValue !== undefined &&
      data.airRegulatorValue !== null &&
      !data.airRegulatorUnit
    ) {
      errors.push('Air Regulator - Unit is required when value is provided');
    }

    // If hydraulic pressure value is provided, require unit
    if (
      data.hydraulicPressureValue !== undefined &&
      data.hydraulicPressureValue !== null &&
      !data.hydraulicPressureUnit
    ) {
      errors.push('Hydraulic Pressure - Unit is required when value is provided');
    }

    // If accumulator value is provided, require unit
    if (
      data.accumulatorValue !== undefined &&
      data.accumulatorValue !== null &&
      !data.accumulatorUnit
    ) {
      errors.push('Accumulator - Unit is required when value is provided');
    }
  }

  // Validate numeric ranges
  if (data.brakeSpringBrake !== undefined && data.brakeSpringBrake !== null) {
    if (Number(data.brakeSpringBrake) < 0) {
      errors.push('Brake Spring - Brake measurement cannot be negative');
    }
  }

  if (data.brakeStoppingTime !== undefined && data.brakeStoppingTime !== null) {
    if (Number(data.brakeStoppingTime) < 0) {
      errors.push('Brake Stopping Time cannot be negative');
    }
  }

  if (data.flywheelStoppingTime !== undefined && data.flywheelStoppingTime !== null) {
    if (Number(data.flywheelStoppingTime) < 0) {
      errors.push('Flywheel Stopping Time cannot be negative');
    }
  }

  if (data.clutchEngagements !== undefined && data.clutchEngagements !== null) {
    if (Number(data.clutchEngagements) < 0) {
      errors.push('Clutch Engagements cannot be negative');
    }
  }

  if (data.airRegulatorValue !== undefined && data.airRegulatorValue !== null) {
    if (Number(data.airRegulatorValue) < 0) {
      errors.push('Air Regulator value cannot be negative');
    }
  }

  if (data.hydraulicPressureValue !== undefined && data.hydraulicPressureValue !== null) {
    if (Number(data.hydraulicPressureValue) < 0) {
      errors.push('Hydraulic Pressure value cannot be negative');
    }
  }

  if (data.accumulatorValue !== undefined && data.accumulatorValue !== null) {
    if (Number(data.accumulatorValue) < 0) {
      errors.push('Accumulator value cannot be negative');
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
}

export const ClutchSection = forwardRef<ClutchSectionRef, ClutchSectionProps>(
  ({ onSectionTouched }, ref) => {
    const [data, setData] = useState<ClutchData>(defaultClutchData);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        return isDataTouched(data, defaultClutchData);
      },

      validateAndGetData: (
        serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: ClutchData } => {
        const touched = isDataTouched(data, defaultClutchData);

        if (!touched) {
          return { isValid: true, errors: [] };
        }

        const validationErrors = validateClutchData(data, serviceType);
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

      validate: (serviceType: ServiceType): string[] => {
        const touched = isDataTouched(data, defaultClutchData);
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
      <div className="border rounded-lg p-6 bg-card">
        <h3 className="text-base font-semibold mb-4">Clutch</h3>
        <ClutchForm data={data} updateFn={updateField} errors={errors} handleBlur={handleBlur} />
      </div>
    );
  },
);

ClutchSection.displayName = 'ClutchSection';
