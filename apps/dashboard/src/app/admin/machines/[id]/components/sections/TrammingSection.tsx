'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type TrammingData, ServiceType, YesNoDncType } from '@/data/types/services.types';
import { TrammingForm } from '../forms/TrammingForm';
import { isDataTouched } from './utils';
import { SectionContainer } from '../shared/SectionContainer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const defaultTrammingData: TrammingData = {
  // OUTER SECTION
  outerTopTop: 0,
  outerTopBottom: 0,
  outerTopLeft: 0,
  outerTopRight: 0,
  outerBottomTop: 0,
  outerBottomBottom: 0,
  outerBottomLeft: 0,
  outerBottomRight: 0,
  outerLeftTop: 0,
  outerLeftBottom: 0,
  outerLeftLeft: 0,
  outerLeftRight: 0,
  outerRightTop: 0,
  outerRightBottom: 0,
  outerRightLeft: 0,
  outerRightRight: 0,
  // INNER SECTION
  innerTopTop: 0,
  innerTopBottom: 0,
  innerTopLeft: 0,
  innerTopRight: 0,
  innerBottomTop: 0,
  innerBottomBottom: 0,
  innerBottomLeft: 0,
  innerBottomRight: 0,
  innerLeftTop: 0,
  innerLeftBottom: 0,
  innerLeftLeft: 0,
  innerLeftRight: 0,
  innerRightTop: 0,
  innerRightBottom: 0,
  innerRightLeft: 0,
  innerRightRight: 0,
};

