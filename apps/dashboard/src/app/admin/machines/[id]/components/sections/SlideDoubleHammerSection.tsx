'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { useTranslations } from 'next-intl';

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

  // After/Current measurements (required)
  afterPosition1: number;
  afterPosition2: number;
  afterPosition3: number;
  afterPosition4: number;
  afterPosition5: number;
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
  afterPosition1: 0,
  afterPosition2: 0,
  afterPosition3: 0,
  afterPosition4: 0,
  afterPosition5: 0,
};

// Convert API data (4 separate SlideData objects) to UI form data
function convertToFormData(
  beforeData: SlideData | undefined,
  afterData: SlideData | undefined,
): SlideFormData {
  const metadata = afterData || beforeData || ({} as Partial<SlideData>);

  return {
    // Metadata from either record (prefer afterData)
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

    // After measurements
    afterPosition1: afterData?.position1 || 0,
    afterPosition2: afterData?.position2 || 0,
    afterPosition3: afterData?.position3 || 0,
    afterPosition4: afterData?.position4 || 0,
    afterPosition5: afterData?.position5 || 0,
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

  // Helper to check if a value is a valid number
  const isValidNumber = (value: unknown): boolean => {
    if (value === undefined || value === null) return false;
    // Handle both number and string values (input fields may return strings)
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    return !isNaN(numValue);
  };

  // After positions are always required
  const afterFields: Array<keyof SlideFormData> = [
    'afterPosition1',
    'afterPosition2',
    'afterPosition3',
    'afterPosition4',
    'afterPosition5',
  ];

  afterFields.forEach((field) => {
    const value = data[field];
    if (!isValidNumber(value)) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

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

      // Validate current data if touched
      if (outerDataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.outerData).map((e) => `Slide Outer: ${e}`),
        );
      }
      if (innerDataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.innerData).map((e) => `Slide Inner: ${e}`),
        );
      }

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerDataTouched || isDataTouched(initialFormData.outerData, defaultSlideFormData);
      const hasInnerData =
        innerDataTouched || isDataTouched(initialFormData.innerData, defaultSlideFormData);

      // For inspections and maintenance, require at least one section to be filled
      if (!hasOuterData && !hasInnerData) {
        validationErrors.push('Slide: You must fill at least one section (Outer or Inner)');
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

      // Validate current data if touched
      if (outerDataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.outerData).map((e) => `Slide Outer: ${e}`),
        );
      }
      if (innerDataTouched) {
        validationErrors.push(
          ...validateSlideFormData(formData.innerData).map((e) => `Slide Inner: ${e}`),
        );
      }

      // Check if there's any existing data (either initial or modified)
      const hasOuterData =
        outerDataTouched || isDataTouched(initialFormData.outerData, defaultSlideFormData);
      const hasInnerData =
        innerDataTouched || isDataTouched(initialFormData.innerData, defaultSlideFormData);

      // For inspections and maintenance, require at least one section to be filled
      if (!hasOuterData && !hasInnerData) {
        validationErrors.push('Slide: You must fill at least one section (Outer or Inner)');
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
