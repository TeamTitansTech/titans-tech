'use client';

import { useTranslations } from 'next-intl';
import type { AngularityCheck, Attachment } from '@/data/types/services.types';
import { SectionAttachments } from './SectionAttachments';

interface AngularitySummaryProps {
  data: AngularityCheck;
  attachments?: Attachment[];
}

export function AngularitySummary({ data, attachments }: AngularitySummaryProps) {
  const t = useTranslations('inspections.form.angularity');
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

  const formatNumber = (value: number | string | undefined): string => {
    if (value === undefined || value === null || value === '') return '-';
    return String(value);
  };

  const formatString = (value: string | undefined): string => {
    if (!value || value.trim() === '') return '-';
    return value;
  };

  return (
    <div className="space-y-3">
      {/* Has Been Adjusted */}
      <div className="space-y-1.5">
        <div className="flex justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">{t('hasBeenAdjusted')}:</span>
          <span className="font-medium text-right">{formatYesNoDnc(data.hasBeenAdjusted)}</span>
        </div>
      </div>

      {/* Setup Information */}
      <div className="mt-3">
        <div className="font-semibold text-muted-foreground mb-2 text-xs">
          {t('setupInformation')}
        </div>
        <div className="pl-3 border-l-2 border-muted space-y-1.5">
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('spm')}:</span>
            <span className="font-medium text-right">{formatNumber(data.spm)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('distanceOfIndicatorTip')}:</span>
            <span className="font-medium text-right">
              {formatNumber(data.distanceOfIndicatorTip)}
            </span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('locationOfIndicator')}:</span>
            <span className="font-medium text-right">{formatString(data.locationOfIndicator)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('counterbalancePressure')}:</span>
            <span className="font-medium text-right">
              {formatNumber(data.counterbalancePressure)}
            </span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('strokePartBeingRead')}:</span>
            <span className="font-medium text-right">{formatString(data.strokePartBeingRead)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('shutheightSetAt')}:</span>
            <span className="font-medium text-right">{formatString(data.shutheightSetAt)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('whatWasUsedAsSquare')}:</span>
            <span className="font-medium text-right">{formatString(data.whatWasUsedAsSquare)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('whereWasSquarePlaced')}:</span>
            <span className="font-medium text-right">
              {formatString(data.whereWasSquarePlaced)}
            </span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('indicatorUsedGraduation')}:</span>
            <span className="font-medium text-right">
              {formatString(data.indicatorUsedGraduation)}
            </span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('tipKindOnIndicator')}:</span>
            <span className="font-medium text-right">{formatString(data.tipKindOnIndicator)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('totalLiftCheck')}:</span>
            <span className="font-medium text-right">{formatNumber(data.totalLiftCheck)}</span>
          </div>
        </div>
      </div>

      {/* Before Adjustment */}
      <div className="mt-3">
        <div className="font-semibold text-muted-foreground mb-2 text-xs">
          {t('beforeAdjustment')}
        </div>
        <div className="pl-3 border-l-2 border-muted space-y-1.5">
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('frontRear')} (F-R):</span>
            <span className="font-medium text-right">{formatNumber(data.beforeFR)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('leftRight')} (L-R):</span>
            <span className="font-medium text-right">{formatNumber(data.beforeLR)}</span>
          </div>
        </div>
      </div>

      {/* After Adjustment */}
      <div className="mt-3">
        <div className="font-semibold text-muted-foreground mb-2 text-xs">
          {t('afterAdjustment')}
        </div>
        <div className="pl-3 border-l-2 border-muted space-y-1.5">
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('frontRear')} (F-R):</span>
            <span className="font-medium text-right">{formatNumber(data.afterFR)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('leftRight')} (L-R):</span>
            <span className="font-medium text-right">{formatNumber(data.afterLR)}</span>
          </div>
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
