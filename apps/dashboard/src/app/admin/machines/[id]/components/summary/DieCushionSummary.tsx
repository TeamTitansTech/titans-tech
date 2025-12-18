'use client';

import { useTranslations } from 'next-intl';
import type { DieCushionCheck, Attachment } from '@/data/types/services.types';
import { SectionAttachments } from './SectionAttachments';

interface DieCushionSummaryProps {
  data: DieCushionCheck;
  attachments?: Attachment[];
}

export function DieCushionSummary({ data, attachments }: DieCushionSummaryProps) {
  const t = useTranslations('inspections.form.dieCushion');
  const tEnums = useTranslations('inspections.form.enums');
  const tSummary = useTranslations('services.modal.summary');

  if (!data) {
    return <div className="text-sm text-muted-foreground">{tSummary('noDataAvailable')}</div>;
  }

  const formatEnumValue = (value: string | undefined, enumType: string): string => {
    if (!value) return '-';
    const translationKey = `${enumType}.${value.toLowerCase()}`;
    const translated = tEnums(translationKey);
    // If translation key is returned as-is, return the original value
    if (translated === translationKey || translated.includes('inspections.form.enums')) {
      return value;
    }
    return translated;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-2 text-[11px]">
        <span className="text-muted-foreground">{t('airLeaks')}:</span>
        <span className="font-medium text-right">
          {formatEnumValue(data.airLeaks, 'dieCushionAirLeaks')}
        </span>
      </div>
      {data.airLeaksLocation && (
        <div className="flex justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">{t('airLeaksLocation')}:</span>
          <span className="font-medium text-right">{data.airLeaksLocation}</span>
        </div>
      )}
      <div className="flex justify-between gap-2 text-[11px]">
        <span className="text-muted-foreground">{t('pneumaticsPlumbing')}:</span>
        <span className="font-medium text-right">
          {formatEnumValue(data.pneumaticsPlumbing, 'dieCushionPneumaticsPlumbing')}
        </span>
      </div>
      <div className="flex justify-between gap-2 text-[11px]">
        <span className="text-muted-foreground">{t('lubrication')}:</span>
        <span className="font-medium text-right">
          {formatEnumValue(data.lubrication, 'dieCushionLubrication')}
        </span>
      </div>
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
