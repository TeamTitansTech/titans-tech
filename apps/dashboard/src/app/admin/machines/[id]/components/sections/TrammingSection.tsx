'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceType, YesNoDncType, type Attachment } from '@/data/types/services.types';
import { TrammingForm, type TrammingDbData } from '../forms/TrammingForm';
import { isDataTouched } from './utils';
import { validateNumericFields } from '../utils/validateNumericFields';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

// Default tramming data using DB format (without outer/inner prefix)
// All fields are undefined to force user to fill them
export const defaultTrammingDbData: TrammingDbData = {
  topTop: undefined,
  topBottom: undefined,
  topLeft: undefined,
  topRight: undefined,
  bottomTop: undefined,
  bottomBottom: undefined,
  bottomLeft: undefined,
  bottomRight: undefined,
  leftTop: undefined,
  leftBottom: undefined,
  leftLeft: undefined,
  leftRight: undefined,
  rightTop: undefined,
  rightBottom: undefined,
  rightLeft: undefined,
  rightRight: undefined,
};

// Merge partial data with defaults to ensure all fields have number values
const mergeWithDefaults = (data: Partial<TrammingDbData> | undefined): TrammingDbData => ({
  ...defaultTrammingDbData,
  ...Object.fromEntries(
    Object.entries(data || {}).filter(([_, v]) => v !== undefined && v !== null),
  ),
});

export const validateTrammingDbData = (data: TrammingDbData): string[] => {
  // Only validate that filled values are valid numbers (all fields are optional)
  return validateNumericFields(data as Record<string, unknown>, ['top', 'bottom', 'left', 'right']);
};

export interface TrammingSectionData {
  outerData?: TrammingDbData;
  innerData?: TrammingDbData;
  slideTram?: YesNoDncType;
  notes?: string;
  attachments?: Attachment[];
}

export interface TrammingSectionRef {
  getData: () => TrammingSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: TrammingSectionData;
  };
}

interface TrammingSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
  initialData?: TrammingSectionData;
}

