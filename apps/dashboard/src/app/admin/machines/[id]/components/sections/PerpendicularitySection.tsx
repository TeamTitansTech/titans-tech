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
import {
  type PerpendicularityCheck,
  type Attachment,
  YesNoDncType,
  ServiceType,
} from '@/data/types/services.types';
import { isDataTouched } from './utils';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

export const defaultPerpendicularityData: PerpendicularityCheck = {
  hasBeenAdjusted: undefined,
  beforeFR: undefined,
  beforeLR: undefined,
  afterFR: undefined,
  afterLR: undefined,
  notes: undefined,
};

export interface PerpendiculariySectionData {
  data?: PerpendicularityCheck;
  attachments?: Attachment[];
}

export interface PerpendiculoritySectionRef {
  getData: () => PerpendiculariySectionData | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: PerpendiculariySectionData;
  };
}

interface PerpendiculoritySectionProps {
  onSectionTouched?: () => void;
  initialData?: PerpendiculariySectionData;
}

export const PerpendicularitySection = forwardRef<
  PerpendiculoritySectionRef,
  PerpendiculoritySectionProps
>(({ onSectionTouched, initialData }, ref) => {
  const t = useTranslations('inspections.form.perpendicularity');
  const tCommon = useTranslations('inspections.form.common');

  const [initialPerpendicularityData, setInitialPerpendicularityData] =
    useState<PerpendicularityCheck>(initialData?.data || defaultPerpendicularityData);

  const [data, setData] = useState<PerpendicularityCheck>(
    initialData?.data || defaultPerpendicularityData,
  );
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
  const prevInitialDataRef = useRef(initialData);

  useEffect(() => {
    if (initialData && initialData !== prevInitialDataRef.current) {
      prevInitialDataRef.current = initialData;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
      setData(initialData.data || defaultPerpendicularityData);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
      setInitialPerpendicularityData(initialData.data || defaultPerpendicularityData);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
      setAttachments(initialData.attachments ?? []);
    }
  }, [initialData]);

  const updateField = <K extends keyof PerpendicularityCheck>(
    field: K,
    value: PerpendicularityCheck[K],
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    onSectionTouched?.();
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      return isDataTouched(data, initialPerpendicularityData);
    },

    validateAndGetData: (
      _serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: PerpendiculariySectionData } => {
      const touched = isDataTouched(data, initialPerpendicularityData);
      const hasInitialData = isDataTouched(
        initialPerpendicularityData,
        defaultPerpendicularityData,
      );

      const isValid = true;

      if (isValid) {
        const hasData = touched || hasInitialData;
        return {
          isValid: true,
          errors: [],
          data: hasData
            ? { data: touched ? data : initialPerpendicularityData, attachments }
            : undefined,
        };
      }

      return {
        isValid: false,
        errors: [],
      };
    },

    getData: (): PerpendiculariySectionData | undefined => {
      const touched = isDataTouched(data, initialPerpendicularityData);
      const hasData =
        touched || isDataTouched(initialPerpendicularityData, defaultPerpendicularityData);
      return hasData
        ? { data: touched ? data : initialPerpendicularityData, attachments }
        : undefined;
    },

    validate: (_serviceType: ServiceType): string[] => {
      return [];
    },

    reset: () => {
      setData(defaultPerpendicularityData);
      setAttachments([]);
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

  const handleNumericChange = (field: keyof PerpendicularityCheck, value: string) => {
    if (value === '') {
      updateField(field, undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        updateField(field, numValue as PerpendicularityCheck[typeof field]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Has Been Adjusted */}
      <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="hasBeenAdjusted">{t('hasBeenAdjusted')}</Label>
            <Select
              value={data.hasBeenAdjusted || ''}
              onValueChange={(value) => updateField('hasBeenAdjusted', value as YesNoDncType)}
            >
              <SelectTrigger
                id="hasBeenAdjusted"
                clearable
                hasValue={!!data.hasBeenAdjusted}
                onClear={() => updateField('hasBeenAdjusted', undefined)}
              >
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
            <Label htmlFor="beforeFR">{t('frontRear')} (F-R)</Label>
            <Input
              id="beforeFR"
              type="number"
              step="0.0001"
              value={data.beforeFR !== undefined ? String(data.beforeFR) : ''}
              onChange={(e) => handleNumericChange('beforeFR', e.target.value)}
              placeholder={t('enterValue')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beforeLR">{t('leftRight')} (L-R)</Label>
            <Input
              id="beforeLR"
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
            <Label htmlFor="afterFR">{t('frontRear')} (F-R)</Label>
            <Input
              id="afterFR"
              type="number"
              step="0.0001"
              value={data.afterFR !== undefined ? String(data.afterFR) : ''}
              onChange={(e) => handleNumericChange('afterFR', e.target.value)}
              placeholder={t('enterValue')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="afterLR">{t('leftRight')} (L-R)</Label>
            <Input
              id="afterLR"
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
        <Label htmlFor="perpendicularity-notes">{t('notes')}</Label>
        <Textarea
          id="perpendicularity-notes"
          value={data.notes || ''}
          onChange={(e) => updateField('notes', e.target.value || undefined)}
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
});

PerpendicularitySection.displayName = 'PerpendicularitySection';
