'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { type ClutchData, type Attachment, ServiceType } from '@/data/types/services.types';
import { ClutchForm } from '../forms/ClutchForm';
import { isDataTouched } from './utils';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';
import { useTranslations } from 'next-intl';

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
      ): { isValid: boolean; errors: string[]; data?: ClutchSectionData } => {
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
            data: {
              data: touched ? data : initialClutchData,
              attachments,
            },
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
