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
import { SlideDoubleHammerForm } from '../forms/SlideDoubleHammerForm';
import { isDataTouched } from './utils';

// UI type that combines before/after in one object for easier form handling
export interface SlideFormData {
  // Metadata (shared)
  parallelism?: ParallelismType;
  hasParallelismBeenAdjusted?: YesNoNaDncType;
  shutheightIndicatorsChecked?: YesNoDncType;
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
  parallelism: undefined,
  hasParallelismBeenAdjusted: undefined,
  shutheightIndicatorsChecked: undefined,
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

// Convert API data (4 separate SlideData objects) to UI form data
function convertToFormData(
  beforeData: SlideData | undefined,
  afterData: SlideData | undefined,
): SlideFormData {
  const metadata = afterData || beforeData || ({} as Partial<SlideData>);

  return {
    // Metadata from either record (prefer afterData)
    parallelism: metadata.parallelism,
    hasParallelismBeenAdjusted: metadata.hasParallelismBeenAdjusted,
    shutheightIndicatorsChecked: metadata.shutheightIndicatorsChecked,
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
    afterPosition1: afterData?.position1,
    afterPosition2: afterData?.position2,
    afterPosition3: afterData?.position3,
    afterPosition4: afterData?.position4,
    afterPosition5: afterData?.position5,
  };
}

// Helper to ensure a value is a number with proper precision (4 decimal places)
function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Convert UI form data to API data (2 separate SlideData objects)
function convertFromFormData(formData: SlideFormData): {
  beforeData: SlideData | undefined;
  afterData: SlideData;
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

  const afterData: SlideData = {
    ...metadata,
    position1: toNumber(formData.afterPosition1),
    position2: toNumber(formData.afterPosition2),
    position3: toNumber(formData.afterPosition3),
    position4: toNumber(formData.afterPosition4),
    position5: toNumber(formData.afterPosition5),
  };

  return { beforeData, afterData };
}

// Validate form data (with before/after fields)
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

export interface SlideDoubleHammerSectionData {
  outerBefore?: SlideData;
  outerData?: SlideData;
  innerBefore?: SlideData;
  innerData?: SlideData;
  notes?: string;
}

export interface SlideDoubleHammerSectionRef {
  getData: () => SlideDoubleHammerSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: SlideDoubleHammerSectionData;
  };
}

interface SlideDoubleHammerSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
  initialData?: SlideDoubleHammerSectionData;
}

export const SlideDoubleHammerSection = forwardRef<
  SlideDoubleHammerSectionRef,
  SlideDoubleHammerSectionProps
