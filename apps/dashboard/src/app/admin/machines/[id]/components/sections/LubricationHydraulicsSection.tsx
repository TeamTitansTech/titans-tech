'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import {
  type LubricationHydraulicsData,
  type LubricationHydraulicsGauge,
  ServiceType,
  YesNoDncType,
} from '@/data/types/services.types';
import { LubricationHydraulicsForm } from '../forms/LubricationHydraulicsForm';
import { isDataTouched } from './utils';

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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
}

export const LubricationHydraulicsSection = forwardRef<
  LubricationHydraulicsSectionRef,
  LubricationHydraulicsSectionProps
>(({ isOpen, onOpenChange, onSectionTouched }, ref) => {
  const [data, setData] = useState<LubricationHydraulicsData>(defaultLubricationHydraulicsData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (
    field: keyof LubricationHydraulicsData,
    value: string | number | boolean | YesNoDncType | LubricationHydraulicsGauge[] | undefined,
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched?.();
  };

  const handleBlur = (_field: keyof LubricationHydraulicsData) => {
    // All fields optional
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      return isDataTouched(data, defaultLubricationHydraulicsData);
    },

    validateAndGetData: (
      _serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: LubricationHydraulicsData } => {
      const touched = isDataTouched(data, defaultLubricationHydraulicsData);

      if (!touched) {
        return { isValid: true, errors: [] };
      }

      const validationErrors = validateLubricationHydraulicsData(data);
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

    getData: (): LubricationHydraulicsData | undefined => {
      const touched = isDataTouched(data, defaultLubricationHydraulicsData);
      return touched ? data : undefined;
    },

    validate: (_serviceType: ServiceType): string[] => {
      const touched = isDataTouched(data, defaultLubricationHydraulicsData);
      if (touched) {
        return validateLubricationHydraulicsData(data);
      }
      return [];
    },

    reset: () => {
      setData(defaultLubricationHydraulicsData);
      setErrors({});
    },
  }));

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
          <h3 className="text-base font-semibold">
            Lubrication / Hydraulics / Pressure Switches / Oil & Filter
          </h3>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg p-6 bg-white">
          <LubricationHydraulicsForm
            data={data}
            updateFn={updateField}
            errors={errors}
            handleBlur={handleBlur}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

LubricationHydraulicsSection.displayName = 'LubricationHydraulicsSection';
