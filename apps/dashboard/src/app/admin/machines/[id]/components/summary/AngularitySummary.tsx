'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AngularitySummaryData {
  // Metadata
  sizeTonnage?: string;
  serialNumber?: string;
  stroke?: string;
  spm?: string;

  // Setup
  distanceIndicatorTipFromSlide?: string;
  locationOfIndicator?: string;
  counterbalancePressure?: string;

  // Configuration
  partOfStrokeBeingRead?: string;
  shutheightSetAt?: string;
  whatWasUsedAsSquare?: string;
  whereWasSquarePlaced?: string;

  // Indicator details
  whatIndicatorWasUsed?: string;
  whatKindOfTipWasOnIndicator?: string;
  totalLiftCheck?: string;

  // Perpendicularity
  hasPerpendicularityBeenAdjusted?: 'YES' | 'NO' | 'DNC';

  // Before/After measurement data
  beforeData?: {
    fr?: number;
    lr?: number;
  };
  afterData?: {
    fr?: number;
    lr?: number;
  };

  // Notes
  notes?: string;
}

interface AngularitySummaryProps {
  data: AngularitySummaryData;
}

export function AngularitySummary({ data }: AngularitySummaryProps) {
  const t = useTranslations('inspections.form.angularity');
  const tCommon = useTranslations('common');
  const tServicesSummary = useTranslations('services.modal.summary');

  // Helper function to display value
  const displayValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'number') {
      return value.toFixed(4);
    }
    return String(value);
  };

  // Helper function to display perpendicularity status with badge
  const displayPerpendicularityStatus = (status?: 'YES' | 'NO' | 'DNC') => {
    if (!status) return <span className="text-muted-foreground">-</span>;

    const statusMap = {
      YES: { label: tCommon('yes'), variant: 'default' as const },
      NO: { label: tCommon('no'), variant: 'secondary' as const },
      DNC: { label: tCommon('dnc'), variant: 'outline' as const },
    };

    const { label, variant } = statusMap[status] || statusMap.DNC;
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Check if we have any metadata
  const hasMetadata = data.sizeTonnage || data.serialNumber || data.stroke || data.spm;

  // Check if we have any setup/config data
  const hasSetupConfig =
    data.distanceIndicatorTipFromSlide ||
    data.locationOfIndicator ||
    data.counterbalancePressure ||
    data.partOfStrokeBeingRead ||
    data.shutheightSetAt ||
    data.whatWasUsedAsSquare ||
    data.whereWasSquarePlaced;

  // Check if we have indicator details
  const hasIndicatorDetails =
    data.whatIndicatorWasUsed || data.whatKindOfTipWasOnIndicator || data.totalLiftCheck;

  // Check if we have measurement data
  const hasBeforeData =
    data.beforeData && (data.beforeData.fr !== undefined || data.beforeData.lr !== undefined);
  const hasAfterData =
    data.afterData && (data.afterData.fr !== undefined || data.afterData.lr !== undefined);
  const hasMeasurements = hasBeforeData || hasAfterData;

  return (
    <div className="text-xs space-y-3">
      {/* Metadata Section */}
      {hasMetadata && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold border-b">
            {t('metadata')}
          </div>
          <div className="p-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            {data.sizeTonnage && (
              <>
                <span className="text-muted-foreground">{t('sizeTonnage')}:</span>
                <span className="font-medium">{displayValue(data.sizeTonnage)}</span>
              </>
            )}
            {data.serialNumber && (
              <>
                <span className="text-muted-foreground">{t('serialNumber')}:</span>
                <span className="font-medium">{displayValue(data.serialNumber)}</span>
              </>
            )}
            {data.stroke && (
              <>
                <span className="text-muted-foreground">{t('stroke')}:</span>
                <span className="font-medium">{displayValue(data.stroke)}</span>
              </>
            )}
            {data.spm && (
              <>
                <span className="text-muted-foreground">{t('spm')}:</span>
                <span className="font-medium">{displayValue(data.spm)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Setup & Configuration Section */}
      {hasSetupConfig && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold border-b">
            {t('setupAndConfiguration')}
          </div>
          <div className="p-2 space-y-1.5 text-[11px]">
            {data.distanceIndicatorTipFromSlide && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('distanceIndicatorTipFromSlide')}:</span>
                <span className="font-medium">
                  {displayValue(data.distanceIndicatorTipFromSlide)}
                </span>
              </div>
            )}
            {data.locationOfIndicator && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('locationOfIndicator')}:</span>
                <span className="font-medium">{displayValue(data.locationOfIndicator)}</span>
              </div>
            )}
            {data.counterbalancePressure && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('counterbalancePressure')}:</span>
                <span className="font-medium">{displayValue(data.counterbalancePressure)}</span>
              </div>
            )}
            {data.partOfStrokeBeingRead && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('partOfStrokeBeingRead')}:</span>
                <span className="font-medium">{displayValue(data.partOfStrokeBeingRead)}</span>
              </div>
            )}
            {data.shutheightSetAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('shutheightSetAt')}:</span>
                <span className="font-medium">{displayValue(data.shutheightSetAt)}</span>
              </div>
            )}
            {data.whatWasUsedAsSquare && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('whatWasUsedAsSquare')}:</span>
                <span className="font-medium">{displayValue(data.whatWasUsedAsSquare)}</span>
              </div>
            )}
            {data.whereWasSquarePlaced && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('whereWasSquarePlaced')}:</span>
                <span className="font-medium">{displayValue(data.whereWasSquarePlaced)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicator Details Section */}
      {hasIndicatorDetails && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold border-b">
            {t('indicatorDetails')}
          </div>
          <div className="p-2 space-y-1.5 text-[11px]">
            {data.whatIndicatorWasUsed && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('whatIndicatorWasUsed')}:</span>
                <span className="font-medium">{displayValue(data.whatIndicatorWasUsed)}</span>
              </div>
            )}
            {data.whatKindOfTipWasOnIndicator && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('whatKindOfTipWasOnIndicator')}:</span>
                <span className="font-medium">
                  {displayValue(data.whatKindOfTipWasOnIndicator)}
                </span>
              </div>
            )}
            {data.totalLiftCheck && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('totalLiftCheck')}:</span>
                <span className="font-medium">{displayValue(data.totalLiftCheck)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Perpendicularity Status */}
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold border-b">
          {t('perpendicularity')}
        </div>
        <div className="p-2 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('hasPerpendicularityBeenAdjusted')}:</span>
            <span>{displayPerpendicularityStatus(data.hasPerpendicularityBeenAdjusted)}</span>
          </div>
        </div>
      </div>

      {/* Measurements Table */}
      {hasMeasurements && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold border-b">
            {t('measurements')}
          </div>
          <div className="p-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px]">{t('measurement')}</TableHead>
                  <TableHead className="h-8 text-[10px] text-center">
                    {t('beforeAdjustment')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center">
                    {t('afterAdjustment')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-[11px]">
                  <TableCell className="py-1.5 font-medium border-r">F-R ({t('fr')})</TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.beforeData?.fr)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.afterData?.fr)}
                  </TableCell>
                </TableRow>
                <TableRow className="text-[11px]">
                  <TableCell className="py-1.5 font-medium border-r">L-R ({t('lr')})</TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.beforeData?.lr)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.afterData?.lr)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {data.notes && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold border-b">
            {tServicesSummary('notes')}
          </div>
          <div className="p-2 text-[11px]">
            <span className="font-medium">{displayValue(data.notes)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
