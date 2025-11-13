'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  type CounterbalanceCylinderData,
  type CounterbalanceCylinderCheck,
  ServiceType,
} from '@/data/types/services.types';
import { CounterbalanceCylinderForm } from '../forms/CounterbalanceCylinderForm';
import { isDataTouched } from './utils';

export const defaultCounterbalanceCylinderData: CounterbalanceCylinderData = {
  counterbalanceType: undefined,
  airbagPistonSeals: undefined,
  airbagPistonSealsLeakLocation: '',
  regulator: undefined,
  gauge: undefined,
  pneumaticsPlumbing: undefined,
  rodSeals: undefined,
  rodBushing: undefined,
  oilWick: undefined,
  notes: '',
};

export const validateCounterbalanceCylinderData = (_data: CounterbalanceCylinderData): string[] => {
  // All fields are optional for this section
  return [];
};

export interface CounterbalanceCylinderSectionRef {
  getData: () => CounterbalanceCylinderCheck | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: CounterbalanceCylinderCheck;
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
  const t = useTranslations('inspections.form.counterbalanceCylinder');
  const [outerData, setOuterData] = useState<CounterbalanceCylinderData>(
    defaultCounterbalanceCylinderData,
  );
  const [innerData, setInnerData] = useState<CounterbalanceCylinderData>(
    defaultCounterbalanceCylinderData,
  );
  const [errors, setErrors] = useState<{
    outer: Record<string, string>;
    inner: Record<string, string>;
  }>({
    outer: {},
    inner: {},
  });

  const updateOuterField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
  ) => {
    setOuterData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, outer: { ...prev.outer, [field]: '' } }));
    onSectionTouched?.();
  };

  const updateInnerField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
  ) => {
    setInnerData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, inner: { ...prev.inner, [field]: '' } }));
    onSectionTouched?.();
  };

  const handleBlur = (_field: keyof CounterbalanceCylinderData) => {
    // All fields optional
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      const outerTouched = isDataTouched(outerData, defaultCounterbalanceCylinderData);
      const innerTouched = isDataTouched(innerData, defaultCounterbalanceCylinderData);
      return outerTouched || innerTouched;
    },

    validateAndGetData: (
      _serviceType: ServiceType,
    ): {
      isValid: boolean;
      errors: string[];
      data?: CounterbalanceCylinderCheck;
    } => {
      const outerTouched = isDataTouched(outerData, defaultCounterbalanceCylinderData);
      const innerTouched = isDataTouched(innerData, defaultCounterbalanceCylinderData);

      if (!outerTouched && !innerTouched) {
        return { isValid: true, errors: [] };
      }

      const outerErrors = outerTouched ? validateCounterbalanceCylinderData(outerData) : [];
      const innerErrors = innerTouched ? validateCounterbalanceCylinderData(innerData) : [];
      const allErrors = [...outerErrors, ...innerErrors];
      const isValid = allErrors.length === 0;

      if (isValid) {
        return {
          isValid: true,
          errors: [],
          data: {
            outerData: outerTouched ? outerData : undefined,
            innerData: innerTouched ? innerData : undefined,
          },
        };
      }

      return {
        isValid: false,
        errors: allErrors,
      };
    },

    getData: (): CounterbalanceCylinderCheck | undefined => {
      const outerTouched = isDataTouched(outerData, defaultCounterbalanceCylinderData);
      const innerTouched = isDataTouched(innerData, defaultCounterbalanceCylinderData);

      if (!outerTouched && !innerTouched) {
        return undefined;
      }

      return {
        outerData: outerTouched ? outerData : undefined,
        innerData: innerTouched ? innerData : undefined,
      };
    },

    validate: (_serviceType: ServiceType): string[] => {
      const outerTouched = isDataTouched(outerData, defaultCounterbalanceCylinderData);
      const innerTouched = isDataTouched(innerData, defaultCounterbalanceCylinderData);

      const outerErrors = outerTouched ? validateCounterbalanceCylinderData(outerData) : [];
      const innerErrors = innerTouched ? validateCounterbalanceCylinderData(innerData) : [];

      return [...outerErrors, ...innerErrors];
    },

    reset: () => {
      setOuterData(defaultCounterbalanceCylinderData);
      setInnerData(defaultCounterbalanceCylinderData);
      setErrors({ outer: {}, inner: {} });
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
          <Tabs defaultValue="outer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="outer">{t('outer')}</TabsTrigger>
              <TabsTrigger value="inner">{t('inner')}</TabsTrigger>
            </TabsList>
            <TabsContent value="outer" className="space-y-4 pt-4">
              <CounterbalanceCylinderForm
                data={outerData}
                updateFn={updateOuterField}
                errors={errors.outer}
                handleBlur={handleBlur}
                title={t('outer')}
              />
            </TabsContent>
            <TabsContent value="inner" className="space-y-4 pt-4">
              <CounterbalanceCylinderForm
                data={innerData}
                updateFn={updateInnerField}
                errors={errors.inner}
                handleBlur={handleBlur}
                title={t('inner')}
              />
            </TabsContent>
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

CounterbalanceCylinderSection.displayName = 'CounterbalanceCylinderSection';
