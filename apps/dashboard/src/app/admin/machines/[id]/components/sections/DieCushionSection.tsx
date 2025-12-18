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
  type DieCushionCheck,
  type Attachment,
  DieCushionAirLeaksType,
  DieCushionPneumaticsPlumbingType,
  DieCushionLubricationType,
  ServiceType,
} from '@/data/types/services.types';
import { isDataTouched } from './utils';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

export const defaultDieCushionData: DieCushionCheck = {
  airLeaks: undefined,
  airLeaksLocation: undefined,
  pneumaticsPlumbing: undefined,
  lubrication: undefined,
  notes: undefined,
};

export interface DieCushionSectionData {
  data?: DieCushionCheck;
  attachments?: Attachment[];
}

export interface DieCushionSectionRef {
  getData: () => DieCushionSectionData | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: DieCushionSectionData;
  };
}

interface DieCushionSectionProps {
  onSectionTouched?: () => void;
  initialData?: DieCushionSectionData;
}

export const DieCushionSection = forwardRef<DieCushionSectionRef, DieCushionSectionProps>(
  ({ onSectionTouched, initialData }, ref) => {
    const t = useTranslations('inspections.form.dieCushion');
    const tCommon = useTranslations('inspections.form.common');

    // Store initial loaded data for "touched" detection
    const [initialDieCushionData, setInitialDieCushionData] = useState<DieCushionCheck>(
      initialData?.data || defaultDieCushionData,
    );

    const [data, setData] = useState<DieCushionCheck>(initialData?.data || defaultDieCushionData);
    const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
    const prevInitialDataRef = useRef(initialData);

    // Sync state with initialData prop changes
    useEffect(() => {
      if (initialData && initialData !== prevInitialDataRef.current) {
        prevInitialDataRef.current = initialData;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
        setData(initialData.data || defaultDieCushionData);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
        setInitialDieCushionData(initialData.data || defaultDieCushionData);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
        setAttachments(initialData.attachments ?? []);
      }
    }, [initialData]);

    const updateField = <K extends keyof DieCushionCheck>(field: K, value: DieCushionCheck[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      onSectionTouched?.();
    };

    // Clear airLeaksLocation when airLeaks is not LEAKING
    const handleAirLeaksChange = (value: DieCushionAirLeaksType | undefined) => {
      setData((prev) => ({
        ...prev,
        airLeaks: value,
        // Clear location if not leaking
        airLeaksLocation:
          value === DieCushionAirLeaksType.LEAKING ? prev.airLeaksLocation : undefined,
      }));
      onSectionTouched?.();
    };

    useImperativeHandle(ref, () => ({
      isTouched: (): boolean => {
        return isDataTouched(data, initialDieCushionData);
      },

      validateAndGetData: (
        _serviceType: ServiceType,
      ): { isValid: boolean; errors: string[]; data?: DieCushionSectionData } => {
        const touched = isDataTouched(data, initialDieCushionData);
        const hasInitialData = isDataTouched(initialDieCushionData, defaultDieCushionData);

        // No required fields for this section
        const isValid = true;

        if (isValid) {
          const hasData = touched || hasInitialData;
          return {
            isValid: true,
            errors: [],
            data: hasData
              ? { data: touched ? data : initialDieCushionData, attachments }
              : undefined,
          };
        }

        return {
          isValid: false,
          errors: [],
        };
      },

      getData: (): DieCushionSectionData | undefined => {
        const touched = isDataTouched(data, initialDieCushionData);
        const hasData = touched || isDataTouched(initialDieCushionData, defaultDieCushionData);
        return hasData ? { data: touched ? data : initialDieCushionData, attachments } : undefined;
      },

      validate: (_serviceType: ServiceType): string[] => {
        // No required fields
        return [];
      },

      reset: () => {
        setData(defaultDieCushionData);
        setAttachments([]);
      },
    }));

    // Helper to get display label for enum values
    const getAirLeaksLabel = (value: DieCushionAirLeaksType): string => {
      switch (value) {
        case DieCushionAirLeaksType.OK:
          return t('options.ok');
        case DieCushionAirLeaksType.NA:
          return t('options.na');
        case DieCushionAirLeaksType.DNC:
          return t('options.dnc');
        case DieCushionAirLeaksType.LEAKING:
          return t('options.leaking');
        default:
          return value;
      }
    };

    const getPneumaticsPlumbingLabel = (value: DieCushionPneumaticsPlumbingType): string => {
      switch (value) {
        case DieCushionPneumaticsPlumbingType.OK:
          return t('options.ok');
        case DieCushionPneumaticsPlumbingType.NA:
          return t('options.na');
        case DieCushionPneumaticsPlumbingType.DNC:
          return t('options.dnc');
        case DieCushionPneumaticsPlumbingType.NOT_OPERATIONAL:
          return t('options.notOperational');
        case DieCushionPneumaticsPlumbingType.LEAKING:
          return t('options.leaking');
        default:
          return value;
      }
    };

    const getLubricationLabel = (value: DieCushionLubricationType): string => {
      switch (value) {
        case DieCushionLubricationType.OK:
          return t('options.ok');
        case DieCushionLubricationType.NA:
          return t('options.na');
        case DieCushionLubricationType.DNC:
          return t('options.dnc');
        case DieCushionLubricationType.NOT_OPERATIONAL:
          return t('options.notOperational');
        default:
          return value;
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Air Leaks */}
            <div className="space-y-2">
              <Label htmlFor="airLeaks">{t('airLeaks')}</Label>
              <Select
                value={data.airLeaks || ''}
                onValueChange={(value) => handleAirLeaksChange(value as DieCushionAirLeaksType)}
              >
                <SelectTrigger id="airLeaks">
                  <SelectValue placeholder={t('selectOption')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DieCushionAirLeaksType).map((option) => (
                    <SelectItem key={option} value={option}>
                      {getAirLeaksLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* If seals leaking, where? - shown only when Air Leaks = LEAKING */}
            {data.airLeaks === DieCushionAirLeaksType.LEAKING && (
              <div className="space-y-2">
                <Label htmlFor="airLeaksLocation">{t('airLeaksLocation')}</Label>
                <Input
                  id="airLeaksLocation"
                  value={data.airLeaksLocation || ''}
                  onChange={(e) => updateField('airLeaksLocation', e.target.value || undefined)}
                  placeholder={t('airLeaksLocationPlaceholder')}
                />
              </div>
            )}

            {/* Pneumatics Plumbing */}
            <div className="space-y-2">
              <Label htmlFor="pneumaticsPlumbing">{t('pneumaticsPlumbing')}</Label>
              <Select
                value={data.pneumaticsPlumbing || ''}
                onValueChange={(value) =>
                  updateField('pneumaticsPlumbing', value as DieCushionPneumaticsPlumbingType)
                }
              >
                <SelectTrigger id="pneumaticsPlumbing">
                  <SelectValue placeholder={t('selectOption')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DieCushionPneumaticsPlumbingType).map((option) => (
                    <SelectItem key={option} value={option}>
                      {getPneumaticsPlumbingLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lubrication */}
            <div className="space-y-2">
              <Label htmlFor="lubrication">{t('lubrication')}</Label>
              <Select
                value={data.lubrication || ''}
                onValueChange={(value) =>
                  updateField('lubrication', value as DieCushionLubricationType)
                }
              >
                <SelectTrigger id="lubrication">
                  <SelectValue placeholder={t('selectOption')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DieCushionLubricationType).map((option) => (
                    <SelectItem key={option} value={option}>
                      {getLubricationLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="die-cushion-notes">{t('notes')}</Label>
          <Textarea
            id="die-cushion-notes"
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
  },
);

DieCushionSection.displayName = 'DieCushionSection';
