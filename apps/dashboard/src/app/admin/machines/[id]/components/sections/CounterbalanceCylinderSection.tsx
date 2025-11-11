'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { type CounterbalanceCylinderData, ServiceType } from '@/data/types/services.types';
import { CounterbalanceCylinderForm } from '../forms/CounterbalanceCylinderForm';
import { isDataTouched } from './utils';

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
}

interface CounterbalanceCylinderSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched: () => void;
}

export const CounterbalanceCylinderSection = forwardRef<
  CounterbalanceCylinderSectionRef,
  CounterbalanceCylinderSectionProps
>(({ isOpen, onOpenChange, onSectionTouched }, ref) => {
  const [data, setData] = useState<CounterbalanceCylinderData>(defaultCounterbalanceCylinderData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched();
  };

  const handleBlur = (_field: keyof CounterbalanceCylinderData) => {
    // All fields optional
  };

  useImperativeHandle(ref, () => ({
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

    reset: () => {
      setData(defaultCounterbalanceCylinderData);
      setErrors({});
    },
  }));

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
          <h3 className="text-base font-semibold">Counterbalance Cylinder / Airbag</h3>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg p-6 bg-white">
          <CounterbalanceCylinderForm
            data={data}
            updateFn={updateField}
            errors={errors}
            handleBlur={handleBlur}
            title=""
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

CounterbalanceCylinderSection.displayName = 'CounterbalanceCylinderSection';
