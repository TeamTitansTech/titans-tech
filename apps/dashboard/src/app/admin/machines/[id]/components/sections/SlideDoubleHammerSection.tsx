'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTranslations } from 'next-intl';
import {
  type SlideData,
  type Attachment,
  ParallelismType,
  ServiceType,
  YesNoNaDncType,
  YesNoDncType,
} from '@/data/types/services.types';
import { SlideDoubleHammerForm } from '../forms/SlideDoubleHammerForm';
import { isDataTouched } from './utils';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

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

// Helper to convert a value to a number or undefined (preserves empty inputs)
function toNumberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
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

  // Check if required before positions (1, 3, 4) are filled
  const hasBeforeData =
    formData.beforePosition1 !== undefined &&
    formData.beforePosition3 !== undefined &&
    formData.beforePosition4 !== undefined;

  const beforeData: SlideData | undefined = hasBeforeData
    ? {
        ...metadata,
        position1: toNumberOrUndefined(formData.beforePosition1),
        position2: toNumberOrUndefined(formData.beforePosition2),
        position3: toNumberOrUndefined(formData.beforePosition3),
        position4: toNumberOrUndefined(formData.beforePosition4),
        position5: toNumberOrUndefined(formData.beforePosition5),
      }
    : undefined;

  const afterData: SlideData = {
    ...metadata,
    position1: toNumberOrUndefined(formData.afterPosition1),
    position2: toNumberOrUndefined(formData.afterPosition2),
    position3: toNumberOrUndefined(formData.afterPosition3),
    position4: toNumberOrUndefined(formData.afterPosition4),
    position5: toNumberOrUndefined(formData.afterPosition5),
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

  // Required positions: 1, 3, 4 (positions 2 and 5 are optional)
  const requiredAfterPositions: Array<{ field: keyof SlideFormData; name: string }> = [
    { field: 'afterPosition1', name: '1' },
    { field: 'afterPosition3', name: '3' },
    { field: 'afterPosition4', name: '4' },
  ];

  requiredAfterPositions.forEach(({ field, name }) => {
    if (!isValidNumber(data[field])) {
      errors.push(`Position ${name} is required`);
    }
  });

  // If hasParallelismBeenAdjusted is YES, required before positions (1, 3, 4) must be filled
  if (data.hasParallelismBeenAdjusted === YesNoNaDncType.YES) {
    const requiredBeforePositions: Array<{ field: keyof SlideFormData; name: string }> = [
      { field: 'beforePosition1', name: '1' },
      { field: 'beforePosition3', name: '3' },
      { field: 'beforePosition4', name: '4' },
    ];

    requiredBeforePositions.forEach(({ field, name }) => {
      if (!isValidNumber(data[field])) {
        errors.push(`Before position ${name} is required when parallelism has been adjusted`);
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
  attachments?: Attachment[];
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

  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
  const [errors, setErrors] = useState({
    outer: {} as Record<string, string>,
    inner: {} as Record<string, string>,
  });

  // Generic update function for any field in formData
  const updateField = <K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate individual field - undefined is valid (optional fields)
  const validateField = (value: number | undefined): string => {
    if (value === undefined || value === null) return '';
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
        // Handle position required errors
        const positionMatch = error.match(/^Position (\d+) is required$/);
        if (positionMatch) {
          return t('form.slide.validation.positionRequired', { position: positionMatch[1] });
        }
        const beforePositionMatch = error.match(/^Before position (\d+) is required/);
        if (beforePositionMatch) {
          return t('form.slide.validation.beforePositionRequired', {
            position: beforePositionMatch[1],
          });
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
            attachments,
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
        attachments,
      };
    },

    validate: (_serviceType: ServiceType): string[] => {
      const validationErrors: string[] = [];

      const outerDataTouched = isDataTouched(formData.outerData, initialFormData.outerData);
      const innerDataTouched = isDataTouched(formData.innerData, initialFormData.innerData);

      // Helper to translate error messages
      const translateError = (error: string): string => {
        // Handle position required errors
        const positionMatch = error.match(/^Position (\d+) is required$/);
        if (positionMatch) {
          return t('form.slide.validation.positionRequired', { position: positionMatch[1] });
        }
        const beforePositionMatch = error.match(/^Before position (\d+) is required/);
        if (beforePositionMatch) {
          return t('form.slide.validation.beforePositionRequired', {
            position: beforePositionMatch[1],
          });
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
        <div className="rounded-b-lg bg-card space-y-6">
          <SlideDoubleHammerForm
            data={formData}
            updateFn={updateField}
            errors={errors}
            handleBlur={handleBlur}
            onSectionTouched={onSectionTouched}
          />

          {/* Section Attachments */}
          <div className="pt-4 border-t">
            <Typography variant="h4" className="mb-3">
              {t('form.common.attachments')}
            </Typography>
            <DocumentUpload
              value={attachments}
              onChange={(files) => {
                setAttachments(files);
                onSectionTouched?.();
              }}
              maxFiles={10}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

SlideDoubleHammerSection.displayName = 'SlideDoubleHammerSection';
