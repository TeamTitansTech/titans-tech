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
import { calculateMaxDeviation } from '../utils/sectionDataUtils';

interface SlideSummaryProps {
  data: any;
}

export function SlideSummary({ data }: SlideSummaryProps) {
  const tSlide = useTranslations('inspections.form.slide');
  const tSlideFields = useTranslations('inspections.form.slide.fields');
  const tTable = useTranslations('table');
  const tMeasurements = useTranslations('measurements');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tCommon = useTranslations('common.status');

  // Helper function to translate field names
  const translateFieldName = (key: string): string => {
    const translation = tSlideFields(key);
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
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
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

    return stringValue;
  };

  // Define all section-level fields that should be shown
  const sectionLevelFields = [
    'outerParallelism',
    'outerHasParallelismBeenAdjusted',
    'innerParallelism',
    'innerHasParallelismBeenAdjusted',
    'outerShutheightIndicatorsChecked',
    'outerOverloadsOnTonnageMonitor',
    'outerShutheightActualSh',
    'outerIndicatorReading',
    'innerShutheightIndicatorsChecked',
    'innerOverloadsOnTonnageMonitor',
    'innerShutheightActualSh',
    'innerIndicatorReading',
    'notes',
  ];

  return (
    <div className="text-xs space-y-3">
      {/* Section-level fields table - Show all fields */}
      {sectionLevelFields.some((key) => key in data) && (
        <div className="border-t pt-2">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {tServicesSummary('sectionFields')}
          </div>
          <div className="border rounded-md overflow-hidden">
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
                {sectionLevelFields.map((key) => (
                  <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                      {translateFieldName(key)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center">{displayValue(data[key])}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Outer Before Measurements */}
      {data.outerBefore && (
        <div className="border-t pt-3 mt-3">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {tMeasurements('outerBeforeMaintenance')}
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 1</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 2</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 3</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 4</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 5</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 6</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                    {tSlide('maxDeviation')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-[11px]">
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerBefore.position1)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerBefore.position2)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerBefore.position3)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerBefore.position4)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerBefore.position5)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerBefore.position6)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                    {calculateMaxDeviation(data.outerBefore)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Outer After Measurements */}
      {data.outerData && (
        <div className="border-t pt-3 mt-3">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {data.outerBefore
              ? tMeasurements('outerAfterMaintenance')
              : tMeasurements('outerMeasurements')}
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 1</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 2</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 3</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 4</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 5</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 6</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                    {tSlide('maxDeviation')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-[11px]">
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerData.position1)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerData.position2)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerData.position3)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerData.position4)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerData.position5)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.outerData.position6)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                    {calculateMaxDeviation(data.outerData)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Inner Before Measurements */}
      {data.innerBefore && (
        <div className="border-t pt-3 mt-3">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {tMeasurements('innerBeforeMaintenance')}
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 1</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 2</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 3</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 4</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 5</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 6</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                    {tSlide('maxDeviation')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-[11px]">
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerBefore.position1)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerBefore.position2)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerBefore.position3)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerBefore.position4)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerBefore.position5)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerBefore.position6)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                    {calculateMaxDeviation(data.innerBefore)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Inner After Measurements */}
      {data.innerData && (
        <div className="border-t pt-3 mt-3">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {data.innerBefore
              ? tMeasurements('innerAfterMaintenance')
              : tMeasurements('innerMeasurements')}
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 1</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 2</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 3</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 4</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 5</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center">Pos 6</TableHead>
                  <TableHead className="h-8 text-[10px] font-semibold text-center bg-blue-50 dark:bg-blue-950">
                    {tSlide('maxDeviation')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-[11px]">
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerData.position1)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerData.position2)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerData.position3)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerData.position4)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerData.position5)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {displayValue(data.innerData.position6)}
                  </TableCell>
                  <TableCell className="py-1.5 text-center font-semibold bg-blue-50 dark:bg-blue-950">
                    {calculateMaxDeviation(data.innerData)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
