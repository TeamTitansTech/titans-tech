'use client';

import { useTranslations } from 'next-intl';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import type { ShimThicknessSectionData } from '../sections/ShimThicknessSection';

interface ShimThicknessSummaryProps {
  data: ShimThicknessSectionData;
}

export function ShimThicknessSummary({ data }: ShimThicknessSummaryProps) {
  const t = useTranslations('inspections.form.shimThickness');
  const tSummary = useTranslations('services.modal.summary');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  if (!data) {
    return <div className="text-sm text-muted-foreground">{tSummary('noDataAvailable')}</div>;
  }

  const formatValue = (value: number | undefined): string => {
    if (value === undefined || value === null) return '-';
    // Convert Prisma Decimal to number before conversion
    const numValue = typeof value === 'object' ? Number(value) : value;
    const converted = convertLengthFromDefault(numValue);
    return `${Number(converted).toFixed(4)} ${getLengthUnitLabel()}`;
  };

  const renderDataBlock = (
    label: string,
    blockData: { top?: number; bottom?: number; left?: number; right?: number } | undefined,
  ) => {
    if (!blockData) return null;

    const hasAnyData =
      blockData.top !== undefined ||
      blockData.bottom !== undefined ||
      blockData.left !== undefined ||
      blockData.right !== undefined;

    if (!hasAnyData) return null;

    return (
      <div className="mt-3">
        <div className="font-semibold text-muted-foreground mb-2 text-xs">{label}</div>
        <div className="pl-3 border-l-2 border-muted space-y-1.5">
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('top')}:</span>
            <span className="font-medium text-right">{formatValue(blockData.top)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('bottom')}:</span>
            <span className="font-medium text-right">{formatValue(blockData.bottom)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('left')}:</span>
            <span className="font-medium text-right">{formatValue(blockData.left)}</span>
          </div>
          <div className="flex justify-between gap-2 text-[11px]">
            <span className="text-muted-foreground">{t('right')}:</span>
            <span className="font-medium text-right">{formatValue(blockData.right)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {renderDataBlock(`${t('outer')} ${t('lh')}`, data.outerLhData)}
      {renderDataBlock(`${t('outer')} ${t('rh')}`, data.outerRhData)}
      {renderDataBlock(`${t('inner')} ${t('lh')}`, data.innerLhData)}
      {renderDataBlock(`${t('inner')} ${t('rh')}`, data.innerRhData)}
      {data.notes && (
        <div className="mt-3">
          <div className="font-semibold text-muted-foreground mb-2 text-xs">{t('notes')}</div>
          <div className="text-[11px] pl-3 border-l-2 border-muted">{data.notes}</div>
        </div>
      )}
    </div>
  );
}
