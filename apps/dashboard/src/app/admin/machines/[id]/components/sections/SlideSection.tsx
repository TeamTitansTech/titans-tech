'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  type SlideData,
  ParallelismType,
  ServiceType,
  YesNoNaDncType,
  YesNoDncType,
} from '@/data/types/services.types';
import { SlideForm } from '../forms/SlideForm';
import { isDataTouched } from './utils';

export const defaultSlideData: SlideData = {
  // Parallelism configuration
  parallelism: ParallelismType.DNC,
  hasParallelismBeenAdjusted: YesNoNaDncType.DNC,

  // Shutheight fields
  shutheightIndicatorsChecked: YesNoDncType.DNC,
  overloadsOnTonnageMonitor: '',
  shutheightActualSh: '',
  indicatorReading: '',

  // Before measurements (optional)
  beforePosition1: undefined,
  beforePosition2: undefined,
  beforePosition3: undefined,
  beforePosition4: undefined,
  beforePosition5: undefined,

  // After/Current measurements (required)
  afterPosition1: 0,
  afterPosition2: 0,
  afterPosition3: 0,
  afterPosition4: 0,
  afterPosition5: 0,
};

export const validateSlideData = (data: SlideData): string[] => {
  const errors: string[] = [];
  const requiredFields: (keyof SlideData)[] = [
    'afterPosition1',
    'afterPosition2',
    'afterPosition3',
    'afterPosition4',
    'afterPosition5',
  ];

  requiredFields.forEach((field) => {
    const value = data[field];
    if (value !== undefined && (typeof value !== 'number' || isNaN(value))) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  // If hasParallelismBeenAdjusted is YES, before measurements should be filled
  if (data.hasParallelismBeenAdjusted === YesNoNaDncType.YES) {
    const beforeFields: (keyof SlideData)[] = [
      'beforePosition1',
      'beforePosition2',
      'beforePosition3',
      'beforePosition4',
      'beforePosition5',
    ];

    beforeFields.forEach((field) => {
      const value = data[field];
      if (value === undefined || value === null || isNaN(value)) {
        errors.push(`${String(field)} is required when hasParallelismBeenAdjusted is YES`);
      }
    });
  }

  return errors;
};

export interface SlideSectionData {
  outerData?: SlideData;
  innerData?: SlideData;
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
  initialData?: SlideSectionData;
}

export const SlideSection = forwardRef<SlideSectionRef, SlideSectionProps>(
  ({ isOpen, onOpenChange, onSectionTouched, serviceType, initialData }, ref) => {
    // Store initial loaded data for "touched" detection
    const [initialFormData] = useState({
      outerData: initialData?.outerData || defaultSlideData,
      innerData: initialData?.innerData || defaultSlideData,
    });

    // All slide data in a single state object
    const [formData, setFormData] = useState({
      outerData: initialData?.outerData || defaultSlideData,
      innerData: initialData?.innerData || defaultSlideData,
      notes: initialData?.notes || '',
    });

    const [errors, setErrors] = useState({
      outer: {} as Record<string, string>,
      inner: {} as Record<string, string>,
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
    const handleBlur = (section: 'outer' | 'inner', field: keyof SlideData) => {
      const dataToValidate = section === 'outer' ? formData.outerData : formData.innerData;
      const value = (dataToValidate as any)[field];
      const error = validateField(value);
      setErrors((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: error },
      }));
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        const outerDataTouched = isDataTouched(formData.outerData, initialFormData.outerData);
        const innerDataTouched = isDataTouched(formData.innerData, initialFormData.innerData);

        return outerDataTouched || innerDataTouched;
      },

      validateAndGetData: (
        _serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: SlideSectionData } => {
        const validationErrors: string[] = [];

        const outerDataTouched = isDataTouched(formData.outerData, initialFormData.outerData);
        const innerDataTouched = isDataTouched(formData.innerData, initialFormData.innerData);

        // Validate current data if touched
        if (outerDataTouched) {
          validationErrors.push(
            ...validateSlideData(formData.outerData).map((e) => `Slide Outer: ${e}`),
          );
        }
        if (innerDataTouched) {
          validationErrors.push(
            ...validateSlideData(formData.innerData).map((e) => `Slide Inner: ${e}`),
          );
        }

        // Check if there's any existing data (either initial or modified)
        const hasOuterData =
          outerDataTouched || isDataTouched(initialFormData.outerData, defaultSlideData);
        const hasInnerData =
          innerDataTouched || isDataTouched(initialFormData.innerData, defaultSlideData);

        // For inspections and maintenance, require at least one section to be filled
        if (!hasOuterData && !hasInnerData) {
          validationErrors.push('Slide: You must fill at least one section (Outer or Inner)');
        }

        const isValid = validationErrors.length === 0;

        // Only return data if valid
        if (isValid) {
          return {
            isValid: true,
            errors: [],
            data: {
              outerData: hasOuterData
                ? outerDataTouched
                  ? formData.outerData
                  : initialFormData.outerData
                : undefined,
              innerData: hasInnerData
                ? innerDataTouched
                  ? formData.innerData
                  : initialFormData.innerData
                : undefined,
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
        const outerDataTouched = isDataTouched(formData.outerData, initialFormData.outerData);
        const innerDataTouched = isDataTouched(formData.innerData, initialFormData.innerData);

        // Check if there's any existing data (either initial or modified)
        const hasOuterData =
          outerDataTouched || isDataTouched(initialFormData.outerData, defaultSlideData);
        const hasInnerData =
          innerDataTouched || isDataTouched(initialFormData.innerData, defaultSlideData);

        return {
          outerData: hasOuterData
            ? outerDataTouched
              ? formData.outerData
              : initialFormData.outerData
            : undefined,
          innerData: hasInnerData
            ? innerDataTouched
              ? formData.innerData
              : initialFormData.innerData
            : undefined,
          notes: formData.notes || undefined,
        };
      },

      validate: (_serviceType: ServiceType): string[] => {
        const validationErrors: string[] = [];

        const outerDataTouched = isDataTouched(formData.outerData, initialFormData.outerData);
        const innerDataTouched = isDataTouched(formData.innerData, initialFormData.innerData);

        // Validate current data if touched
        if (outerDataTouched) {
          validationErrors.push(
            ...validateSlideData(formData.outerData).map((e) => `Slide Outer: ${e}`),
          );
        }
        if (innerDataTouched) {
          validationErrors.push(
            ...validateSlideData(formData.innerData).map((e) => `Slide Inner: ${e}`),
          );
        }

        // Check if there's any existing data (either initial or modified)
        const hasOuterData =
          outerDataTouched || isDataTouched(initialFormData.outerData, defaultSlideData);
        const hasInnerData =
          innerDataTouched || isDataTouched(initialFormData.innerData, defaultSlideData);

        // For inspections and maintenance, require at least one section to be filled
        if (!hasOuterData && !hasInnerData) {
          validationErrors.push('Slide: You must fill at least one section (Outer or Inner)');
        }

        return validationErrors;
      },

      reset: () => {
        setFormData({
          outerData: defaultSlideData,
          innerData: defaultSlideData,
          notes: '',
        });
        setErrors({
          outer: {},
          inner: {},
        });
      },
    }));

    return (
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="w-full"></CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border border-t-0 rounded-b-lg px-6 pb-6 pt-4 bg-card">
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
