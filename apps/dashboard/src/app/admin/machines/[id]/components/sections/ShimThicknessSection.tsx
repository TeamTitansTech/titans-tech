'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Attachment, ServiceType } from '@/data/types/services.types';
import { ShimThicknessForm, type ShimThicknessDbData } from '../forms/ShimThicknessForm';
import { isDataTouched } from './utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

// Default shim thickness data
export const defaultShimThicknessDbData: ShimThicknessDbData = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

// Merge partial data with defaults to ensure all fields have number values
const mergeWithDefaults = (
  data: Partial<ShimThicknessDbData> | undefined,
): ShimThicknessDbData => ({
  ...defaultShimThicknessDbData,
  ...Object.fromEntries(
    Object.entries(data || {}).filter(([_, v]) => v !== undefined && v !== null),
  ),
});

export interface ShimThicknessSectionData {
  outerLhData?: ShimThicknessDbData;
  outerRhData?: ShimThicknessDbData;
  innerLhData?: ShimThicknessDbData;
  innerRhData?: ShimThicknessDbData;
  notes?: string;
  attachments?: Attachment[];
}

export interface ShimThicknessSectionRef {
  getData: () => ShimThicknessSectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: ShimThicknessSectionData;
  };
}

interface ShimThicknessSectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
  initialData?: ShimThicknessSectionData;
}

