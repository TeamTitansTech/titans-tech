'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { type SlideData, ParallelismType, ServiceType } from '@/data/types/services.types';
import { SlideForm } from '../forms/SlideForm';
import { isDataTouched } from './utils';

export const defaultSlideData: SlideData = {
  parallelism: ParallelismType.DNC,
  hasBeenAdjusted: false,
  position1: 0,
  position2: 0,
  position3: 0,
  position4: 0,
  shutheightChecked: false,
  actualSH: '',
  overloadsOnMonitor: '',
  indicatorReading: '',
};

export const validateSlideData = (data: SlideData): string[] => {
  const errors: string[] = [];
  const requiredFields: (keyof SlideData)[] = ['position1', 'position2', 'position3', 'position4'];

  requiredFields.forEach((field) => {
    const value = data[field];
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

export interface SlideSectionData {
  outerBefore?: SlideData;
  outerAfter?: SlideData;
  innerBefore?: SlideData;
  innerAfter?: SlideData;
}

export interface SlideSectionRef {
  getData: () => SlideSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
}

interface SlideSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched: () => void;
}

export const SlideSection = forwardRef<SlideSectionRef, SlideSectionProps>(
  ({ isOpen, onOpenChange, onSectionTouched }, ref) => {
    const [outerBeforeData, setOuterBeforeData] = useState<SlideData>(defaultSlideData);
    const [outerAfterData, setOuterAfterData] = useState<SlideData>(defaultSlideData);
    const [innerBeforeData, setInnerBeforeData] = useState<SlideData>(defaultSlideData);
    const [innerAfterData, setInnerAfterData] = useState<SlideData>(defaultSlideData);

    const [outerBeforeErrors, setOuterBeforeErrors] = useState<Record<string, string>>({});
    const [outerAfterErrors, setOuterAfterErrors] = useState<Record<string, string>>({});
    const [innerBeforeErrors, setInnerBeforeErrors] = useState<Record<string, string>>({});
    const [innerAfterErrors, setInnerAfterErrors] = useState<Record<string, string>>({});

    const updateOuterBeforeField = (field: keyof SlideData, value: string | number | boolean) => {
      setOuterBeforeData((prev) => ({ ...prev, [field]: value }));
      setOuterBeforeErrors((prev) => ({ ...prev, [field]: '' }));
      onSectionTouched();
    };

    const updateOuterAfterField = (field: keyof SlideData, value: string | number | boolean) => {
      setOuterAfterData((prev) => ({ ...prev, [field]: value }));
      setOuterAfterErrors((prev) => ({ ...prev, [field]: '' }));
      onSectionTouched();
    };

    const updateInnerBeforeField = (field: keyof SlideData, value: string | number | boolean) => {
      setInnerBeforeData((prev) => ({ ...prev, [field]: value }));
      setInnerBeforeErrors((prev) => ({ ...prev, [field]: '' }));
      onSectionTouched();
    };

    const updateInnerAfterField = (field: keyof SlideData, value: string | number | boolean) => {
      setInnerAfterData((prev) => ({ ...prev, [field]: value }));
      setInnerAfterErrors((prev) => ({ ...prev, [field]: '' }));
      onSectionTouched();
    };

    const validateField = (
      field: keyof SlideData,
      value: string | number | boolean | undefined,
    ): string => {
      if (
        field === 'hasBeenAdjusted' ||
        field === 'shutheightChecked' ||
        field === 'parallelism' ||
        field === 'actualSH' ||
        field === 'overloadsOnMonitor' ||
        field === 'indicatorReading'
      ) {
        return '';
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Invalid number';
      }

      return '';
    };

    const handleBlurOuterBefore = (field: keyof SlideData) => {
      const error = validateField(field, outerBeforeData[field]);
      setOuterBeforeErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurOuterAfter = (field: keyof SlideData) => {
      const error = validateField(field, outerAfterData[field]);
      setOuterAfterErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurInnerBefore = (field: keyof SlideData) => {
      const error = validateField(field, innerBeforeData[field]);
      setInnerBeforeErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurInnerAfter = (field: keyof SlideData) => {
      const error = validateField(field, innerAfterData[field]);
      setInnerAfterErrors((prev) => ({ ...prev, [field]: error }));
    };

    useImperativeHandle(ref, () => ({
      getData: (): SlideSectionData => {
        const outerBeforeTouched = isDataTouched(outerBeforeData, defaultSlideData);
        const outerAfterTouched = isDataTouched(outerAfterData, defaultSlideData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, defaultSlideData);
        const innerAfterTouched = isDataTouched(innerAfterData, defaultSlideData);

        return {
          outerBefore: outerBeforeTouched ? outerBeforeData : undefined,
          outerAfter: outerAfterTouched ? outerAfterData : undefined,
          innerBefore: innerBeforeTouched ? innerBeforeData : undefined,
          innerAfter: innerAfterTouched ? innerAfterData : undefined,
        };
      },

      validate: (serviceType: ServiceType): string[] => {
        const errors: string[] = [];

        const outerBeforeTouched = isDataTouched(outerBeforeData, defaultSlideData);
        const outerAfterTouched = isDataTouched(outerAfterData, defaultSlideData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, defaultSlideData);
        const innerAfterTouched = isDataTouched(innerAfterData, defaultSlideData);

        if (serviceType === ServiceType.MAINTENANCE) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            errors.push(
              'Slide: For maintenance inspections, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            errors.push(...validateSlideData(outerBeforeData).map((e) => `Slide Outer Before: ${e}`));
            errors.push(...validateSlideData(innerBeforeData).map((e) => `Slide Inner Before: ${e}`));
          }
        }

        if (outerAfterTouched) {
          errors.push(...validateSlideData(outerAfterData).map((e) => `Slide Outer After: ${e}`));
        }
        if (innerAfterTouched) {
          errors.push(...validateSlideData(innerAfterData).map((e) => `Slide Inner After: ${e}`));
        }

        if (serviceType === ServiceType.INSPECTION && !outerAfterTouched && !innerAfterTouched) {
          errors.push(
            'Slide: For routine inspections, you must fill at least one "After" section (Outer After or Inner After)',
          );
        }

        return errors;
      },

      reset: () => {
        setOuterBeforeData(defaultSlideData);
        setOuterAfterData(defaultSlideData);
        setInnerBeforeData(defaultSlideData);
        setInnerAfterData(defaultSlideData);
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
            <h3 className="text-base font-semibold">Slide</h3>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border border-t-0 rounded-b-lg p-6 bg-white">
            <Tabs defaultValue="outer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="outer">Outer Measurements</TabsTrigger>
                <TabsTrigger value="inner">Inner Measurements</TabsTrigger>
              </TabsList>

              <TabsContent value="outer" className="space-y-6">
                <Tabs defaultValue="before" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="before">Before Maintenance</TabsTrigger>
                    <TabsTrigger value="after">After Maintenance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="before" className="mt-4">
                    <SlideForm
                      data={outerBeforeData}
                      updateFn={updateOuterBeforeField}
                      errors={outerBeforeErrors}
                      handleBlur={handleBlurOuterBefore}
                      title="Outer Before"
                    />
                  </TabsContent>

                  <TabsContent value="after" className="mt-4">
                    <SlideForm
                      data={outerAfterData}
                      updateFn={updateOuterAfterField}
                      errors={outerAfterErrors}
                      handleBlur={handleBlurOuterAfter}
                      title="Outer After"
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="inner" className="space-y-6">
                <Tabs defaultValue="before" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="before">Before Maintenance</TabsTrigger>
                    <TabsTrigger value="after">After Maintenance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="before" className="mt-4">
                    <SlideForm
                      data={innerBeforeData}
                      updateFn={updateInnerBeforeField}
                      errors={innerBeforeErrors}
                      handleBlur={handleBlurInnerBefore}
                      title="Inner Before"
                    />
                  </TabsContent>

                  <TabsContent value="after" className="mt-4">
                    <SlideForm
                      data={innerAfterData}
                      updateFn={updateInnerAfterField}
                      errors={innerAfterErrors}
                      handleBlur={handleBlurInnerAfter}
                      title="Inner After"
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
);

SlideSection.displayName = 'SlideSection';