export const validateTrammingData = (data: TrammingData): string[] => {
  const errors: string[] = [];

  // Get all numeric field keys from the data (exclude any that might be undefined)
  const fieldsToValidate = Object.keys(data).filter(
    (key) => key.startsWith('outer') || key.startsWith('inner')
  ) as (keyof TrammingData)[];

  fieldsToValidate.forEach((field) => {
    const value = data[field];
    // Only validate if the field exists in the data (not undefined)
    if (value !== undefined && (typeof value !== 'number' || isNaN(value))) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
};

export interface TrammingSectionData {
  outerData?: TrammingData;
  innerData?: TrammingData;
  slideTram?: YesNoDncType;
  notes?: string;
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
  initialData?: any; // TrammingCheck data from API
}

export const TrammingSection = forwardRef<TrammingSectionRef, TrammingSectionProps>(
  ({ isOpen, onOpenChange, onSectionTouched, initialData }, ref) => {
    // Store the initial loaded data to compare against for "touched" detection
    const [initialOuterData] = useState<TrammingData>(
      initialData?.outerData || defaultTrammingData,
    );
    const [initialInnerData] = useState<TrammingData>(
      initialData?.innerData || defaultTrammingData,
    );

    const [outerData, setOuterData] = useState<TrammingData>(
      initialData?.outerData || defaultTrammingData,
    );
    const [innerData, setInnerData] = useState<TrammingData>(
      initialData?.innerData || defaultTrammingData,
    );
    const [slideTram, setSlideTram] = useState<YesNoDncType>(
      initialData?.slideTram || YesNoDncType.DNC,
    );
    const [unit, setUnit] = useState<'inches' | 'mm' | 'cm'>('inches');
    const [notes, setNotes] = useState<string>(initialData?.notes || '');
    const [outerErrors, setOuterErrors] = useState<Record<string, string>>({});
    const [innerErrors, setInnerErrors] = useState<Record<string, string>>({});

    const updateOuterField = (field: keyof TrammingData, value: number) => {
      setOuterData((prev) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    const updateInnerField = (field: keyof TrammingData, value: number) => {
      setInnerData((prev) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    const updateSlideTram = (value: YesNoDncType) => {
      setSlideTram(value);
      onSectionTouched?.();
    };

    const validateField = (value: number): string => {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Invalid number';
      }
      return '';
    };

    const handleBlurOuter = (field: keyof TrammingData) => {
      const error = validateField(outerData[field]);
      setOuterErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurInner = (field: keyof TrammingData) => {
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

        // Validate touched data (only validate if user has modified the data)
        if (outerTouched) {
          validationErrors.push(
            ...validateTrammingData(outerData).map((e) => `Tramming Outer: ${e}`),
          );
        }
        if (innerTouched) {
          validationErrors.push(
            ...validateTrammingData(innerData).map((e) => `Tramming Inner: ${e}`),
          );
        }

        // Check if there's any existing data (either initial or modified)
        const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultTrammingData);
        const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultTrammingData);

        // Require at least one section to be filled (either initial or new)
        if (!hasOuterData && !hasInnerData) {
          validationErrors.push('Tramming: You must fill at least one section (Outer or Inner)');
        }

        const isValid = validationErrors.length === 0;

        if (isValid) {
          // Return modified data OR initial data if it exists
          const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultTrammingData);
          const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultTrammingData);

          return {
            isValid: true,
            errors: [],
            data: {
              outerData: hasOuterData ? (outerTouched ? outerData : initialOuterData) : undefined,
              innerData: hasInnerData ? (innerTouched ? innerData : initialInnerData) : undefined,
              slideTram: slideTram,
              notes: notes.trim() || undefined,
            },
          };
        }

        return {
          isValid: false,
          errors: validationErrors,
        };
      },

      getData: (): TrammingSectionData => {
        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);
        const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultTrammingData);
        const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultTrammingData);

        return {
          outerData: hasOuterData ? (outerTouched ? outerData : initialOuterData) : undefined,
          innerData: hasInnerData ? (innerTouched ? innerData : initialInnerData) : undefined,
          slideTram: slideTram,
          notes: notes.trim() || undefined,
        };
      },

      validate: (_serviceType: ServiceType): string[] => {
        const errors: string[] = [];

        const outerTouched = isDataTouched(outerData, initialOuterData);
        const innerTouched = isDataTouched(innerData, initialInnerData);

        // Only validate if user has modified the data
        if (outerTouched) {
          errors.push(...validateTrammingData(outerData).map((e) => `Tramming Outer: ${e}`));
        }
        if (innerTouched) {
          errors.push(...validateTrammingData(innerData).map((e) => `Tramming Inner: ${e}`));
        }

        // Check if there's any existing data (either initial or modified)
        const hasOuterData = outerTouched || isDataTouched(initialOuterData, defaultTrammingData);
        const hasInnerData = innerTouched || isDataTouched(initialInnerData, defaultTrammingData);

        // Require at least one section to be filled (either initial or new)
        if (!hasOuterData && !hasInnerData) {
          errors.push('Tramming: You must fill at least one section (Outer or Inner)');
        }

        return errors;
      },

      reset: () => {
        setOuterData(defaultTrammingData);
        setInnerData(defaultTrammingData);
        setSlideTram(YesNoDncType.DNC);
        setNotes('');
        setOuterErrors({});
        setInnerErrors({});
      },
    }));

    return (
      <div className="space-y-6 p-4">
        {/* Slide Tram and Unit Dropdowns */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="slideTram" className="text-sm font-medium whitespace-nowrap">
              Slide Tram:
            </Label>
            <Select
              value={slideTram}
              onValueChange={(value) => updateSlideTram(value as YesNoDncType)}
            >
              <SelectTrigger id="slideTram" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={YesNoDncType.YES}>Yes</SelectItem>
                <SelectItem value={YesNoDncType.NO}>No</SelectItem>
                <SelectItem value={YesNoDncType.DNC}>DNC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="unit" className="text-sm font-medium whitespace-nowrap">
              Unit:
            </Label>
            <Select
              value={unit}
              onValueChange={(value) => setUnit(value as 'inches' | 'mm' | 'cm')}
            >
              <SelectTrigger id="unit" className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inches">inches</SelectItem>
                <SelectItem value="mm">mm</SelectItem>
                <SelectItem value="cm">cm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs for Outer/Inner */}
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">Outer Measurements</TabsTrigger>
            <TabsTrigger value="inner">Inner Measurements</TabsTrigger>
          </TabsList>

          <TabsContent value="outer" className="mt-4">
            <TrammingForm
              data={outerData}
              errors={outerErrors}
              updateField={updateOuterField}
              handleBlur={handleBlurOuter}
              title="Outer"
            />
          </TabsContent>

          <TabsContent value="inner" className="mt-4">
            <TrammingForm
              data={innerData}
              errors={innerErrors}
              updateField={updateInnerField}
              handleBlur={handleBlurInner}
              title="Inner"
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
      </div>
    );
  },
);

TrammingSection.displayName = 'TrammingSection';
