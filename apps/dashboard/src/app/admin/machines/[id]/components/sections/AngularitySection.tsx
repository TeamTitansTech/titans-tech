'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type AngularityData,
  ServiceType,
  AngularityPerpendicularityType,
  AngularityUnitType,
} from '@/data/types/services.types';
import { AngularityForm } from '../forms/AngularityForm';
import { isDataTouched } from './utils';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const defaultAngularityData: AngularityData = {
  spm: '',
  distanceIndicatorTip: '',
  locationIndicator: '',
  counterbalancePressure: '',
  strokePartBeingRead: '',
  shutheightSetAt: '',
  squareUsed: '',
  squarePlacedLocation: '',
  indicatorUsedGraduation: '',
  tipKindOnIndicator: '',
  totalLiftCheck: '',
  hasPerpendicularityAdjusted: AngularityPerpendicularityType.DNC,
  unit: AngularityUnitType.INCHES,
  measurementFR: 0,
  measurementLR: 0,
};

export const validateAngularityData = (data: AngularityData): string[] => {
  const errors: string[] = [];

  // Measurement fields should be numbers
  if (data.measurementFR !== undefined && isNaN(Number(data.measurementFR))) {
    errors.push('measurementFR: Invalid number');
  }
  if (data.measurementLR !== undefined && isNaN(Number(data.measurementLR))) {
    errors.push('measurementLR: Invalid number');
  }

  return errors;
};

export interface AngularitySectionData {
  beforeData?: AngularityData;
  afterData?: AngularityData;
  notes?: string;
}

export interface AngularitySectionRef {
  getData: () => AngularitySectionData;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: AngularitySectionData;
  };
}

interface AngularitySectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSectionTouched?: () => void;
  initialData?: AngularitySectionData;
}

export const AngularitySection = forwardRef<AngularitySectionRef, AngularitySectionProps>(
  ({ isOpen: _isOpen, onOpenChange: _onOpenChange, onSectionTouched, initialData }, ref) => {
    const t = useTranslations('inspections.form.angularity');

    // Store the initial loaded data to compare against for "touched" detection
    const [initialBeforeData] = useState<AngularityData>(
      initialData?.beforeData || defaultAngularityData,
    );
    const [initialAfterData] = useState<AngularityData>(
      initialData?.afterData || defaultAngularityData,
    );

    const [beforeData, setBeforeData] = useState<AngularityData>(
      initialData?.beforeData || defaultAngularityData,
    );
    const [afterData, setAfterData] = useState<AngularityData>(
      initialData?.afterData || defaultAngularityData,
    );
    const [notes, setNotes] = useState<string>(initialData?.notes || '');
    const [beforeErrors, setBeforeErrors] = useState<Record<string, string>>({});
    const [afterErrors, setAfterErrors] = useState<Record<string, string>>({});

    const updateBeforeField = (field: keyof AngularityData, value: string | number) => {
      setBeforeData((prev) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    const updateAfterField = (field: keyof AngularityData, value: string | number) => {
      setAfterData((prev) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    const validateField = (value: number | string | undefined): string => {
      if (typeof value === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return 'Invalid number';
        }
      }
      return '';
    };

    const handleBlurBefore = (field: keyof AngularityData) => {
      const error = validateField(beforeData[field]);
      setBeforeErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleBlurAfter = (field: keyof AngularityData) => {
      const error = validateField(afterData[field]);
      setAfterErrors((prev) => ({ ...prev, [field]: error }));
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        const beforeTouched = isDataTouched(beforeData, initialBeforeData);
        const afterTouched = isDataTouched(afterData, initialAfterData);
        const initialNotes = initialData?.notes || '';
        return beforeTouched || afterTouched || notes.trim() !== initialNotes.trim();
      },

      getData: (): AngularitySectionData => ({
        beforeData: beforeData,
        afterData: afterData,
        notes: notes.trim() || undefined,
      }),

      validate: (serviceType: ServiceType): string[] => {
        const allErrors: string[] = [];

        // For inspections, validate before data
        if (serviceType === ServiceType.INSPECTION) {
          const beforeValidationErrors = validateAngularityData(beforeData);
          if (beforeValidationErrors.length > 0) {
            allErrors.push(...beforeValidationErrors.map((e) => `Before Adjustment - ${e}`));
          }
        }

        // For maintenance, validate both before and after
        if (serviceType === ServiceType.MAINTENANCE) {
          const beforeValidationErrors = validateAngularityData(beforeData);
          const afterValidationErrors = validateAngularityData(afterData);

          if (beforeValidationErrors.length > 0) {
            allErrors.push(...beforeValidationErrors.map((e) => `Before Maintenance - ${e}`));
          }
          if (afterValidationErrors.length > 0) {
            allErrors.push(...afterValidationErrors.map((e) => `After Maintenance - ${e}`));
          }
        }

        return allErrors;
      },

      reset: () => {
        setBeforeData(defaultAngularityData);
        setAfterData(defaultAngularityData);
        setNotes('');
        setBeforeErrors({});
        setAfterErrors({});
      },

      validateAndGetData: (
        serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: AngularitySectionData } => {
        const errors = ref.current?.validate(serviceType) || [];
        const isValid = errors.length === 0;

        return {
          isValid,
          errors,
          data: isValid ? ref.current?.getData() : undefined,
        };
      },
    }));

    return (
      <div className="space-y-4">
        <Tabs defaultValue="before" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="before">{t('beforeAdjustment')}</TabsTrigger>
            <TabsTrigger value="after">{t('afterAdjustment')}</TabsTrigger>
          </TabsList>

          <TabsContent value="before" className="space-y-4">
            <AngularityForm
              data={beforeData}
              errors={beforeErrors}
              updateField={updateBeforeField}
              handleBlur={handleBlurBefore}
              title={t('beforeAdjustment')}
            />
          </TabsContent>

          <TabsContent value="after" className="space-y-4">
            <AngularityForm
              data={afterData}
              errors={afterErrors}
              updateField={updateAfterField}
              handleBlur={handleBlurAfter}
              title={t('afterAdjustment')}
            />
          </TabsContent>
        </Tabs>

        {/* Notes Section */}
        <div className="space-y-2">
          <Label htmlFor="angularity-notes">{t('notes')}</Label>
          <Textarea
            id="angularity-notes"
            placeholder={t('notesPlaceholder')}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              onSectionTouched?.();
            }}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>
    );
  },
);

AngularitySection.displayName = 'AngularitySection';
