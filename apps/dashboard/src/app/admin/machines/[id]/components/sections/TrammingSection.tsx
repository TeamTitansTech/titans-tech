'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type TrammingData, ServiceType, YesNoDncType } from '@/data/types/services.types';
import { TrammingForm } from '../forms/TrammingForm';
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

export const defaultTrammingData: TrammingData = {
  // Top Position (4 measurements around trim pin)
  topTop: 0,
  topBottom: 0,
  topLeft: 0,
  topRight: 0,
  // Bottom Position (4 measurements around trim pin)
  bottomTop: 0,
  bottomBottom: 0,
  bottomLeft: 0,
  bottomRight: 0,
  // Left Position (4 measurements around trim pin)
  leftTop: 0,
  leftBottom: 0,
  leftLeft: 0,
  leftRight: 0,
  // Right Position (4 measurements around trim pin)
  rightTop: 0,
  rightBottom: 0,
  rightLeft: 0,
  rightRight: 0,
};

export const validateTrammingData = (data: TrammingData): string[] => {
  return validateNumericFields(data, ['top', 'bottom', 'left', 'right']);
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
  initialData?: TrammingSectionData;
}

export const TrammingSection = forwardRef<TrammingSectionRef, TrammingSectionProps>(
  ({ isOpen: _isOpen, onOpenChange: _onOpenChange, onSectionTouched, initialData }, ref) => {
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
    const [notes, setNotes] = useState<string>(initialData?.notes || '');
    const [outerErrors, setOuterErrors] = useState<Record<string, string>>({});
    const [innerErrors, setInnerErrors] = useState<Record<string, string>>({});

    const updateOuterField = (field: keyof TrammingData, value: number | undefined) => {
      setOuterData((prev) => ({ ...prev, [field]: value ?? 0 }));
      onSectionTouched?.();
    };

    const updateInnerField = (field: keyof TrammingData, value: number | undefined) => {
      setInnerData((prev) => ({ ...prev, [field]: value ?? 0 }));
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

    const tMeasurements = useTranslations('measurements');

    return (
      <div className="space-y-6 p-4">
        {/* Slide Tram Dropdown */}
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

        {/* Tabs for Outer/Inner */}
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">
              <span className="hidden sm:inline">{tMeasurements('outerMeasurements')}</span>
              <span className="sm:hidden">Outer</span>
            </TabsTrigger>
            <TabsTrigger value="inner">
              <span className="hidden sm:inline">{tMeasurements('innerMeasurements')}</span>
              <span className="sm:hidden">Inner</span>
            </TabsTrigger>
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
