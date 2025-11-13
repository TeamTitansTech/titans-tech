'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import {
  type SlideData,
  ServiceType,
  ParallelismType,
  YesNoNaDncType,
  YesNoDncType,
} from '@/data/types/services.types';
import { SlideForm } from '../forms/SlideForm';
import { isDataTouched } from './utils';

export const defaultSlideData: SlideData = {
  position1: 0,
  position2: 0,
  position3: 0,
  position4: 0,
  position5: 0,
  position6: 0,
};

export const validateSlideData = (data: SlideData): string[] => {
  const errors: string[] = [];
  const requiredFields: (keyof SlideData)[] = [
    'position1',
    'position2',
    'position3',
    'position4',
    'position5',
    'position6',
  ];

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
  outerData?: SlideData;
  innerBefore?: SlideData;
  innerData?: SlideData;
  parallelism?: ParallelismType;
  hasParallelismBeenAdjusted?: YesNoNaDncType;
  outerShutheightIndicatorsChecked?: YesNoDncType;
  outerOverloadsOnTonnageMonitor?: string;
  outerShutheightActualSh?: string;
  outerIndicatorReading?: string;
  innerShutheightIndicatorsChecked?: YesNoDncType;
  innerOverloadsOnTonnageMonitor?: string;
  innerShutheightActualSh?: string;
  innerIndicatorReading?: string;
  notes?: string;
}

export interface SlideSectionRef {
  getData: () => SlideSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: SlideSectionData;
  };
}

interface SlideSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
  serviceType: ServiceType;
}

