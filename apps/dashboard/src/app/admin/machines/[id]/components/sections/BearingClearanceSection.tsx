'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import {
  type BearingClearanceData,
  MatingPartType,
  ServiceType,
} from '@/data/types/services.types';
import { BearingClearanceForm } from '../forms/BearingClearanceForm';
import { isDataTouched } from './utils';

// Default data structure
export const defaultBearingData: BearingClearanceData = {
  totalClearance_RH: 0,
  totalClearance_LH: 0,
  mainBearings_RH: 0,
  mainBearings_LH: 0,
  upperConnectionBearings_RH: 0,
  upperConnectionBearings_LH: 0,
  wristPinToMatingPart_RH: 0,
  wristPinToMatingPart_LH: 0,
  wristPinToBushing_RH: 0,
  wristPinToBushing_LH: 0,
  slideAdjNutToScrewSleeve_RH: 0,
  slideAdjNutToScrewSleeve_LH: 0,
  extraDoubleLockOpen_RH: 0,
  extraDoubleLockOpen_LH: 0,
  ballBoxArea_RH: 0,
  ballBoxArea_LH: 0,
  hasBeenAdjusted: false,
  combinedWith: '',
  matingPart: MatingPartType.BUSHING,
};

// Validation function
export const validateBearingClearanceData = (data: BearingClearanceData): string[] => {
  const errors: string[] = [];
  const requiredNumericFields: (keyof BearingClearanceData)[] = [
    'totalClearance_RH',
    'totalClearance_LH',
    'mainBearings_RH',
    'mainBearings_LH',
    'upperConnectionBearings_RH',
    'upperConnectionBearings_LH',
    'wristPinToMatingPart_RH',
    'wristPinToMatingPart_LH',
    'wristPinToBushing_RH',
    'wristPinToBushing_LH',
    'slideAdjNutToScrewSleeve_RH',
    'slideAdjNutToScrewSleeve_LH',
    'extraDoubleLockOpen_RH',
    'extraDoubleLockOpen_LH',
    'ballBoxArea_RH',
    'ballBoxArea_LH',
  ];

  requiredNumericFields.forEach((field) => {
    const value = data[field];
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

export interface BearingClearanceSectionData {
  outerBefore?: BearingClearanceData;
  outerAfter?: BearingClearanceData;
  innerBefore?: BearingClearanceData;
  innerAfter?: BearingClearanceData;
}

export interface BearingClearanceSectionRef {
  getData: () => BearingClearanceSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
}

interface BearingClearanceSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched: () => void;
}

export const BearingClearanceSection = forwardRef<
  BearingClearanceSectionRef,
  BearingClearanceSectionProps
>(({ isOpen, onOpenChange, onSectionTouched }, ref) => {
  const t = useTranslations('inspections');

  // State
  const [outerBeforeData, setOuterBeforeData] = useState<BearingClearanceData>(defaultBearingData);
  const [outerAfterData, setOuterAfterData] = useState<BearingClearanceData>(defaultBearingData);
  const [innerBeforeData, setInnerBeforeData] = useState<BearingClearanceData>(defaultBearingData);
  const [innerAfterData, setInnerAfterData] = useState<BearingClearanceData>(defaultBearingData);

  const [outerBeforeErrors, setOuterBeforeErrors] = useState<Record<string, string>>({});
  const [outerAfterErrors, setOuterAfterErrors] = useState<Record<string, string>>({});
  const [innerBeforeErrors, setInnerBeforeErrors] = useState<Record<string, string>>({});
  const [innerAfterErrors, setInnerAfterErrors] = useState<Record<string, string>>({});

  // Update functions
  const updateOuterBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterBeforeData((prev) => ({ ...prev, [field]: value }));
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched();
  };

  const updateOuterAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterAfterData((prev) => ({ ...prev, [field]: value }));
    setOuterAfterErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched();
  };

  const updateInnerBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerBeforeData((prev) => ({ ...prev, [field]: value }));
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched();
  };

  const updateInnerAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerAfterData((prev) => ({ ...prev, [field]: value }));
    setInnerAfterErrors((prev) => ({ ...prev, [field]: '' }));
    onSectionTouched();
  };

  // Validation on blur
  const validateField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean | undefined,
  ): string => {
    if (field === 'combinedWith' || field === 'matingPart' || field === 'hasBeenAdjusted') {
      return '';
    }

    const numValue = Number(value);
    if (isNaN(numValue)) {
      return t('form.error.invalidNumber');
    }

    return '';
  };

  // Blur handlers
  const handleBlurOuterBefore = (field: keyof BearingClearanceData) => {
    const error = validateField(field, outerBeforeData[field]);
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlurOuterAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, outerAfterData[field]);
    setOuterAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlurInnerBefore = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerBeforeData[field]);
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlurInnerAfter = (field: keyof BearingClearanceData) => {
    const error = validateField(field, innerAfterData[field]);
    setInnerAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getData: (): BearingClearanceSectionData => {
      const outerBeforeTouched = isDataTouched(outerBeforeData, defaultBearingData);
      const outerAfterTouched = isDataTouched(outerAfterData, defaultBearingData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, defaultBearingData);
      const innerAfterTouched = isDataTouched(innerAfterData, defaultBearingData);

      return {
        outerBefore: outerBeforeTouched ? outerBeforeData : undefined,
        outerAfter: outerAfterTouched ? outerAfterData : undefined,
        innerBefore: innerBeforeTouched ? innerBeforeData : undefined,
        innerAfter: innerAfterTouched ? innerAfterData : undefined,
      };
    },

    validate: (serviceType: ServiceType): string[] => {
      const errors: string[] = [];

      const outerBeforeTouched = isDataTouched(outerBeforeData, defaultBearingData);
      const outerAfterTouched = isDataTouched(outerAfterData, defaultBearingData);
      const innerBeforeTouched = isDataTouched(innerBeforeData, defaultBearingData);
      const innerAfterTouched = isDataTouched(innerAfterData, defaultBearingData);

      if (serviceType === ServiceType.MAINTENANCE) {
        if (!outerBeforeTouched || !innerBeforeTouched) {
          errors.push(
            'Bearing Clearance: For maintenance inspections, you must fill all "Before" sections (Outer Before and Inner Before)',
          );
        } else {
          errors.push(
            ...validateBearingClearanceData(outerBeforeData).map((e) => `Outer Before: ${e}`),
          );
          errors.push(
            ...validateBearingClearanceData(innerBeforeData).map((e) => `Inner Before: ${e}`),
          );
        }
      }

      if (outerAfterTouched) {
        errors.push(
          ...validateBearingClearanceData(outerAfterData).map((e) => `Outer After: ${e}`),
        );
      }
      if (innerAfterTouched) {
        errors.push(
          ...validateBearingClearanceData(innerAfterData).map((e) => `Inner After: ${e}`),
        );
      }

      if (serviceType === ServiceType.INSPECTION && !outerAfterTouched && !innerAfterTouched) {
        errors.push(
          'Bearing Clearance: For routine inspections, you must fill at least one "After" section (Outer After or Inner After)',
        );
      }

      return errors;
    },

    reset: () => {
      setOuterBeforeData(defaultBearingData);
      setOuterAfterData(defaultBearingData);
      setInnerBeforeData(defaultBearingData);
      setInnerAfterData(defaultBearingData);
      setOuterBeforeErrors({});
      setOuterAfterErrors({});
      setInnerBeforeErrors({});
      setInnerAfterErrors({});
    },
  }));

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
          <h3 className="text-base font-semibold">{t('form.bearingClearance.title')}</h3>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg p-6 bg-white">
          <Tabs defaultValue="outer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="outer">{t('form.bearingClearance.outer')}</TabsTrigger>
              <TabsTrigger value="inner">{t('form.bearingClearance.inner')}</TabsTrigger>
            </TabsList>

            <TabsContent value="outer" className="space-y-6">
              <Tabs defaultValue="before" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="before">{t('form.bearingClearance.before')}</TabsTrigger>
                  <TabsTrigger value="after">{t('form.bearingClearance.after')}</TabsTrigger>
                </TabsList>

                <TabsContent value="before" className="mt-4">
                  <BearingClearanceForm
                    title=""
                    data={outerBeforeData}
                    updateFn={updateOuterBeforeField}
                    errors={outerBeforeErrors}
                    handleBlur={handleBlurOuterBefore}
                  />
                </TabsContent>

                <TabsContent value="after" className="mt-4">
                  <BearingClearanceForm
                    title=""
                    data={outerAfterData}
                    updateFn={updateOuterAfterField}
                    errors={outerAfterErrors}
                    handleBlur={handleBlurOuterAfter}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="inner" className="space-y-6">
              <Tabs defaultValue="before" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="before">{t('form.bearingClearance.before')}</TabsTrigger>
                  <TabsTrigger value="after">{t('form.bearingClearance.after')}</TabsTrigger>
                </TabsList>

                <TabsContent value="before" className="mt-4">
                  <BearingClearanceForm
                    title=""
                    data={innerBeforeData}
                    updateFn={updateInnerBeforeField}
                    errors={innerBeforeErrors}
                    handleBlur={handleBlurInnerBefore}
                  />
                </TabsContent>

                <TabsContent value="after" className="mt-4">
                  <BearingClearanceForm
                    title=""
                    data={innerAfterData}
                    updateFn={updateInnerAfterField}
                    errors={innerAfterErrors}
                    handleBlur={handleBlurInnerAfter}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

BearingClearanceSection.displayName = 'BearingClearanceSection';
