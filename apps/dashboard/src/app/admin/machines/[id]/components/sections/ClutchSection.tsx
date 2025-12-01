'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { type ClutchData, ServiceType } from '@/data/types/services.types';
import { ClutchForm } from '../forms/ClutchForm';
import { isDataTouched } from './utils';
import { PartsListSelector } from '@/components/parts/PartsListSelector';
import { CLUTCH_BRAKE_PARTS } from '@/data/parts/clutch-parts';
import { useTranslations } from 'next-intl';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, Package } from 'lucide-react';

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
  machineName?: string;
  machineSerial?: string;
}

export const ClutchSection = forwardRef<ClutchSectionRef, ClutchSectionProps>(
  ({ onSectionTouched, initialData, machineName, machineSerial }, ref) => {
    const t = useTranslations('parts');
    const [partsListOpen, setPartsListOpen] = useState(false);

    // Store initial loaded data for "touched" detection
    const [initialClutchData, setInitialClutchData] = useState<ClutchData>(
      initialData || defaultClutchData,
    );

    const [data, setData] = useState<ClutchData>(initialData || defaultClutchData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [prevInitialData, setPrevInitialData] = useState(initialData);

    // Sync state with initialData prop changes
    // Move render-phase state update to useEffect
    useEffect(() => {
      if (initialData && initialData !== prevInitialData) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPrevInitialData(initialData);
        setData(initialData);
        setInitialClutchData(initialData);
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
      <div className="space-y-6">
        <ClutchForm data={data} updateFn={updateField} errors={errors} handleBlur={handleBlur} />

        {/* Parts Replacement List */}
        <Collapsible open={partsListOpen} onOpenChange={setPartsListOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/20"
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                <span>{t('clutchBrakeParts')}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${partsListOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <PartsListSelector
              parts={CLUTCH_BRAKE_PARTS}
              title={t('clutchBrakeParts')}
              description={t('clutchBrakeDescription')}
              machineName={machineName}
              machineSerial={machineSerial}
              sectionName="Clutch & Brake"
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
);

ClutchSection.displayName = 'ClutchSection';
