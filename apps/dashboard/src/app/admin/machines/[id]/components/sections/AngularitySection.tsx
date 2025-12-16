'use client';

import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type AngularityCheck, YesNoDncType, ServiceType } from '@/data/types/services.types';
import { isDataTouched } from './utils';

export const defaultAngularityData: AngularityCheck = {
  hasBeenAdjusted: undefined,
  beforeFR: undefined,
  beforeLR: undefined,
  afterFR: undefined,
  afterLR: undefined,
  notes: undefined,
};

export interface AngularitySectionRef {
  getData: () => AngularityCheck | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: AngularityCheck;
  };
}

interface AngularitySectionProps {
  onSectionTouched?: () => void;
  initialData?: AngularityCheck;
}

export const AngularitySection = forwardRef<AngularitySectionRef, AngularitySectionProps>(
  ({ onSectionTouched, initialData }, ref) => {
    const t = useTranslations('inspections.form.angularity');

    const [initialAngularityData, setInitialAngularityData] = useState<AngularityCheck>(
      initialData || defaultAngularityData,
    );

    const [data, setData] = useState<AngularityCheck>(initialData || defaultAngularityData);
    const prevInitialDataRef = useRef(initialData);

    useEffect(() => {
      if (initialData && initialData !== prevInitialDataRef.current) {
        prevInitialDataRef.current = initialData;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
        setData(initialData);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
        setInitialAngularityData(initialData);
      }
    }, [initialData]);

    const updateField = <K extends keyof AngularityCheck>(field: K, value: AngularityCheck[K]) => {
      setData((prev: AngularityCheck) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        return isDataTouched(data, initialAngularityData);
      },

      validateAndGetData: (
        _serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: AngularityCheck } => {
        const touched = isDataTouched(data, initialAngularityData);
        const hasInitialData = isDataTouched(initialAngularityData, defaultAngularityData);

        const isValid = true;

        if (isValid) {
          const hasData = touched || hasInitialData;
          return {
            isValid: true,
            errors: [],
            data: hasData ? (touched ? data : initialAngularityData) : undefined,
          };
        }

        return {
          isValid: false,
          errors: [],
        };
      },

      getData: (): AngularityCheck | undefined => {
        const touched = isDataTouched(data, initialAngularityData);
        const hasData = touched || isDataTouched(initialAngularityData, defaultAngularityData);
        return hasData ? (touched ? data : initialAngularityData) : undefined;
      },

      validate: (_serviceType: ServiceType): string[] => {
        return [];
      },

      reset: () => {
        setData(defaultAngularityData);
      },
    }));

    const getYesNoDncLabel = (value: YesNoDncType): string => {
      switch (value) {
        case YesNoDncType.YES:
          return t('options.yes');
        case YesNoDncType.NO:
          return t('options.no');
        case YesNoDncType.DNC:
          return t('options.dnc');
        default:
          return value;
      }
    };

    const handleNumericChange = (field: keyof AngularityCheck, value: string) => {
      if (value === '') {
        updateField(field, undefined);
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          updateField(field, numValue as AngularityCheck[typeof field]);
        }
      }
    };

    return (
      <div className="space-y-6">
        {/* Has Been Adjusted */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="angularity-hasBeenAdjusted">{t('hasBeenAdjusted')}</Label>
              <Select
                value={data.hasBeenAdjusted || ''}
                onValueChange={(value) => updateField('hasBeenAdjusted', value as YesNoDncType)}
              >
                <SelectTrigger id="angularity-hasBeenAdjusted">
                  <SelectValue placeholder={t('selectOption')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(YesNoDncType).map((option) => (
                    <SelectItem key={option} value={option}>
                      {getYesNoDncLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Before Adjustment */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">{t('beforeAdjustment')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="angularity-beforeFR">{t('frontRear')} (F-R)</Label>
              <Input
                id="angularity-beforeFR"
                type="number"
                step="0.0001"
                value={data.beforeFR !== undefined ? String(data.beforeFR) : ''}
                onChange={(e) => handleNumericChange('beforeFR', e.target.value)}
                placeholder={t('enterValue')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="angularity-beforeLR">{t('leftRight')} (L-R)</Label>
              <Input
                id="angularity-beforeLR"
                type="number"
                step="0.0001"
                value={data.beforeLR !== undefined ? String(data.beforeLR) : ''}
                onChange={(e) => handleNumericChange('beforeLR', e.target.value)}
                placeholder={t('enterValue')}
              />
            </div>
          </div>
        </div>

        {/* After Adjustment */}
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-4">{t('afterAdjustment')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="angularity-afterFR">{t('frontRear')} (F-R)</Label>
              <Input
                id="angularity-afterFR"
                type="number"
                step="0.0001"
                value={data.afterFR !== undefined ? String(data.afterFR) : ''}
                onChange={(e) => handleNumericChange('afterFR', e.target.value)}
                placeholder={t('enterValue')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="angularity-afterLR">{t('leftRight')} (L-R)</Label>
              <Input
                id="angularity-afterLR"
                type="number"
                step="0.0001"
                value={data.afterLR !== undefined ? String(data.afterLR) : ''}
                onChange={(e) => handleNumericChange('afterLR', e.target.value)}
                placeholder={t('enterValue')}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="angularity-notes">{t('notes')}</Label>
          <Textarea
            id="angularity-notes"
            value={data.notes || ''}
            onChange={(e) => updateField('notes', e.target.value || undefined)}
            placeholder={t('notesPlaceholder')}
            rows={4}
          />
        </div>
      </div>
    );
  },
);

AngularitySection.displayName = 'AngularitySection';
