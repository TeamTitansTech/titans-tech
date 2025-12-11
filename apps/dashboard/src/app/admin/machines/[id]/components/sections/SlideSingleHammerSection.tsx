'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTranslations } from 'next-intl';
import {
  type SlideData,
  ParallelismType,
  ServiceType,
  YesNoNaDncType,
  YesNoDncType,
} from '@/data/types/services.types';
import { SlideSingleHammerForm } from '../forms/SlideSingleHammerForm';
import { isDataTouched } from './utils';

// UI type that combines before/after in one object for easier form handling
export interface SlideFormData {
  // Metadata (shared)
  parallelism: ParallelismType;
  hasParallelismBeenAdjusted: YesNoNaDncType;
  shutheightIndicatorsChecked: YesNoDncType;
  overloadsOnTonnageMonitor: string;
  shutheightActualSh: string;
  indicatorReading: string;

  // Before measurements (optional)
  beforePosition1?: number;
  beforePosition2?: number;
  beforePosition3?: number;
  beforePosition4?: number;
  beforePosition5?: number;

  // After/Current measurements (at least 2 required)
  afterPosition1?: number;
  afterPosition2?: number;
  afterPosition3?: number;
  afterPosition4?: number;
  afterPosition5?: number;
}

export const defaultSlideFormData: SlideFormData = {
  parallelism: ParallelismType.DNC,
  hasParallelismBeenAdjusted: YesNoNaDncType.DNC,
  shutheightIndicatorsChecked: YesNoDncType.DNC,
  overloadsOnTonnageMonitor: '',
  shutheightActualSh: '',
  indicatorReading: '',
  beforePosition1: undefined,
  beforePosition2: undefined,
  beforePosition3: undefined,
  beforePosition4: undefined,
  beforePosition5: undefined,
  afterPosition1: undefined,
  afterPosition2: undefined,
  afterPosition3: undefined,
  afterPosition4: undefined,
  afterPosition5: undefined,
};

// Helper to ensure a value is a number with proper precision (4 decimal places)
function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Convert API data to UI form data
function convertToFormData(
  beforeData: SlideData | undefined,
  data: SlideData | undefined,
): SlideFormData {
  const metadata = data || beforeData || ({} as Partial<SlideData>);

  return {
    // Metadata from either record (prefer data)
    parallelism: metadata.parallelism || ParallelismType.DNC,
    hasParallelismBeenAdjusted: metadata.hasParallelismBeenAdjusted || YesNoNaDncType.DNC,
    shutheightIndicatorsChecked: metadata.shutheightIndicatorsChecked || YesNoDncType.DNC,
    overloadsOnTonnageMonitor: metadata.overloadsOnTonnageMonitor || '',
    shutheightActualSh: metadata.shutheightActualSh || '',
    indicatorReading: metadata.indicatorReading || '',

    // Before measurements
    beforePosition1: beforeData?.position1,
    beforePosition2: beforeData?.position2,
    beforePosition3: beforeData?.position3,
    beforePosition4: beforeData?.position4,
    beforePosition5: beforeData?.position5,

    // After measurements - use undefined if not set (show empty inputs)
    afterPosition1: data?.position1,
    afterPosition2: data?.position2,
    afterPosition3: data?.position3,
    afterPosition4: data?.position4,
    afterPosition5: data?.position5,
  };
}

// Convert UI form data to API data
function convertFromFormData(formData: SlideFormData): {
  beforeData: SlideData | undefined;
  data: SlideData;
} {
  const metadata = {
    parallelism: formData.parallelism,
    hasParallelismBeenAdjusted: formData.hasParallelismBeenAdjusted,
    shutheightIndicatorsChecked: formData.shutheightIndicatorsChecked,
    overloadsOnTonnageMonitor: formData.overloadsOnTonnageMonitor,
    shutheightActualSh: formData.shutheightActualSh,
    indicatorReading: formData.indicatorReading,
  };

  const hasBeforeData =
    formData.beforePosition1 !== undefined &&
    formData.beforePosition2 !== undefined &&
    formData.beforePosition3 !== undefined &&
    formData.beforePosition4 !== undefined &&
    formData.beforePosition5 !== undefined;

  const beforeData: SlideData | undefined = hasBeforeData
    ? {
        ...metadata,
        position1: toNumber(formData.beforePosition1),
        position2: toNumber(formData.beforePosition2),
        position3: toNumber(formData.beforePosition3),
        position4: toNumber(formData.beforePosition4),
        position5: toNumber(formData.beforePosition5),
      }
    : undefined;

  const data: SlideData = {
    ...metadata,
    position1: toNumber(formData.afterPosition1),
    position2: toNumber(formData.afterPosition2),
    position3: toNumber(formData.afterPosition3),
    position4: toNumber(formData.afterPosition4),
    position5: toNumber(formData.afterPosition5),
  };

  return { beforeData, data };
}

