'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { type ClutchData, type Attachment, ServiceType } from '@/data/types/services.types';
import { ClutchForm } from '../forms/ClutchForm';
import { isDataTouched } from './utils';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

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
  airClutchTravel: undefined,
  airLineOilerSetting: undefined,
  splinesDriveRingDisc: undefined,
  adjustingNutLockSecure: undefined,
  hydClutchClearanceTotal: undefined,
  hydClutchClearanceRear: undefined,
  hydraulicPressureValue: undefined,
  accumulatorValue: undefined,
  separateBrakeSeals: undefined,
  flexDisc: undefined,
  notes: undefined,
};

// Helper to check if a value is filled (not undefined/null/NaN, but 0 is valid)
const isValueFilled = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'number' && isNaN(value)) return false;
  return true;
};

export const validateClutchData = (data: ClutchData, _serviceType: ServiceType): string[] => {
  const errors: string[] = [];

  // Required fields: hydraulic clutch clearance total and rear
  if (!isValueFilled(data.hydClutchClearanceTotal)) {
    errors.push('Clutch: Hydraulic Clutch Clearance Total is required');
  }
  if (!isValueFilled(data.hydClutchClearanceRear)) {
    errors.push('Clutch: Hydraulic Clutch Clearance Rear is required');
  }

  return errors;
};

export interface ClutchSectionData {
  data?: ClutchData;
  attachments?: Attachment[];
}

export interface ClutchSectionRef {
  getData: () => ClutchSectionData | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: ClutchSectionData;
  };
}

interface ClutchSectionProps {
  onSectionTouched?: () => void;
  initialData?: ClutchSectionData;
}

export const ClutchSection = forwardRef<ClutchSectionRef, ClutchSectionProps>(
  ({ onSectionTouched, initialData }, ref) => {
    const t = useTranslations('inspections');

    // Store initial loaded data for "touched" detection
    const [initialClutchData, setInitialClutchData] = useState<ClutchData>(
      initialData?.data || defaultClutchData,
    );

    const [data, setData] = useState<ClutchData>(initialData?.data || defaultClutchData);
    const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [prevInitialData, setPrevInitialData] = useState(initialData);

    // Sync state with initialData prop changes
    // Move render-phase state update to useEffect
    useEffect(() => {
      if (initialData && initialData !== prevInitialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPrevInitialData(initialData);
        setData(initialData.data || defaultClutchData);
        setInitialClutchData(initialData.data || defaultClutchData);
        setAttachments(initialData.attachments ?? []);
      }
    }, [initialData, prevInitialData]);

    // Validate with translations
    const validateWithTranslations = (clutchData: ClutchData): string[] => {
      const validationErrors: string[] = [];
      if (!isValueFilled(clutchData.hydClutchClearanceTotal)) {
        validationErrors.push(t('form.clutch.validation.hydClutchClearanceTotalRequired'));
      }
      if (!isValueFilled(clutchData.hydClutchClearanceRear)) {
        validationErrors.push(t('form.clutch.validation.hydClutchClearanceRearRequired'));
      }
      return validationErrors;
    };

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
        _serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: ClutchSectionData } => {
        const touched = isDataTouched(data, initialClutchData);
        const hasInitialData = isDataTouched(initialClutchData, defaultClutchData);

        // Always validate required fields regardless of touch state
        const dataToValidate = touched ? data : initialClutchData;
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
                  data: touched ? data : initialClutchData,
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

      getData: (): ClutchSectionData | undefined => {
        const touched = isDataTouched(data, initialClutchData);
        const hasData = touched || isDataTouched(initialClutchData, defaultClutchData);
        return hasData
          ? {
              data: touched ? data : initialClutchData,
              attachments,
            }
          : undefined;
      },

      validate: (_serviceType: ServiceType): string[] => {
        // Always validate required fields regardless of touch state
        const touched = isDataTouched(data, initialClutchData);
        const dataToValidate = touched ? data : initialClutchData;
        return validateWithTranslations(dataToValidate);
      },

      reset: () => {
        setData(defaultClutchData);
        setErrors({});
      },
    }));

    return (
      <div className="space-y-6">
        <ClutchForm data={data} updateFn={updateField} errors={errors} handleBlur={handleBlur} />

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
  },
);

ClutchSection.displayName = 'ClutchSection';
