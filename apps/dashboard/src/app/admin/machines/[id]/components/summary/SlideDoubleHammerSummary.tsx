'use client';

import { useTranslations } from 'next-intl';
import type { SlideDoubleHammerCheck, SlideData } from '@/data/types/services.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUnitManager } from '@/contexts/UnitManagerContext';

interface SlideDoubleHammerSummaryProps {
  data: SlideDoubleHammerCheck;
}

export function SlideDoubleHammerSummary({ data }: SlideDoubleHammerSummaryProps) {
  const tSlide = useTranslations('inspections.form.slide');
  const tTable = useTranslations('table');
  const tMeasurements = useTranslations('measurements');
  const tCommon = useTranslations('common.status');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  // Return null if no data provided
  if (!data) {
    return null;
  }

  // Helper function to translate field names
  const translateFieldName = (key: string): string => {
    const translation = tSlide(key);
    if (translation !== key) return translation;
    // Fallback to formatFieldName
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to display value with translations
  const displayValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    // Handle NaN values
    if (typeof value === 'number' && isNaN(value)) {
      return '-';
    }
    // Handle string 'NaN'
    if (String(value) === 'NaN') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? tCommon('yes') : tCommon('no');
    }
    // Translate enum values
    const stringValue = String(value);
    if (stringValue === 'YES') return tCommon('yes');
    if (stringValue === 'NO') return tCommon('no');
    if (stringValue === 'DNC') return tCommon('dnc');
    if (stringValue === 'NA') return tCommon('na');
    if (stringValue === 'TO_BED') return tSlide('toBed');
    if (stringValue === 'TO_BOLSTER') return tSlide('toBolster');

    return stringValue;
  };

  // Helper function to display numeric value with unit conversion
  // Treats 0 as empty since database stores 0 for unfilled numeric fields
  const displayNumericValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return '-';
    }
    const numValue = Number(value);
    if (isNaN(numValue) || numValue === 0) {
      return '-';
    }
    // Convert from storage unit (mm) to display unit
    const convertedValue = convertLengthFromDefault(numValue);
    return convertedValue.toFixed(4);
  };

  // Calculate max deviation for positions
  // Zero is a valid measurement and should be included in the calculation
  const calculateMaxDeviation = (slideData: SlideData | undefined): string => {
    if (!slideData) return '-';

    const positions = [
      slideData.position1,
      slideData.position2,
      slideData.position3,
      slideData.position4,
      slideData.position5,
    ];

    const validValues = positions.filter(
      (val): val is number => val !== undefined && val !== null && !isNaN(Number(val)),
    );

    if (validValues.length > 1) {
      const max = Math.max(...validValues);
      const min = Math.min(...validValues);
      // Convert to display unit
      const deviationInDisplayUnit = convertLengthFromDefault(max - min);
      return deviationInDisplayUnit.toFixed(4);
    }
    return '-';
  };

  // Render position measurements table
  const renderPositionsTable = (slideData: SlideData | undefined) => {
    if (!slideData) return null;

    const positions = [
      slideData.position1,
      slideData.position2,
      slideData.position3,
      slideData.position4,
      slideData.position5,
    ];

    const unitLabel = getLengthUnitLabel();

    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {positions.map((_, idx) => (
              <TableHead key={idx} className="h-8 text-[10px] font-semibold text-center">
                Pos {idx + 1}
              </TableHead>
            ))}
            <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
              {tSlide('maxDeviation')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="text-[11px]">
            {positions.map((val, idx) => (
              <TableCell key={idx} className="py-1.5 text-center">
                {displayNumericValue(val)}
              </TableCell>
            ))}
            <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
              {calculateMaxDeviation(slideData)}
            </TableCell>
          </TableRow>
          {/* Show unit label */}
          <TableRow className="text-[10px] text-muted-foreground">
            <TableCell colSpan={6} className="py-1 text-center italic">
              ({unitLabel})
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  };

  // Render metadata fields
  const renderMetadataTable = (slideData: SlideData | undefined) => {
    if (!slideData) return null;

    const metadataFields = [
      { key: 'parallelism', label: translateFieldName('parallelism') },
      {
        key: 'hasParallelismBeenAdjusted',
        label: translateFieldName('hasParallelismBeenAdjusted'),
      },
      {
        key: 'shutheightIndicatorsChecked',
        label: translateFieldName('shutheightIndicatorsChecked'),
      },
      { key: 'overloadsOnTonnageMonitor', label: translateFieldName('overloadsOnTonnageMonitor') },
      { key: 'shutheightActualSh', label: translateFieldName('shutheightActualSh') },
      { key: 'indicatorReading', label: translateFieldName('indicatorReading') },
    ];

    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="h-8 text-[10px] font-semibold border-r">
              {tTable('field')}
            </TableHead>
            <TableHead className="h-8 text-[10px] text-center font-semibold">
              {tTable('value')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metadataFields.map((field) => (
            <TableRow key={field.key} className="text-[11px] hover:bg-muted/30">
              <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                {field.label}
              </TableCell>
              <TableCell className="py-1.5 text-center">
                {displayValue((slideData as any)[field.key])}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="text-xs space-y-3">
      {/* Outer Data */}
      {(data.outerData || data.outerBefore) && (
        <div className="border-t pt-3">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {tMeasurements('outerMeasurements')}
          </div>

          {/* Outer Metadata (from outerData or outerBefore) */}
          <div className="border rounded-md overflow-hidden mb-3">
            {renderMetadataTable(data.outerData || data.outerBefore)}
          </div>

          {/* Outer Before Measurements (if exists) */}
          {data.outerBefore && (
            <div className="mb-3">
              <div className="font-medium text-muted-foreground mb-2 text-[10px]">
                {tSlide('beforeAdjustment')}
              </div>
              <div className="border rounded-md overflow-hidden">
                {renderPositionsTable(data.outerBefore)}
              </div>
            </div>
          )}

          {/* Outer After/Current Measurements */}
          {data.outerData && (
            <div>
              <div className="font-medium text-muted-foreground mb-2 text-[10px]">
                {data.outerBefore ? tSlide('afterAdjustment') : tSlide('measurements')}
              </div>
              <div className="border rounded-md overflow-hidden">
                {renderPositionsTable(data.outerData)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inner Data */}
      {(data.innerData || data.innerBefore) && (
        <div className="border-t pt-3 mt-3">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {tMeasurements('innerMeasurements')}
          </div>

          {/* Inner Metadata (from innerData or innerBefore) */}
          <div className="border rounded-md overflow-hidden mb-3">
            {renderMetadataTable(data.innerData || data.innerBefore)}
          </div>

          {/* Inner Before Measurements (if exists) */}
          {data.innerBefore && (
            <div className="mb-3">
              <div className="font-medium text-muted-foreground mb-2 text-[10px]">
                {tSlide('beforeAdjustment')}
              </div>
              <div className="border rounded-md overflow-hidden">
                {renderPositionsTable(data.innerBefore)}
              </div>
            </div>
          )}

          {/* Inner After/Current Measurements */}
          {data.innerData && (
            <div>
              <div className="font-medium text-muted-foreground mb-2 text-[10px]">
                {data.innerBefore ? tSlide('afterAdjustment') : tSlide('measurements')}
              </div>
              <div className="border rounded-md overflow-hidden">
                {renderPositionsTable(data.innerData)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="border-t pt-3 mt-3">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {tSlide('notes')}
          </div>
          <div className="border rounded-md p-3 bg-muted/20">
            <p className="text-[11px] whitespace-pre-wrap">{data.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
