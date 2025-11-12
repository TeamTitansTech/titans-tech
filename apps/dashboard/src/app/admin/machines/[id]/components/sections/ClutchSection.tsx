'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { type ClutchData, ServiceType } from '@/data/types/services.types';
import { ClutchForm } from '../forms/ClutchForm';
import { isDataTouched } from './utils';

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

      reset: () => {
        setData(defaultClutchData);
        setErrors({});
      },
    }));

    return (
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="w-full">
          <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
            <h3 className="text-base font-semibold">Clutch</h3>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border border-t-0 rounded-b-lg p-6 bg-white">
            <ClutchForm
              data={data}
              updateFn={updateField}
              errors={errors}
              handleBlur={handleBlur}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
);

ClutchSection.displayName = 'ClutchSection';