export const SlideSection = forwardRef<SlideSectionRef, SlideSectionProps>(
  ({ isOpen, onOpenChange, onSectionTouched, serviceType }, ref) => {
    // All slide data in a single state object
    const [formData, setFormData] = useState({
      outerBeforeData: defaultSlideData,
      outerAfterData: defaultSlideData,
      innerBeforeData: defaultSlideData,
      innerAfterData: defaultSlideData,
      parallelism: ParallelismType.DNC,
      hasParallelismBeenAdjusted: YesNoNaDncType.DNC,
      outerShutheightIndicatorsChecked: YesNoDncType.DNC,
      outerOverloadsOnTonnageMonitor: '',
      outerShutheightActualSh: '',
      outerIndicatorReading: '',
      innerShutheightIndicatorsChecked: YesNoDncType.DNC,
      innerOverloadsOnTonnageMonitor: '',
      innerShutheightActualSh: '',
      innerIndicatorReading: '',
      notes: '',
    });

    const [errors, setErrors] = useState({
      outerBefore: {} as Record<string, string>,
      outerAfter: {} as Record<string, string>,
      innerBefore: {} as Record<string, string>,
      innerAfter: {} as Record<string, string>,
    });

    // Generic update function for any field in formData
    const updateField = <K extends keyof typeof formData>(
      field: K,
      value: (typeof formData)[K],
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Validate individual field
    const validateField = (value: number | undefined): string => {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Invalid number';
      }
      return '';
    };

    // Handle blur for position fields to validate
    const handleBlur = (
      section: 'outerBefore' | 'outerAfter' | 'innerBefore' | 'innerAfter',
      field: keyof SlideData,
    ) => {
      let dataToValidate: SlideData;
      switch (section) {
        case 'outerBefore':
          dataToValidate = formData.outerBeforeData;
          break;
        case 'outerAfter':
          dataToValidate = formData.outerAfterData;
          break;
        case 'innerBefore':
          dataToValidate = formData.innerBeforeData;
          break;
        case 'innerAfter':
          dataToValidate = formData.innerAfterData;
          break;
      }

      const error = validateField(dataToValidate[field]);
      setErrors((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: error },
      }));
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        const outerBeforeTouched = isDataTouched(formData.outerBeforeData, defaultSlideData);
        const outerDataTouched = isDataTouched(formData.outerAfterData, defaultSlideData);
        const innerBeforeTouched = isDataTouched(formData.innerBeforeData, defaultSlideData);
        const innerDataTouched = isDataTouched(formData.innerAfterData, defaultSlideData);

        // Check if any data has been touched
        return outerBeforeTouched || outerDataTouched || innerBeforeTouched || innerDataTouched;
      },

      validateAndGetData: (
        serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: SlideSectionData } => {
        const validationErrors: string[] = [];

        const outerBeforeTouched = isDataTouched(formData.outerBeforeData, defaultSlideData);
        const outerDataTouched = isDataTouched(formData.outerAfterData, defaultSlideData);
        const innerBeforeTouched = isDataTouched(formData.innerBeforeData, defaultSlideData);
        const innerDataTouched = isDataTouched(formData.innerAfterData, defaultSlideData);

        // For maintenance, check if before measurements are included
        if (serviceType === ServiceType.MAINTENANCE && (outerBeforeTouched || innerBeforeTouched)) {
          if (!outerBeforeTouched || !innerBeforeTouched) {
            validationErrors.push(
              'Slide: When "Include measurements before maintenance" is checked, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            validationErrors.push(
              ...validateSlideData(formData.outerBeforeData).map((e) => `Slide Outer Before: ${e}`),
            );
            validationErrors.push(
              ...validateSlideData(formData.innerBeforeData).map((e) => `Slide Inner Before: ${e}`),
            );
          }
        }

        // Validate current/after data if touched
        if (outerDataTouched) {
          validationErrors.push(
            ...validateSlideData(formData.outerAfterData).map((e) => `Slide Outer: ${e}`),
          );
        }
        if (innerDataTouched) {
          validationErrors.push(
            ...validateSlideData(formData.innerAfterData).map((e) => `Slide Inner: ${e}`),
          );
        }

        // For inspections and maintenance, require at least one section to be filled
        if (!outerDataTouched && !innerDataTouched) {
          validationErrors.push('Slide: You must fill at least one section (Outer or Inner)');
        }

        const isValid = validationErrors.length === 0;

        // Only return data if valid
        if (isValid) {
          return {
            isValid: true,
            errors: [],
            data: {
              outerBefore: outerBeforeTouched ? formData.outerBeforeData : undefined,
              outerData: outerDataTouched ? formData.outerAfterData : undefined,
              innerBefore: innerBeforeTouched ? formData.innerBeforeData : undefined,
              innerData: innerDataTouched ? formData.innerAfterData : undefined,
              parallelism: formData.parallelism,
              hasParallelismBeenAdjusted: formData.hasParallelismBeenAdjusted,
              outerShutheightIndicatorsChecked: formData.outerShutheightIndicatorsChecked,
              outerOverloadsOnTonnageMonitor: formData.outerOverloadsOnTonnageMonitor || undefined,
              outerShutheightActualSh: formData.outerShutheightActualSh || undefined,
              outerIndicatorReading: formData.outerIndicatorReading || undefined,
              innerShutheightIndicatorsChecked: formData.innerShutheightIndicatorsChecked,
              innerOverloadsOnTonnageMonitor: formData.innerOverloadsOnTonnageMonitor || undefined,
              innerShutheightActualSh: formData.innerShutheightActualSh || undefined,
              innerIndicatorReading: formData.innerIndicatorReading || undefined,
              notes: formData.notes || undefined,
            },
          };
        }

        return {
          isValid: false,
          errors: validationErrors,
        };
      },

      getData: (): SlideSectionData => {
        const outerBeforeTouched = isDataTouched(formData.outerBeforeData, defaultSlideData);
        const outerDataTouched = isDataTouched(formData.outerAfterData, defaultSlideData);
        const innerBeforeTouched = isDataTouched(formData.innerBeforeData, defaultSlideData);
        const innerDataTouched = isDataTouched(formData.innerAfterData, defaultSlideData);

        return {
          outerBefore: outerBeforeTouched ? formData.outerBeforeData : undefined,
          outerData: outerDataTouched ? formData.outerAfterData : undefined,
          innerBefore: innerBeforeTouched ? formData.innerBeforeData : undefined,
          innerData: innerDataTouched ? formData.innerAfterData : undefined,
          parallelism: formData.parallelism,
          hasParallelismBeenAdjusted: formData.hasParallelismBeenAdjusted,
          outerShutheightIndicatorsChecked: formData.outerShutheightIndicatorsChecked,
          outerOverloadsOnTonnageMonitor: formData.outerOverloadsOnTonnageMonitor || undefined,
          outerShutheightActualSh: formData.outerShutheightActualSh || undefined,
          outerIndicatorReading: formData.outerIndicatorReading || undefined,
          innerShutheightIndicatorsChecked: formData.innerShutheightIndicatorsChecked,
          innerOverloadsOnTonnageMonitor: formData.innerOverloadsOnTonnageMonitor || undefined,
          innerShutheightActualSh: formData.innerShutheightActualSh || undefined,
          innerIndicatorReading: formData.innerIndicatorReading || undefined,
          notes: formData.notes || undefined,
        };
      },

      validate: (serviceType: ServiceType): string[] => {
        const validationErrors: string[] = [];

        const outerBeforeTouched = isDataTouched(formData.outerBeforeData, defaultSlideData);
        const outerDataTouched = isDataTouched(formData.outerAfterData, defaultSlideData);
        const innerBeforeTouched = isDataTouched(formData.innerBeforeData, defaultSlideData);
        const innerDataTouched = isDataTouched(formData.innerAfterData, defaultSlideData);

        // For maintenance, check if before measurements are included (this would need to be tracked)
        // Since SlideForm handles the checkbox internally, we'll check if before data is touched
        if (serviceType === ServiceType.MAINTENANCE && (outerBeforeTouched || innerBeforeTouched)) {
          // If any before data is touched, both must be filled
          if (!outerBeforeTouched || !innerBeforeTouched) {
            validationErrors.push(
              'Slide: When "Include measurements before maintenance" is checked, you must fill all "Before" sections (Outer Before and Inner Before)',
            );
          } else {
            validationErrors.push(
              ...validateSlideData(formData.outerBeforeData).map((e) => `Slide Outer Before: ${e}`),
            );
            validationErrors.push(
              ...validateSlideData(formData.innerBeforeData).map((e) => `Slide Inner Before: ${e}`),
            );
          }
        }

        // Validate current/after data if touched
        if (outerDataTouched) {
          validationErrors.push(
            ...validateSlideData(formData.outerAfterData).map((e) => `Slide Outer: ${e}`),
          );
        }
        if (innerDataTouched) {
          validationErrors.push(
            ...validateSlideData(formData.innerAfterData).map((e) => `Slide Inner: ${e}`),
          );
        }

        // For inspections and maintenance, require at least one section to be filled
        if (!outerDataTouched && !innerDataTouched) {
          validationErrors.push('Slide: You must fill at least one section (Outer or Inner)');
        }

        return validationErrors;
      },

      reset: () => {
        setFormData({
          outerBeforeData: defaultSlideData,
          outerAfterData: defaultSlideData,
          innerBeforeData: defaultSlideData,
          innerAfterData: defaultSlideData,
          parallelism: ParallelismType.DNC,
          hasParallelismBeenAdjusted: YesNoNaDncType.DNC,
          outerShutheightIndicatorsChecked: YesNoDncType.DNC,
          outerOverloadsOnTonnageMonitor: '',
          outerShutheightActualSh: '',
          outerIndicatorReading: '',
          innerShutheightIndicatorsChecked: YesNoDncType.DNC,
          innerOverloadsOnTonnageMonitor: '',
          innerShutheightActualSh: '',
          innerIndicatorReading: '',
          notes: '',
        });
        setErrors({
          outerBefore: {},
          outerAfter: {},
          innerBefore: {},
          innerAfter: {},
        });
      },
    }));

    return (
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="w-full">
          <div className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors flex items-center justify-between">
            <h3 className="text-base font-semibold">Slide</h3>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border border-t-0 rounded-b-lg p-6 bg-card">
            <SlideForm
              data={formData}
              updateFn={updateField}
              errors={errors}
              handleBlur={handleBlur}
              serviceType={serviceType}
              onSectionTouched={onSectionTouched}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
);

SlideSection.displayName = 'SlideSection';
