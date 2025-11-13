'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

export const validateCounterbalanceCylinderData = (data: CounterbalanceCylinderData): string[] => {
  const errors: string[] = [];

  const requiredStringFields: (keyof CounterbalanceCylinderData)[] = [
    'counterbalanceType',
    'airbagPistonSeals',
    'regulator',
    'gauge',
    'pneumaticsPlumbing',
    'rodSeals',
    'rodBushing',
    'oilWick',
  ];

  requiredStringFields.forEach((field) => {
    const value = data[field];
    if (!value || typeof value !== 'string') {
      errors.push(`${String(field)} is required and must be a valid value`);
    }
  });

  if (data.airbagPistonSeals === 'LEAKING') {
    const leakLocation = data.airbagPistonSealsLeakLocation;
    if (!leakLocation || typeof leakLocation !== 'string' || !leakLocation.trim()) {
      errors.push('airbagPistonSealsLeakLocation is required when seals are LEAKING');
    }
  }

  return errors;
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
  onSectionTouched: () => void;
  serviceType?: ServiceType;
  initialData?: CounterbalanceCylinderCheck;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CounterbalanceCylinderSection = forwardRef<
  CounterbalanceCylinderSectionRef,
  CounterbalanceCylinderSectionProps
>(({ onSectionTouched, initialData }, ref) => {
  const t = useTranslations('inspections.form.counterbalanceCylinder');
  const [outerData, setOuterData] = useState<CounterbalanceCylinderData>(
    initialData?.outerData || defaultCounterbalanceCylinderData,
  );
  const [innerData, setInnerData] = useState<CounterbalanceCylinderData>(
    initialData?.innerData || defaultCounterbalanceCylinderData,
  );
  const [sharedNotes, setSharedNotes] = useState<string>(
    initialData?.outerData?.notes || initialData?.innerData?.notes || '',
  );
  const [errors, setErrors] = useState<{
    outer: Record<string, string>;
    inner: Record<string, string>;
  }>({
    outer: {},
    inner: {},
  });

  const validateField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
    data: CounterbalanceCylinderData,
  ): string => {
    if (field === 'notes') {
      return '';
    }

    const requiredFields: (keyof CounterbalanceCylinderData)[] = [
      'counterbalanceType',
      'airbagPistonSeals',
      'regulator',
      'gauge',
      'pneumaticsPlumbing',
      'rodSeals',
      'rodBushing',
      'oilWick',
    ];

    if (requiredFields.includes(field) && !value) {
      return 'This field is required';
    }

    if (
      field === 'airbagPistonSealsLeakLocation' &&
      data.airbagPistonSeals === 'LEAKING' &&
      !value
    ) {
      return 'Leak location is required when seals are leaking';
    }

    return '';
  };

  const updateOuterField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
  ) => {
    if (field === 'notes') {
      setSharedNotes(value as string);
    } else {
      setOuterData((prev) => ({ ...prev, [field]: value }));
    }
    setErrors((prev) => ({ ...prev, outer: { ...prev.outer, [field]: '' } }));
    onSectionTouched();
  };

  const updateInnerField = (
    field: keyof CounterbalanceCylinderData,
    value: string | number | undefined,
  ) => {
    if (field === 'notes') {
      setSharedNotes(value as string);
    } else {
      setInnerData((prev) => ({ ...prev, [field]: value }));
    }
    setErrors((prev) => ({ ...prev, inner: { ...prev.inner, [field]: '' } }));
    onSectionTouched();
  };

  const handleBlurOuter = (field: keyof CounterbalanceCylinderData) => {
    const error = validateField(field, outerData[field], outerData);
    setErrors((prev) => ({ ...prev, outer: { ...prev.outer, [field]: error } }));
  };

  const handleBlurInner = (field: keyof CounterbalanceCylinderData) => {
    const error = validateField(field, innerData[field], innerData);
    setErrors((prev) => ({ ...prev, inner: { ...prev.inner, [field]: error } }));
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      const outerTouched = isDataTouched(outerData, defaultCounterbalanceCylinderData);
      const innerTouched = isDataTouched(innerData, defaultCounterbalanceCylinderData);
      const notesTouched = sharedNotes.trim() !== '';
      return outerTouched || innerTouched || notesTouched;
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

      const outerErrors = outerTouched
        ? validateCounterbalanceCylinderData(outerData).map((e) => `Outer: ${e}`)
        : [];
      const innerErrors = innerTouched
        ? validateCounterbalanceCylinderData(innerData).map((e) => `Inner: ${e}`)
        : [];
      const allErrors = [...outerErrors, ...innerErrors];
      const isValid = allErrors.length === 0;

      if (isValid) {
        return {
          isValid: true,
          errors: [],
          data: {
            outerData: outerTouched ? { ...outerData, notes: sharedNotes } : undefined,
            innerData: innerTouched ? { ...innerData, notes: sharedNotes } : undefined,
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
        outerData: outerTouched ? { ...outerData, notes: sharedNotes } : undefined,
        innerData: innerTouched ? { ...innerData, notes: sharedNotes } : undefined,
      };
    },

    validate: (_serviceType: ServiceType): string[] => {
      const outerTouched = isDataTouched(outerData, defaultCounterbalanceCylinderData);
      const innerTouched = isDataTouched(innerData, defaultCounterbalanceCylinderData);

      const outerErrors = outerTouched
        ? validateCounterbalanceCylinderData(outerData).map((e) => `Outer: ${e}`)
        : [];
      const innerErrors = innerTouched
        ? validateCounterbalanceCylinderData(innerData).map((e) => `Inner: ${e}`)
        : [];

      return [...outerErrors, ...innerErrors];
    },

    reset: () => {
      setOuterData(defaultCounterbalanceCylinderData);
      setInnerData(defaultCounterbalanceCylinderData);
      setSharedNotes('');
      setErrors({ outer: {}, inner: {} });
    },
  }));

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="outer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="outer">{t('outer')}</TabsTrigger>
          <TabsTrigger value="inner">{t('inner')}</TabsTrigger>
        </TabsList>

        <TabsContent value="outer" className="space-y-6">
          <CounterbalanceCylinderForm
            data={outerData}
            updateFn={updateOuterField}
            errors={errors.outer}
            handleBlur={handleBlurOuter}
            title=""
            hideNotes
          />
        </TabsContent>

        <TabsContent value="inner" className="space-y-6">
          <CounterbalanceCylinderForm
            data={innerData}
            updateFn={updateInnerField}
            errors={errors.inner}
            handleBlur={handleBlurInner}
            title=""
            hideNotes
          />
        </TabsContent>
      </Tabs>

      <div className="pt-6 border-t">
        <Label htmlFor="shared-notes" className="text-xs font-medium mb-2 block">
          {t('notes')}
        </Label>
        <Textarea
          id="shared-notes"
          value={sharedNotes}
          onChange={(e) => {
            setSharedNotes(e.target.value);
            onSectionTouched();
          }}
          placeholder={t('notes')}
          className="text-sm"
          rows={3}
        />
      </div>
    </div>
  );
});

CounterbalanceCylinderSection.displayName = 'CounterbalanceCylinderSection';