export const ShimThicknessSection = forwardRef<ShimThicknessSectionRef, ShimThicknessSectionProps>(
  ({ isOpen: _isOpen, onOpenChange: _onOpenChange, onSectionTouched, initialData }, ref) => {
    // Store the initial loaded data to compare against for "touched" detection
    const [initialOuterLhData] = useState<ShimThicknessDbData>(() =>
      mergeWithDefaults(initialData?.outerLhData as Partial<ShimThicknessDbData>),
    );
    const [initialOuterRhData] = useState<ShimThicknessDbData>(() =>
      mergeWithDefaults(initialData?.outerRhData as Partial<ShimThicknessDbData>),
    );
    const [initialInnerLhData] = useState<ShimThicknessDbData>(() =>
      mergeWithDefaults(initialData?.innerLhData as Partial<ShimThicknessDbData>),
    );
    const [initialInnerRhData] = useState<ShimThicknessDbData>(() =>
      mergeWithDefaults(initialData?.innerRhData as Partial<ShimThicknessDbData>),
    );

    const [outerLhData, setOuterLhData] = useState<ShimThicknessDbData>(() =>
      mergeWithDefaults(initialData?.outerLhData as Partial<ShimThicknessDbData>),
    );
    const [outerRhData, setOuterRhData] = useState<ShimThicknessDbData>(() =>
      mergeWithDefaults(initialData?.outerRhData as Partial<ShimThicknessDbData>),
    );
    const [innerLhData, setInnerLhData] = useState<ShimThicknessDbData>(() =>
      mergeWithDefaults(initialData?.innerLhData as Partial<ShimThicknessDbData>),
    );
    const [innerRhData, setInnerRhData] = useState<ShimThicknessDbData>(() =>
      mergeWithDefaults(initialData?.innerRhData as Partial<ShimThicknessDbData>),
    );
    const [notes, setNotes] = useState<string>(initialData?.notes || '');
    const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);

    const [outerLhErrors, setOuterLhErrors] = useState<Record<string, string>>({});
    const [outerRhErrors, setOuterRhErrors] = useState<Record<string, string>>({});
    const [innerLhErrors, setInnerLhErrors] = useState<Record<string, string>>({});
    const [innerRhErrors, setInnerRhErrors] = useState<Record<string, string>>({});

    const updateOuterLhField = (field: keyof ShimThicknessDbData, value: number | undefined) => {
      setOuterLhData((prev) => ({ ...prev, [field]: value ?? 0 }));
      onSectionTouched?.();
    };

    const updateOuterRhField = (field: keyof ShimThicknessDbData, value: number | undefined) => {
      setOuterRhData((prev) => ({ ...prev, [field]: value ?? 0 }));
      onSectionTouched?.();
    };

    const updateInnerLhField = (field: keyof ShimThicknessDbData, value: number | undefined) => {
      setInnerLhData((prev) => ({ ...prev, [field]: value ?? 0 }));
      onSectionTouched?.();
    };

    const updateInnerRhField = (field: keyof ShimThicknessDbData, value: number | undefined) => {
      setInnerRhData((prev) => ({ ...prev, [field]: value ?? 0 }));
      onSectionTouched?.();
    };

    const validateField = (value: number | undefined): string => {
      if (value === undefined) return '';
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Invalid number';
      }
      return '';
    };

    const handleBlurOuterLh = (field: keyof ShimThicknessDbData) => {
      const error = validateField(outerLhData[field]);
      setOuterLhErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurOuterRh = (field: keyof ShimThicknessDbData) => {
      const error = validateField(outerRhData[field]);
      setOuterRhErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurInnerLh = (field: keyof ShimThicknessDbData) => {
      const error = validateField(innerLhData[field]);
      setInnerLhErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurInnerRh = (field: keyof ShimThicknessDbData) => {
      const error = validateField(innerRhData[field]);
      setInnerRhErrors((prev) => ({ ...prev, [field]: error }));
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        const outerLhTouched = isDataTouched(outerLhData, initialOuterLhData);
        const outerRhTouched = isDataTouched(outerRhData, initialOuterRhData);
        const innerLhTouched = isDataTouched(innerLhData, initialInnerLhData);
        const innerRhTouched = isDataTouched(innerRhData, initialInnerRhData);
        const initialNotes = initialData?.notes || '';
        return (
          outerLhTouched ||
          outerRhTouched ||
          innerLhTouched ||
          innerRhTouched ||
          notes.trim() !== initialNotes.trim()
        );
      },

      validateAndGetData: (
        _serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: ShimThicknessSectionData } => {
        const validationErrors: string[] = [];

        const outerLhTouched = isDataTouched(outerLhData, initialOuterLhData);
        const outerRhTouched = isDataTouched(outerRhData, initialOuterRhData);
        const innerLhTouched = isDataTouched(innerLhData, initialInnerLhData);
        const innerRhTouched = isDataTouched(innerRhData, initialInnerRhData);

        // Check if there's any existing data
        const hasOuterLhData =
          outerLhTouched || isDataTouched(initialOuterLhData, defaultShimThicknessDbData);
        const hasOuterRhData =
          outerRhTouched || isDataTouched(initialOuterRhData, defaultShimThicknessDbData);
        const hasInnerLhData =
          innerLhTouched || isDataTouched(initialInnerLhData, defaultShimThicknessDbData);
        const hasInnerRhData =
          innerRhTouched || isDataTouched(initialInnerRhData, defaultShimThicknessDbData);

        // Require at least one section to be filled
        if (!hasOuterLhData && !hasOuterRhData && !hasInnerLhData && !hasInnerRhData) {
          validationErrors.push(
            'Shim Thickness: You must fill at least one section (Outer LH/RH or Inner LH/RH)',
          );
        }

        const isValid = validationErrors.length === 0;

        if (isValid) {
          return {
            isValid: true,
            errors: [],
            data: {
              outerLhData: hasOuterLhData
                ? outerLhTouched
                  ? outerLhData
                  : initialOuterLhData
                : undefined,
              outerRhData: hasOuterRhData
                ? outerRhTouched
                  ? outerRhData
                  : initialOuterRhData
                : undefined,
              innerLhData: hasInnerLhData
                ? innerLhTouched
                  ? innerLhData
                  : initialInnerLhData
                : undefined,
              innerRhData: hasInnerRhData
                ? innerRhTouched
                  ? innerRhData
                  : initialInnerRhData
                : undefined,
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

      getData: (): ShimThicknessSectionData => {
        const outerLhTouched = isDataTouched(outerLhData, initialOuterLhData);
        const outerRhTouched = isDataTouched(outerRhData, initialOuterRhData);
        const innerLhTouched = isDataTouched(innerLhData, initialInnerLhData);
        const innerRhTouched = isDataTouched(innerRhData, initialInnerRhData);

        const hasOuterLhData =
          outerLhTouched || isDataTouched(initialOuterLhData, defaultShimThicknessDbData);
        const hasOuterRhData =
          outerRhTouched || isDataTouched(initialOuterRhData, defaultShimThicknessDbData);
        const hasInnerLhData =
          innerLhTouched || isDataTouched(initialInnerLhData, defaultShimThicknessDbData);
        const hasInnerRhData =
          innerRhTouched || isDataTouched(initialInnerRhData, defaultShimThicknessDbData);

        return {
          outerLhData: hasOuterLhData
            ? outerLhTouched
              ? outerLhData
              : initialOuterLhData
            : undefined,
          outerRhData: hasOuterRhData
            ? outerRhTouched
              ? outerRhData
              : initialOuterRhData
            : undefined,
          innerLhData: hasInnerLhData
            ? innerLhTouched
              ? innerLhData
              : initialInnerLhData
            : undefined,
          innerRhData: hasInnerRhData
            ? innerRhTouched
              ? innerRhData
              : initialInnerRhData
            : undefined,
          notes: notes.trim() || undefined,
          attachments,
        };
      },

      validate: (_serviceType: ServiceType): string[] => {
        const errors: string[] = [];

        const outerLhTouched = isDataTouched(outerLhData, initialOuterLhData);
        const outerRhTouched = isDataTouched(outerRhData, initialOuterRhData);
        const innerLhTouched = isDataTouched(innerLhData, initialInnerLhData);
        const innerRhTouched = isDataTouched(innerRhData, initialInnerRhData);

        const hasOuterLhData =
          outerLhTouched || isDataTouched(initialOuterLhData, defaultShimThicknessDbData);
        const hasOuterRhData =
          outerRhTouched || isDataTouched(initialOuterRhData, defaultShimThicknessDbData);
        const hasInnerLhData =
          innerLhTouched || isDataTouched(initialInnerLhData, defaultShimThicknessDbData);
        const hasInnerRhData =
          innerRhTouched || isDataTouched(initialInnerRhData, defaultShimThicknessDbData);

        if (!hasOuterLhData && !hasOuterRhData && !hasInnerLhData && !hasInnerRhData) {
          errors.push(
            'Shim Thickness: You must fill at least one section (Outer LH/RH or Inner LH/RH)',
          );
        }

        return errors;
      },

      reset: () => {
        setOuterLhData(defaultShimThicknessDbData);
        setOuterRhData(defaultShimThicknessDbData);
        setInnerLhData(defaultShimThicknessDbData);
        setInnerRhData(defaultShimThicknessDbData);
        setNotes('');
        setAttachments([]);
        setOuterLhErrors({});
        setOuterRhErrors({});
        setInnerLhErrors({});
        setInnerRhErrors({});
      },
    }));

    const t = useTranslations('inspections.form.shimThickness');
    const tMeasurements = useTranslations('measurements');
    const tCommon = useTranslations('inspections.form.common');

    return (
      <div className="space-y-6">
        {/* Tabs for Outer/Inner */}
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="outer">
              <span className="hidden sm:inline">{tMeasurements('outerMeasurements')}</span>
              <span className="sm:hidden">{t('outer')}</span>
            </TabsTrigger>
            <TabsTrigger value="inner">
              <span className="hidden sm:inline">{tMeasurements('innerMeasurements')}</span>
              <span className="sm:hidden">{t('inner')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="outer" className="mt-4">
            <ShimThicknessForm
              lhData={outerLhData}
              rhData={outerRhData}
              lhErrors={outerLhErrors}
              rhErrors={outerRhErrors}
              updateLhField={updateOuterLhField}
              updateRhField={updateOuterRhField}
              handleLhBlur={handleBlurOuterLh}
              handleRhBlur={handleBlurOuterRh}
            />
          </TabsContent>

          <TabsContent value="inner" className="mt-4">
            <ShimThicknessForm
              lhData={innerLhData}
              rhData={innerRhData}
              lhErrors={innerLhErrors}
              rhErrors={innerRhErrors}
              updateLhField={updateInnerLhField}
              updateRhField={updateInnerRhField}
              handleLhBlur={handleBlurInnerLh}
              handleRhBlur={handleBlurInnerRh}
            />
          </TabsContent>
        </Tabs>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="shim-thickness-notes">{t('notes')}</Label>
          <Textarea
            id="shim-thickness-notes"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              onSectionTouched?.();
            }}
            placeholder={t('notesPlaceholder')}
            rows={4}
          />
        </div>

        {/* Attachments */}
        <div className="pt-4 border-t">
          <Typography variant="h4" className="mb-3">
            {tCommon('attachments')}
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

ShimThicknessSection.displayName = 'ShimThicknessSection';