// Validate form data
export const validateSlideFormData = (data: SlideFormData): string[] => {
  const errors: string[] = [];

  // Helper to check if a value is a valid number (0 is valid)
  const isValidNumber = (value: unknown): boolean => {
    if (value === undefined || value === null) return false;
    // Handle both number and string values (input fields may return strings)
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    return !isNaN(numValue);
  };

  // At least 2 after positions must be filled
  const afterPositions = [
    data.afterPosition1,
    data.afterPosition2,
    data.afterPosition3,
    data.afterPosition4,
    data.afterPosition5,
  ];

  const filledCount = afterPositions.filter((p) => isValidNumber(p)).length;
  if (filledCount < 2) {
    errors.push('At least 2 max deviation points are required');
  }

  // If hasParallelismBeenAdjusted is YES, before measurements should be filled
  if (data.hasParallelismBeenAdjusted === YesNoNaDncType.YES) {
    const beforeFields: Array<keyof SlideFormData> = [
      'beforePosition1',
      'beforePosition2',
      'beforePosition3',
      'beforePosition4',
      'beforePosition5',
    ];

    beforeFields.forEach((field) => {
      const value = data[field];
      if (!isValidNumber(value)) {
        errors.push(`${String(field)} is required when hasParallelismBeenAdjusted is YES`);
      }
    });
  }

  return errors;
};

// Single Hammer uses beforeData/data (no inner/outer distinction)
export interface SlideSingleHammerSectionData {
  beforeData?: SlideData;
  data?: SlideData;
  notes?: string;
}

export interface SlideSingleHammerSectionRef {
  getData: () => SlideSingleHammerSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: SlideSingleHammerSectionData;
  };
}

interface SlideSingleHammerSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
  initialData?: SlideSingleHammerSectionData;
}

export const SlideSingleHammerSection = forwardRef<
  SlideSingleHammerSectionRef,
  SlideSingleHammerSectionProps
>(({ isOpen, onOpenChange, onSectionTouched, initialData }, ref) => {
  const t = useTranslations('inspections');

  // Convert API data to form data
  const initialFormDataConverted = convertToFormData(initialData?.beforeData, initialData?.data);

  // Store initial loaded data for "touched" detection
  const [initialFormData] = useState({
    slideData: initialFormDataConverted,
  });

  // All slide data in a single state object
  const [formData, setFormData] = useState({
    slideData: initialFormDataConverted,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({} as Record<string, string>);

  // Generic update function for any field in formData
  const updateField = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
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
  const handleBlur = (field: keyof SlideFormData) => {
    const value = (formData.slideData as any)[field];
    const error = validateField(value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      return isDataTouched(formData.slideData, initialFormData.slideData);
    },

    validateAndGetData: (
      _serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: SlideSingleHammerSectionData } => {
      const validationErrors: string[] = [];

      const dataTouched = isDataTouched(formData.slideData, initialFormData.slideData);

      // Helper to translate error messages
      const translateError = (error: string): string => {
        if (error === 'At least 2 max deviation points are required') {
          return t('form.slide.validation.atLeastTwoPositionsRequired');
        }
        return error;
      };

      // Validate data if touched
      if (dataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.slideData).map((e) => `Slide: ${translateError(e)}`),
        );
      }

      // Check if there's any existing data (either initial or modified)
      const hasData = dataTouched || isDataTouched(initialFormData.slideData, defaultSlideFormData);

      // For single hammer, data is required
      if (!hasData) {
        validationErrors.push(t('form.slide.validation.measurementsRequired'));
      }

      const isValid = validationErrors.length === 0;

      // Only return data if valid
      if (isValid) {
        const formDataToUse = dataTouched ? formData.slideData : initialFormData.slideData;

        const converted = hasData
          ? convertFromFormData(formDataToUse)
          : { beforeData: undefined, data: undefined };

        return {
          isValid: true,
          errors: [],
          data: {
            beforeData: converted.beforeData,
            data: converted.data,
            notes: formData.notes || undefined,
          },
        };
      }

      return {
        isValid: false,
        errors: validationErrors,
      };
    },

    getData: (): SlideSingleHammerSectionData => {
      const dataTouched = isDataTouched(formData.slideData, initialFormData.slideData);

      // Check if there's any existing data (either initial or modified)
      const hasData = dataTouched || isDataTouched(initialFormData.slideData, defaultSlideFormData);

      const formDataToUse = dataTouched ? formData.slideData : initialFormData.slideData;

      const converted = hasData
        ? convertFromFormData(formDataToUse)
        : { beforeData: undefined, data: undefined };

      return {
        beforeData: converted.beforeData,
        data: converted.data,
        notes: formData.notes || undefined,
      };
    },

    validate: (_serviceType: ServiceType): string[] => {
      const validationErrors: string[] = [];

      const dataTouched = isDataTouched(formData.slideData, initialFormData.slideData);

      // Helper to translate error messages
      const translateError = (error: string): string => {
        if (error === 'At least 2 max deviation points are required') {
          return t('form.slide.validation.atLeastTwoPositionsRequired');
        }
        return error;
      };

      // Validate data if touched
      if (dataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.slideData).map((e) => `Slide: ${translateError(e)}`),
        );
      }

      // Check if there's any existing data (either initial or modified)
      const hasData = dataTouched || isDataTouched(initialFormData.slideData, defaultSlideFormData);

      // For single hammer, data is required
      if (!hasData) {
        validationErrors.push(t('form.slide.validation.measurementsRequired'));
      }

      return validationErrors;
    },

    reset: () => {
      setFormData({
        slideData: defaultSlideFormData,
        notes: '',
      });
      setErrors({});
    },
  }));

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full"></CollapsibleTrigger>
      <CollapsibleContent>
        <div className="rounded-b-lg bg-card">
          <SlideSingleHammerForm
            data={formData}
            updateFn={updateField}
            errors={errors}
            handleBlur={handleBlur}
            onSectionTouched={onSectionTouched}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

SlideSingleHammerSection.displayName = 'SlideSingleHammerSection';
