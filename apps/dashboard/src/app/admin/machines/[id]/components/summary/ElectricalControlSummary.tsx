'use client';

import { useTranslations } from 'next-intl';
import type { ElectricalControlCheck, Attachment } from '@/data/types/services.types';
import { SectionAttachments } from './SectionAttachments';

interface ElectricalControlSummaryProps {
  data: ElectricalControlCheck;
  attachments?: Attachment[];
}

export function ElectricalControlSummary({ data, attachments }: ElectricalControlSummaryProps) {
  const t = useTranslations('inspections.form.electricalControl');
  const tSummary = useTranslations('services.modal.summary');

  if (!data) {
    return <div className="text-sm text-muted-foreground">{tSummary('noDataAvailable')}</div>;
  }

  const formatYesNoDnc = (value: string | undefined): string => {
    if (!value) return '-';
    switch (value) {
      case 'YES':
        return t('options.yes');
      case 'NO':
        return t('options.no');
      case 'DNC':
        return t('options.dnc');
      default:
        return value;
    }
  };

  const formatYesNoNaDncCantTell = (value: string | undefined): string => {
    if (!value) return '-';
    switch (value) {
      case 'YES':
        return t('options.yes');
      case 'NO':
        return t('options.no');
      case 'NA':
        return t('options.na');
      case 'DNC':
        return t('options.dnc');
      case 'CANT_TELL':
        return t('options.cantTell');
      default:
        return value;
    }
  };

  const checklistFields = [
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
    <div className="space-y-3">
      {/* Header Questions */}
      <div className="space-y-1.5">
        <div className="flex justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">{t('hasHourMeter')}:</span>
          <span className="font-medium text-right">{formatYesNoDnc(data.hasHourMeter)}</span>
        </div>
        {data.hasHourMeter === 'YES' && data.hourMeterReading && (
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('hourMeterReading')}:</span>
            <span className="font-medium text-right">{data.hourMeterReading}</span>
          </div>
        )}
        <div className="flex justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">{t('isMinsterControl')}:</span>
          <span className="font-medium text-right">{formatYesNoDnc(data.isMinsterControl)}</span>
        </div>
        {data.isMinsterControl === 'NO' && data.minsterControlOther && (
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('minsterControlOther')}:</span>
            <span className="font-medium text-right">{data.minsterControlOther}</span>
          </div>
        )}
      </div>

      {/* Checklist Items */}
      <div className="mt-3">
        <div className="font-semibold text-muted-foreground mb-2 text-xs">
          {t('checklistSection')}
        </div>
        <div className="pl-3 border-l-2 border-muted space-y-1.5">
          {checklistFields.map(({ key, label }) => {
            const value = data[key as keyof ElectricalControlCheck] as string | undefined;
            if (!value) return null;
            return (
              <div key={key} className="flex justify-between gap-2 text-[11px]">
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-medium text-right">{formatYesNoNaDncCantTell(value)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mt-3">
          <div className="font-semibold text-muted-foreground mb-2 text-xs">{t('notes')}</div>
          <div className="text-[11px] pl-3 border-l-2 border-muted">{data.notes}</div>
        </div>
      )}

      {/* Attachments */}
      <SectionAttachments attachments={attachments} />
    </div>
  );
}
