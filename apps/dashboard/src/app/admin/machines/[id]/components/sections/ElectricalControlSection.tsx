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
  type ElectricalControlCheck,
  type Attachment,
  YesNoDncType,
  YesNoNaDncCantTellType,
  ServiceType,
} from '@/data/types/services.types';
import { isDataTouched } from './utils';
import { DocumentUpload } from '@/components/ui/document-upload';
import { Typography } from '@/components/ui/typography';

export const defaultElectricalControlData: ElectricalControlCheck = {
  hasHourMeter: undefined,
  hourMeterReading: undefined,
  isMinsterControl: undefined,
  minsterControlOther: undefined,
  controlDoorStop: undefined,
  cabinetTemp: undefined,
  incomingLine: undefined,
  fullVoltage: undefined,
  contactor: undefined,
  overloads: undefined,
  transformers: undefined,
  brakeValve: undefined,
  clutchValve: undefined,
  wiring: undefined,
  terminals: undefined,
  twentyFourVBuss: undefined,
  safetyRelays: undefined,
  notes: undefined,
};

export interface ElectricalControlSectionData {
  data?: ElectricalControlCheck;
  attachments?: Attachment[];
}

export interface ElectricalControlSectionRef {
  getData: () => ElectricalControlSectionData | undefined;
  validate: (serviceType: ServiceType) => string[];
  reset: () => void;
  isTouched: () => boolean;
  validateAndGetData: (serviceType: ServiceType) => {
    isValid: boolean;
    errors: string[];
    data?: ElectricalControlSectionData;
  };
}

interface ElectricalControlSectionProps {
  onSectionTouched?: () => void;
  initialData?: ElectricalControlSectionData;
}

export const ElectricalControlSection = forwardRef<
  ElectricalControlSectionRef,
  ElectricalControlSectionProps