>(({ isOpen, onOpenChange, onSectionTouched, initialData }, ref) => {
  const t = useTranslations('inspections');

  // Convert API data (4 objects) to form data (2 objects with before/after fields)
  const initialOuterFormData = convertToFormData(initialData?.outerBefore, initialData?.outerData);
  const initialInnerFormData = convertToFormData(initialData?.innerBefore, initialData?.innerData);

  // Store initial loaded data for "touched" detection
  const [initialFormData] = useState({
    outerData: initialOuterFormData,
    innerData: initialInnerFormData,
  });

  // All slide data in a single state object
  const [formData, setFormData] = useState({
    outerData: initialOuterFormData,
    innerData: initialInnerFormData,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({
    outer: {} as Record<string, string>,
    inner: {} as Record<string, string>,
  });

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
  const handleBlur = (section: 'outer' | 'inner', field: keyof SlideFormData) => {
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
    ): { isValid: boolean; errors: string[]; data?: SlideDoubleHammerSectionData } => {
      const validationErrors: string[] = [];

      const outerDataTouched = isDataTouched(formData.outerData, initialFormData.outerData);
      const innerDataTouched = isDataTouched(formData.innerData, initialFormData.innerData);

      // Helper to translate error messages
      const translateError = (error: string): string => {
        if (error === 'At least 2 max deviation points are required') {
          return t('form.slide.validation.atLeastTwoPositionsRequired');
        }
        return error;
      };

      // Validate current data if touched
      if (outerDataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.outerData).map(
            (e) => `${t('form.slide.validation.outerPrefix')}: ${translateError(e)}`,
          ),
        );
      }
      if (innerDataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.innerData).map(
            (e) => `${t('form.slide.validation.innerPrefix')}: ${translateError(e)}`,
          ),
        );
      }

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerDataTouched || isDataTouched(initialFormData.outerData, defaultSlideFormData);
      const hasInnerData =
        innerDataTouched || isDataTouched(initialFormData.innerData, defaultSlideFormData);

      // For inspections and maintenance, require at least one section to be filled
      if (!hasOuterData && !hasInnerData) {
        validationErrors.push(t('form.slide.validation.atLeastOneSectionRequired'));
      }

      const isValid = validationErrors.length === 0;

      // Only return data if valid
      if (isValid) {
        // Convert form data (with before/after fields) back to API format (4 separate objects)
        const outerFormDataToUse = outerDataTouched
          ? formData.outerData
          : initialFormData.outerData;
        const innerFormDataToUse = innerDataTouched
          ? formData.innerData
          : initialFormData.innerData;

        const outer = hasOuterData
          ? convertFromFormData(outerFormDataToUse)
          : { beforeData: undefined, afterData: undefined };
        const inner = hasInnerData
          ? convertFromFormData(innerFormDataToUse)
          : { beforeData: undefined, afterData: undefined };

        return {
          isValid: true,
          errors: [],
          data: {
            outerBefore: outer.beforeData,
            outerData: outer.afterData,
            innerBefore: inner.beforeData,
            innerData: inner.afterData,
            notes: formData.notes || undefined,
          },
        };
      }

      return {
        isValid: false,
        errors: validationErrors,
      };
    },

    getData: (): SlideDoubleHammerSectionData => {
      const outerDataTouched = isDataTouched(formData.outerData, initialFormData.outerData);
      const innerDataTouched = isDataTouched(formData.innerData, initialFormData.innerData);

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerDataTouched || isDataTouched(initialFormData.outerData, defaultSlideFormData);
      const hasInnerData =
        innerDataTouched || isDataTouched(initialFormData.innerData, defaultSlideFormData);

      // Convert form data back to API format (4 separate objects)
      const outerFormDataToUse = outerDataTouched ? formData.outerData : initialFormData.outerData;
      const innerFormDataToUse = innerDataTouched ? formData.innerData : initialFormData.innerData;

      const outer = hasOuterData
        ? convertFromFormData(outerFormDataToUse)
        : { beforeData: undefined, afterData: undefined };
      const inner = hasInnerData
        ? convertFromFormData(innerFormDataToUse)
        : { beforeData: undefined, afterData: undefined };

      return {
        outerBefore: outer.beforeData,
        outerData: outer.afterData,
        innerBefore: inner.beforeData,
        innerData: inner.afterData,
        notes: formData.notes || undefined,
      };
    },

    validate: (_serviceType: ServiceType): string[] => {
      const validationErrors: string[] = [];

      const outerDataTouched = isDataTouched(formData.outerData, initialFormData.outerData);
      const innerDataTouched = isDataTouched(formData.innerData, initialFormData.innerData);

      // Helper to translate error messages
      const translateError = (error: string): string => {
        if (error === 'At least 2 max deviation points are required') {
          return t('form.slide.validation.atLeastTwoPositionsRequired');
        }
        return error;
      };

      // Validate current data if touched
      if (outerDataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.outerData).map(
            (e) => `${t('form.slide.validation.outerPrefix')}: ${translateError(e)}`,
          ),
        );
      }
      if (innerDataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.innerData).map(
            (e) => `${t('form.slide.validation.innerPrefix')}: ${translateError(e)}`,
          ),
        );
      }

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerDataTouched || isDataTouched(initialFormData.outerData, defaultSlideFormData);
      const hasInnerData =
        innerDataTouched || isDataTouched(initialFormData.innerData, defaultSlideFormData);

      // For inspections and maintenance, require at least one section to be filled
      if (!hasOuterData && !hasInnerData) {
        validationErrors.push(t('form.slide.validation.atLeastOneSectionRequired'));
      }

      return validationErrors;
    },

    reset: () => {
      setFormData({
        outerData: defaultSlideFormData,
        innerData: defaultSlideFormData,
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
        <div className="rounded-b-lg bg-card">
          <SlideDoubleHammerForm
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

SlideDoubleHammerSection.displayName = 'SlideDoubleHammerSection';