export const TrammingSection = forwardRef<TrammingSectionRef, TrammingSectionProps>(
  ({ isOpen: _isOpen, onOpenChange: _onOpenChange, onSectionTouched, initialData }, ref) => {
    // Store the initial loaded data to compare against for "touched" detection
    const [initialOuterData] = useState<TrammingDbData>(() =>
      mergeWithDefaults(initialData?.outerData as Partial<TrammingDbData>),
    );
    const [initialInnerData] = useState<TrammingDbData>(() =>
      mergeWithDefaults(initialData?.innerData as Partial<TrammingDbData>),
    );

    const [outerData, setOuterData] = useState<TrammingDbData>(() =>
      mergeWithDefaults(initialData?.outerData as Partial<TrammingDbData>),
    );
    const [innerData, setInnerData] = useState<TrammingDbData>(() =>
      mergeWithDefaults(initialData?.innerData as Partial<TrammingDbData>),
    );
    const [slideTram, setSlideTram] = useState<YesNoDncType>(
      initialData?.slideTram || YesNoDncType.DNC,
    );
    const [notes, setNotes] = useState<string>(initialData?.notes || '');
    const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
    const [outerErrors, setOuterErrors] = useState<Record<string, string>>({});
    const [innerErrors, setInnerErrors] = useState<Record<string, string>>({});

    const updateOuterField = (field: keyof TrammingDbData, value: number | undefined) => {
      setOuterData((prev) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    const updateInnerField = (field: keyof TrammingDbData, value: number | undefined) => {
      setInnerData((prev) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    const updateSlideTram = (value: YesNoDncType) => {
      setSlideTram(value);
      onSectionTouched?.();
    };

    const validateField = (value: number | undefined): string => {
      if (value === undefined || value === null) {
        return 'This field is required';
      }
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Invalid number';
      }
      return '';
    };

    const handleBlurOuter = (field: keyof TrammingDbData) => {
      const error = validateField(outerData[field]);
      setOuterErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurInner = (field: keyof TrammingDbData) => {
      const error = validateField(innerData[field]);
      setInnerErrors((prev) => ({ ...prev, [field]: error }));
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);
        const initialNotes = initialData?.notes || '';
        return outerTouched || innerTouched || notes.trim() !== initialNotes.trim();
      },

      validateAndGetData: (
        _serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: TrammingSectionData } => {
        const validationErrors: string[] = [];

        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);

        // Validate touched data
        if (outerTouched) {
          validationErrors.push(
            ...validateTrammingDbData(outerData).map((e) => `Tramming Outer: ${e}`),
          );
        }
        if (innerTouched) {
          validationErrors.push(
            ...validateTrammingDbData(innerData).map((e) => `Tramming Inner: ${e}`),
          );
        }

        const isValid = validationErrors.length === 0;

        if (isValid) {
          return {
            isValid: true,
            errors: [],
            data: {
              outerData: outerData,
              innerData: innerData,
              slideTram: slideTram,
              notes: notes.trim() || undefined,
              attachments,
            },
          };
        }

        return {
          isValid: false,
          errors: validationErrors,
        };
      },

      getData: (): TrammingSectionData => {
        return {
          outerData: outerData,
          innerData: innerData,
          slideTram: slideTram,
          notes: notes.trim() || undefined,
          attachments,
        };
      },

      validate: (_serviceType: ServiceType): string[] => {
        const errors: string[] = [];

        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);

        // Only validate touched data
        if (outerTouched) {
          errors.push(...validateTrammingDbData(outerData).map((e) => `Tramming Outer: ${e}`));
        }
        if (innerTouched) {
          errors.push(...validateTrammingDbData(innerData).map((e) => `Tramming Inner: ${e}`));
        }

        return errors;
      },

      reset: () => {
        setOuterData(defaultTrammingDbData);
        setInnerData(defaultTrammingDbData);
        setSlideTram(YesNoDncType.DNC);
        setNotes('');
        setOuterErrors({});
        setInnerErrors({});
      },
    }));

    const tMeasurements = useTranslations('measurements');
    const tInspections = useTranslations('inspections');

    return (
      <div className="space-y-6">
        {/* Slide Tram Dropdown */}
        <div className="flex items-center gap-2">
          <Label htmlFor="slideTram" className="text-sm font-medium whitespace-nowrap">
            Slide Tram:
          </Label>
          <Select
            value={slideTram}
            onValueChange={(value) => updateSlideTram(value as YesNoDncType)}
          >
            <SelectTrigger
              id="slideTram"
              className="w-[140px]"
              clearable
              hasValue={!!slideTram}
              onClear={() => updateSlideTram('' as YesNoDncType)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={YesNoDncType.YES}>Yes</SelectItem>
              <SelectItem value={YesNoDncType.NO}>No</SelectItem>
              <SelectItem value={YesNoDncType.DNC}>DNC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs for Outer/Inner */}
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">
              <span className="hidden sm:inline">{tMeasurements('outerMeasurements')}</span>
              <span className="sm:hidden">Outer</span>
              <span className="text-destructive ml-1">*</span>
            </TabsTrigger>
            <TabsTrigger value="inner">
              <span className="hidden sm:inline">{tMeasurements('innerMeasurements')}</span>
              <span className="sm:hidden">Inner</span>
              <span className="text-destructive ml-1">*</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outer" className="mt-4">
            <TrammingForm
              data={outerData}
              errors={outerErrors}
              updateField={updateOuterField}
              handleBlur={handleBlurOuter}
            />
          </TabsContent>

          <TabsContent value="inner" className="mt-4">
            <TrammingForm
              data={innerData}
              errors={innerErrors}
              updateField={updateInnerField}
              handleBlur={handleBlurInner}
            />
          </TabsContent>
        </Tabs>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="tramming-notes">Notes (Optional)</Label>
          <Textarea
            id="tramming-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              onSectionTouched?.();
            }}
            placeholder="Add any additional notes or observations..."
            rows={4}
          />
        </div>

        {/* Section Attachments */}
        <div className="pt-4 border-t">
          <Typography variant="h4" className="mb-3">
            {tInspections('form.common.attachments')}
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
    );
  },
);

TrammingSection.displayName = 'TrammingSection';