>(({ onSectionTouched, initialData }, ref) => {
  const t = useTranslations('inspections.form.electricalControl');
  const tCommon = useTranslations('inspections.form.common');

  const [initialElectricalControlData, setInitialElectricalControlData] =
    useState<ElectricalControlCheck>(initialData?.data || defaultElectricalControlData);

  const [data, setData] = useState<ElectricalControlCheck>(
    initialData?.data || defaultElectricalControlData,
  );
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments ?? []);
  const prevInitialDataRef = useRef(initialData);

  useEffect(() => {
    if (initialData && initialData !== prevInitialDataRef.current) {
      prevInitialDataRef.current = initialData;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
      setData(initialData.data || defaultElectricalControlData);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
      setInitialElectricalControlData(initialData.data || defaultElectricalControlData);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to sync props to state when initialData changes
      setAttachments(initialData.attachments ?? []);
    }
  }, [initialData]);

  const updateField = <K extends keyof ElectricalControlCheck>(
    field: K,
    value: ElectricalControlCheck[K],
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    onSectionTouched?.();
  };

  useImperativeHandle(ref, () => ({
    isTouched: (): boolean => {
      return isDataTouched(data, initialElectricalControlData);
    },

    validateAndGetData: (
      _serviceType: ServiceType,
    ): { isValid: boolean; errors: string[]; data?: ElectricalControlSectionData } => {
      const touched = isDataTouched(data, initialElectricalControlData);
      const hasInitialData = isDataTouched(
        initialElectricalControlData,
        defaultElectricalControlData,
      );

      const isValid = true;

      if (isValid) {
        const hasData = touched || hasInitialData;
        return {
          isValid: true,
          errors: [],
          data: hasData
            ? { data: touched ? data : initialElectricalControlData, attachments }
            : undefined,
        };
      }

      return {
        isValid: false,
        errors: [],
      };
    },

    getData: (): ElectricalControlSectionData | undefined => {
      const touched = isDataTouched(data, initialElectricalControlData);
      const hasData =
        touched || isDataTouched(initialElectricalControlData, defaultElectricalControlData);
      return hasData
        ? { data: touched ? data : initialElectricalControlData, attachments }
        : undefined;
    },

    validate: (_serviceType: ServiceType): string[] => {
      return [];
    },

    reset: () => {
      setData(defaultElectricalControlData);
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

  const getYesNoNaDncCantTellLabel = (value: YesNoNaDncCantTellType): string => {
    switch (value) {
      case YesNoNaDncCantTellType.YES:
        return t('options.yes');
      case YesNoNaDncCantTellType.NO:
        return t('options.no');
      case YesNoNaDncCantTellType.NA:
        return t('options.na');
      case YesNoNaDncCantTellType.DNC:
        return t('options.dnc');
      case YesNoNaDncCantTellType.CANT_TELL:
        return t('options.cantTell');
      default:
        return value;
    }
  };

  const checklistFields: Array<{
    key: keyof ElectricalControlCheck;
    label: string;
  }> = [
    { key: 'controlDoorStop', label: t('controlDoorStop') },
    { key: 'cabinetTemp', label: t('cabinetTemp') },
    { key: 'incomingLine', label: t('incomingLine') },
    { key: 'fullVoltage', label: t('fullVoltage') },
    { key: 'contactor', label: t('contactor') },
    { key: 'overloads', label: t('overloads') },
    { key: 'transformers', label: t('transformers') },
    { key: 'brakeValve', label: t('brakeValve') },
    { key: 'clutchValve', label: t('clutchValve') },
    { key: 'wiring', label: t('wiring') },
    { key: 'terminals', label: t('terminals') },
    { key: 'twentyFourVBuss', label: t('twentyFourVBuss') },
    { key: 'safetyRelays', label: t('safetyRelays') },
  ];

  return (
    <div className="space-y-6">
      {/* Header Questions */}
      <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">{t('headerSection')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hour Meter */}
          <div className="space-y-2">
            <Label htmlFor="hasHourMeter">{t('hasHourMeter')}</Label>
            <Select
              value={data.hasHourMeter || ''}
              onValueChange={(value) => updateField('hasHourMeter', value as YesNoDncType)}
            >
              <SelectTrigger id="hasHourMeter">
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

          {/* Hour Meter Reading - shown when hasHourMeter is YES */}
          {data.hasHourMeter === YesNoDncType.YES && (
            <div className="space-y-2">
              <Label htmlFor="hourMeterReading">{t('hourMeterReading')}</Label>
              <Input
                id="hourMeterReading"
                value={data.hourMeterReading || ''}
                onChange={(e) => updateField('hourMeterReading', e.target.value || undefined)}
                placeholder={t('hourMeterReadingPlaceholder')}
              />
            </div>
          )}

          {/* Minster Control */}
          <div className="space-y-2">
            <Label htmlFor="isMinsterControl">{t('isMinsterControl')}</Label>
            <Select
              value={data.isMinsterControl || ''}
              onValueChange={(value) => updateField('isMinsterControl', value as YesNoDncType)}
            >
              <SelectTrigger id="isMinsterControl">
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

          {/* If Other, Specify - shown when isMinsterControl is NO */}
          {data.isMinsterControl === YesNoDncType.NO && (
            <div className="space-y-2">
              <Label htmlFor="minsterControlOther">{t('minsterControlOther')}</Label>
              <Input
                id="minsterControlOther"
                value={data.minsterControlOther || ''}
                onChange={(e) => updateField('minsterControlOther', e.target.value || undefined)}
                placeholder={t('minsterControlOtherPlaceholder')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">{t('checklistSection')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checklistFields.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Select
                value={(data[key] as string) || ''}
                onValueChange={(value) => updateField(key, value as YesNoNaDncCantTellType)}
              >
                <SelectTrigger id={key}>
                  <SelectValue placeholder={t('selectOption')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(YesNoNaDncCantTellType).map((option) => (
                    <SelectItem key={option} value={option}>
                      {getYesNoNaDncCantTellLabel(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="electrical-control-notes">{t('notes')}</Label>
        <Textarea
          id="electrical-control-notes"
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

ElectricalControlSection.displayName = 'ElectricalControlSection';
