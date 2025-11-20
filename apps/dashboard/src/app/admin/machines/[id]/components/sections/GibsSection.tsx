'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type GibsData, ServiceType, YesNoDncType } from '@/data/types/services.types';
import { GibsForm } from '../forms/GibsForm';
import { isDataTouched } from './utils';
import { useOuterInnerState } from '../../hooks/useOuterInnerState';
import { SectionContainer } from '../shared/SectionContainer';

export const defaultGibsData: GibsData = {
  hasBeenAdjusted: YesNoDncType.NO,
  point1: 0,
  point2: 0,
  point3: 0,
  point4: 0,
  point5: 0,
  point6: 0,
  point7: 0,
  point8: 0,
  point9: 0,
  point10: 0,
  point11: 0,
  point12: 0,
  point13: 0,
  point14: 0,
  point15: 0,
  point16: 0,
  leftTop: undefined,
  leftBottom: undefined,
  rightTop: undefined,
  rightBottom: undefined,
  frontTop: undefined,
  frontBottom: undefined,
  backTop: undefined,
  backBottom: undefined,
  usable: '',
};

export const validateGibsData = (data: GibsData): string[] => {
  const errors: string[] = [];
  const requiredFields: (keyof GibsData)[] = [
    'point1',
    'point2',
    'point3',
    'point4',
    'point5',
    'point6',
    'point7',
    'point8',
    'point9',
    'point10',
    'point11',
    'point12',
    'point13',
    'point14',
    'point15',
    'point16',
  ];

  requiredFields.forEach((field) => {
    const value = data[field];
    // Only validate if field exists in data
    if (value !== undefined && (typeof value !== 'number' || isNaN(value))) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

export interface GibsSectionData {
  outerBefore?: GibsData;
  outerAfter?: GibsData;
  innerBefore?: GibsData;
  innerAfter?: GibsData;
}

export interface GibsSectionRef {
  getData: () => GibsSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: GibsSectionData;
  };
}

interface GibsSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
  initialData?: GibsSectionData;
}

export const GibsSection = forwardRef<GibsSectionRef, GibsSectionProps>(
  ({ isOpen, onOpenChange, onSectionTouched, initialData }, ref) => {
    // Use the outer/inner state hook
    const {
      initialOuterBeforeData,
      initialOuterAfterData,
      initialInnerBeforeData,
      initialInnerAfterData,
      outerBeforeData,
      outerAfterData,
      innerBeforeData,
      innerAfterData,
      outerBeforeErrors,
      outerAfterErrors,
      innerBeforeErrors,
      innerAfterErrors,
      updateOuterBeforeField: baseUpdateOuterBefore,
      updateOuterAfterField: baseUpdateOuterAfter,
      updateInnerBeforeField: baseUpdateInnerBefore,
      updateInnerAfterField: baseUpdateInnerAfter,
      setOuterBeforeFieldError,
      setOuterAfterFieldError,
      setInnerBeforeFieldError,
      setInnerAfterFieldError,
      reset,
    } = useOuterInnerState<GibsData>(defaultGibsData, initialData);

    // Wrapper functions to call onSectionTouched
    const updateOuterBeforeField = (
      field: keyof GibsData,
      value: string | number | boolean | undefined,
    ) => {
      // Type assertion needed: form inputs provide union type, but hook expects exact field type
      baseUpdateOuterBefore(field, value as GibsData[keyof GibsData]);
      onSectionTouched?.();
    };

    const updateOuterAfterField = (
      field: keyof GibsData,
      value: string | number | boolean | undefined,
    ) => {
      // Type assertion needed: form inputs provide union type, but hook expects exact field type
      baseUpdateOuterAfter(field, value as GibsData[keyof GibsData]);
      onSectionTouched?.();
    };

    const updateInnerBeforeField = (
      field: keyof GibsData,
      value: string | number | boolean | undefined,
    ) => {
      // Type assertion needed: form inputs provide union type, but hook expects exact field type
      baseUpdateInnerBefore(field, value as GibsData[keyof GibsData]);
      onSectionTouched?.();
    };

    const updateInnerAfterField = (
      field: keyof GibsData,
      value: string | number | boolean | undefined,
    ) => {
      // Type assertion needed: form inputs provide union type, but hook expects exact field type
      baseUpdateInnerAfter(field, value as GibsData[keyof GibsData]);
      onSectionTouched?.();
    };

    const validateField = (
      field: keyof GibsData,
      value: string | number | boolean | undefined,
    ): string => {
      if (field === 'hasBeenAdjusted' || field === 'usable') {
        return '';
      }

      if (
        [
          'leftTop',
          'leftBottom',
          'rightTop',
          'rightBottom',
          'frontTop',
          'frontBottom',
          'backTop',
          'backBottom',
        ].includes(String(field))
      ) {
        if (value === undefined || value === '') return '';
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Invalid number';
      }

      return '';
    };

    const handleBlurOuterBefore = (field: keyof GibsData) => {
      const error = validateField(field, outerBeforeData[field]);
      setOuterBeforeFieldError(field, error);
    };

    const handleBlurOuterAfter = (field: keyof GibsData) => {
      const error = validateField(field, outerAfterData[field]);
      setOuterAfterFieldError(field, error);
    };

    const handleBlurInnerBefore = (field: keyof GibsData) => {
      const error = validateField(field, innerBeforeData[field]);
      setInnerBeforeFieldError(field, error);
    };

    const handleBlurInnerAfter = (field: keyof GibsData) => {
      const error = validateField(field, innerAfterData[field]);
      setInnerAfterFieldError(field, error);
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
        const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
        const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);

        return outerBeforeTouched || outerAfterTouched || innerBeforeTouched || innerAfterTouched;
      },

      validateAndGetData: (
        serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: GibsSectionData } => {
        const validationErrors: string[] = [];

        const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
        const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
        const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);

        if (serviceType === ServiceType.MAINTENANCE) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            validationErrors.push(
              'Gibs: For maintenance inspections, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            validationErrors.push(
              ...validateGibsData(outerBeforeData).map((e) => `Gibs Outer Before: ${e}`),
            );
            validationErrors.push(
              ...validateGibsData(innerBeforeData).map((e) => `Gibs Inner Before: ${e}`),
            );
          }
        }

        if (outerAfterTouched) {
          validationErrors.push(
            ...validateGibsData(outerAfterData).map((e) => `Gibs Outer After: ${e}`),
          );
        }
        if (innerAfterTouched) {
          validationErrors.push(
            ...validateGibsData(innerAfterData).map((e) => `Gibs Inner After: ${e}`),
          );
        }

        // Check if there's any existing data (either initial or modified)
        const hasOuterData =
          outerAfterTouched || isDataTouched(initialOuterAfterData, defaultGibsData);
        const hasInnerData =
          innerAfterTouched || isDataTouched(initialInnerAfterData, defaultGibsData);

        if (serviceType === ServiceType.INSPECTION && !hasOuterData && !hasInnerData) {
          validationErrors.push(
            'Gibs: For routine inspections, you must fill at least one "After" section (Outer After or Inner After)',
          );
        }

        const isValid = validationErrors.length === 0;

        if (isValid) {
          return {
            isValid: true,
            errors: [],
            data: {
              outerBefore: outerBeforeTouched ? outerBeforeData : undefined,
              outerAfter: hasOuterData
                ? outerAfterTouched
                  ? outerAfterData
                  : initialOuterAfterData
                : undefined,
              innerBefore: innerBeforeTouched ? innerBeforeData : undefined,
              innerAfter: hasInnerData
                ? innerAfterTouched
                  ? innerAfterData
                  : initialInnerAfterData
                : undefined,
            },
          };
        }

        return {
          isValid: false,
          errors: validationErrors,
        };
      },

      getData: (): GibsSectionData => {
        const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
        const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
        const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);

        // Check if there's any existing data (either initial or modified)
        const hasOuterData =
          outerAfterTouched || isDataTouched(initialOuterAfterData, defaultGibsData);
        const hasInnerData =
          innerAfterTouched || isDataTouched(initialInnerAfterData, defaultGibsData);

        return {
          outerBefore: outerBeforeTouched ? outerBeforeData : undefined,
          outerAfter: hasOuterData
            ? outerAfterTouched
              ? outerAfterData
              : initialOuterAfterData
            : undefined,
          innerBefore: innerBeforeTouched ? innerBeforeData : undefined,
          innerAfter: hasInnerData
            ? innerAfterTouched
              ? innerAfterData
              : initialInnerAfterData
            : undefined,
        };
      },

      validate: (serviceType: ServiceType): string[] => {
        const errors: string[] = [];

        const outerBeforeTouched = isDataTouched(outerBeforeData, initialOuterBeforeData);
        const outerAfterTouched = isDataTouched(outerAfterData, initialOuterAfterData);
        const innerBeforeTouched = isDataTouched(innerBeforeData, initialInnerBeforeData);
        const innerAfterTouched = isDataTouched(innerAfterData, initialInnerAfterData);

        if (serviceType === ServiceType.MAINTENANCE) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            errors.push(
              'Gibs: For maintenance inspections, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            errors.push(...validateGibsData(outerBeforeData).map((e) => `Gibs Outer Before: ${e}`));
            errors.push(...validateGibsData(innerBeforeData).map((e) => `Gibs Inner Before: ${e}`));
          }
        }

        if (outerAfterTouched) {
          errors.push(...validateGibsData(outerAfterData).map((e) => `Gibs Outer After: ${e}`));
        }
        if (innerAfterTouched) {
          errors.push(...validateGibsData(innerAfterData).map((e) => `Gibs Inner After: ${e}`));
        }

        // Check if there's any existing data (either initial or modified)
        const hasOuterData =
          outerAfterTouched || isDataTouched(initialOuterAfterData, defaultGibsData);
        const hasInnerData =
          innerAfterTouched || isDataTouched(initialInnerAfterData, defaultGibsData);

        if (serviceType === ServiceType.INSPECTION && !hasOuterData && !hasInnerData) {
          errors.push(
            'Gibs: For routine inspections, you must fill at least one "After" section (Outer After or Inner After)',
          );
        }

        return errors;
      },

      reset,
    }));

    return (
      <SectionContainer title="Gibs" isOpen={isOpen} onOpenChange={onOpenChange}>
        <div className="space-y-6">
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
                  <GibsForm
                    data={outerBeforeData}
                    updateFn={updateOuterBeforeField}
                    errors={outerBeforeErrors}
                    handleBlur={handleBlurOuterBefore}
                    title="Outer Before"
                  />
                </TabsContent>

                <TabsContent value="after" className="mt-4">
                  <GibsForm
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
                  <GibsForm
                    data={innerBeforeData}
                    updateFn={updateInnerBeforeField}
                    errors={innerBeforeErrors}
                    handleBlur={handleBlurInnerBefore}
                    title="Inner Before"
                  />
                </TabsContent>

                <TabsContent value="after" className="mt-4">
                  <GibsForm
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
      </SectionContainer>
    );
  },
);

GibsSection.displayName = 'GibsSection';
