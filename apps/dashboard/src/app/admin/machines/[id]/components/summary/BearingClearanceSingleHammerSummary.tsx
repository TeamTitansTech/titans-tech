'use client';

import { useTranslations } from 'next-intl';
import type { BearingClearanceSingleHammerCheck } from '@/data/types/services.types';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { hasActualData, extractBearingRows } from '../utils/sectionDataUtils';
import { formatFieldName } from '../utils/fieldFormatters';
import { translateEnumValue } from './utils/translateEnum';
import { useUnitManager } from '@/contexts/UnitManagerContext';

interface BearingClearanceSingleHammerSummaryProps {
  data: BearingClearanceSingleHammerCheck;
}

export function BearingClearanceSingleHammerSummary({
  data,
}: BearingClearanceSingleHammerSummaryProps) {
  const tServices = useTranslations('services');
  const tTable = useTranslations('table');
  const tBearingFields = useTranslations('bearingFields');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tCommon = useTranslations('common.status');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  // Return null if no data provided
  if (!data) {
    return null;
  }

  // Access nested properties with proper types (single hammer - no inner/outer)
  const beforeData = data?.beforeData;
  const afterData = data?.data;

  // Helper function to translate field names
  const translateFieldName = (key: string): string => {
    const translation = tBearingFields(key);
    if (translation !== key) return translation;
    // Fallback to formatFieldName
    return formatFieldName(key);
  };

  // Helper function to display value with translations
  const displayValue = (value: unknown): string => {
    return translateEnumValue(value, tCommon);
  };

  // Helper to display numeric value with unit conversion
  // Treats 0 as empty since database stores 0 for unfilled numeric fields
  const displayNumericValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return '-';
    }
    const numValue = Number(value);
    if (isNaN(numValue) || numValue === 0) {
      return numValue === 0 ? '-' : translateEnumValue(value, tCommon);
    }
    // Convert from storage unit (inches) to display unit
    const convertedValue = convertLengthFromDefault(numValue);
    return convertedValue.toFixed(4);
  };

  // Helper to convert differential value
  const displayDifferential = (diff: string): string => {
    if (diff === '-') return diff;
    const numValue = parseFloat(diff);
    if (isNaN(numValue)) return diff;
    const convertedValue = convertLengthFromDefault(numValue);
    return convertedValue.toFixed(4);
  };

  const unitLabel = getLengthUnitLabel();

  // Check if we have before data
  const hasBeforeData: boolean = !!(beforeData && hasActualData(beforeData));
  const hasAfterData: boolean = !!(afterData && hasActualData(afterData));

  const beforeRows = extractBearingRows(beforeData, 'BEARING_CLEARANCE');
  const afterRows = extractBearingRows(afterData, 'BEARING_CLEARANCE');

  return (
    <div>
      {/* Before Measurements (only if data exists) */}
      {hasBeforeData && (
        <div className="border-t pt-2 mb-3">
          <div className="font-semibold text-muted-foreground mb-2 text-sm">
            {tServices('modal.sections.beforeMaintenance')}{' '}
            <span className="text-[10px] italic font-normal">({unitLabel})</span>
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px] font-semibold border-r">
                    {tTable('field')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                    {tTable('lh')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                    {tTable('rh')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold">
                    {tTable('diff')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beforeRows.map((row, idx) => (
                  <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                      {translateFieldName(row.field)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center border-r">
                      {displayNumericValue(row.lh)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center border-r">
                      {displayNumericValue(row.rh)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center">
                      {displayDifferential(row.differential)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* After Measurements */}
      {hasAfterData && (
        <div className="border-t pt-2">
          {hasBeforeData && (
            <div className="font-semibold text-muted-foreground mb-2 text-sm">
              {tServices('modal.sections.afterMaintenance')}{' '}
              <span className="text-[10px] italic font-normal">({unitLabel})</span>
            </div>
          )}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px] font-semibold border-r">
                    {tTable('field')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                    {tTable('lh')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                    {tTable('rh')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold">
                    {tTable('diff')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {afterRows.map((row, idx) => (
                  <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                      {translateFieldName(row.field)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center border-r">
                      {displayNumericValue(row.lh)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center border-r">
                      {displayNumericValue(row.rh)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center">
                      {displayDifferential(row.differential)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Additional Fields */}
      {(hasBeforeData || hasAfterData) && (
        <div className="border-t pt-2 mt-3">
          <div className="font-semibold text-muted-foreground mb-2 text-sm">
            {tServicesSummary('additionalInformation')}
          </div>
          <div className="border rounded-md overflow-hidden">
            <div className="p-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tBearingFields('combinedWith')}:</span>
                <span className="font-medium">
                  {displayValue(afterData?.combinedWith || beforeData?.combinedWith)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tBearingFields('matingPart')}:</span>
                <span className="font-medium">
                  {displayValue(afterData?.matingPart || beforeData?.matingPart)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tBearingFields('hasBeenAdjusted')}:</span>
                <span className="font-medium">
                  {displayValue(afterData?.hasBeenAdjusted || beforeData?.hasBeenAdjusted)}
                </span>
              </div>
            </div>
          </div>

          {/* Shutdown Adjustment Mechanism */}
          <div className="mt-3">
            <div className="font-semibold text-muted-foreground mb-2 text-xs">
              {tServicesSummary('shutdownAdjustmentMechanism')}
            </div>
            <div className="border rounded-md overflow-hidden">
              <div className="p-2 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {tBearingFields('slideMotorMounts')}:
                  </span>
                  <span className="font-medium">
                    {displayValue(afterData?.slideMotorMounts || beforeData?.slideMotorMounts)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tBearingFields('powerCordHoses')}:</span>
                  <span className="font-medium">
                    {displayValue(afterData?.powerCordHoses || beforeData?.powerCordHoses)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {tBearingFields('chainsGearsSprockets')}:
                  </span>
                  <span className="font-medium">
                    {displayValue(
                      afterData?.chainsGearsSprockets || beforeData?.chainsGearsSprockets,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tBearingFields('lockingClamps')}:</span>
                  <span className="font-medium">
                    {displayValue(afterData?.lockingClamps || beforeData?.lockingClamps)}
                  </span>
                </div>
                {!!(afterData?.notes || beforeData?.notes) && (
                  <div className="flex flex-col gap-1 pt-1 border-t">
                    <span className="text-muted-foreground">{tServicesSummary('notes')}:</span>
                    <span className="font-medium">
                      {displayValue(afterData?.notes || beforeData?.notes)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
