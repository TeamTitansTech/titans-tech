'use client';

import { useTranslations } from 'next-intl';
import type { PerpendicularityCheck } from '@/data/types/services.types';

interface PerpendiculariySummaryProps {
  data: PerpendicularityCheck;
}

export function PerpendiculariySummary({ data }: PerpendiculariySummaryProps) {
  const t = useTranslations('inspections.form.perpendicularity');
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

  return (
    <div className="space-y-3">
      {/* Has Been Adjusted */}
      <div className="space-y-1.5">
        <div className="flex justify-between gap-2 text-[11px]">
          <span className="text-muted-foreground">{t('hasBeenAdjusted')}:</span>
          <span className="font-medium text-right">{formatYesNoDnc(data.hasBeenAdjusted)}</span>
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
    </div>
  );
}
