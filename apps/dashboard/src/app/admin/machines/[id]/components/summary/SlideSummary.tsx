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

interface SlideSummaryProps {
  data: any;
}

export function SlideSummary({ data }: SlideSummaryProps) {
  const tSlide = useTranslations('inspections.form.slide');
  const tSlideFields = useTranslations('inspections.form.slide.fields');
  const tTable = useTranslations('table');
  const tMeasurements = useTranslations('measurements');
  const tServicesSummary = useTranslations('services.modal.summary');

  // Helper function to check if a field is an ID field
  const isIdField = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    return (
      key === 'id' ||
      key.endsWith('Id') ||
      key.endsWith('ID') ||
      lowerKey === 'id' ||
      lowerKey === 'createdat' ||
      lowerKey === 'updatedat' ||
      key === 'createdAt' ||
      key === 'updatedAt' ||
      key === 'created_at' ||
      key === 'updated_at'
    );
  };

  // Helper function to check if a field should be shown in Slide section summary
  const isSlideFieldAllowedInSummary = (key: string): boolean => {
    // Position fields (not allowed)
    if (key.startsWith('position')) return false;

    // Only allow specific fields
    const allowedFields = [
      // These fields are at the section level, not in nested objects
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

    return allowedFields.includes(key);
  };

  // Helper function to calculate max deviation from slide position data
  const calculateMaxDeviation = (data: any): string => {
    if (!data) return '-';

    const positions = [
      data.position1,
      data.position2,
      data.position3,
      data.position4,
      data.position5,
      data.position6,
    ];
    const validValues = positions.filter(
      (val) => val !== undefined && val !== null && !isNaN(val) && val !== 0,
    );

    if (validValues.length > 1) {
      const max = Math.max(...validValues);
      const min = Math.min(...validValues);
      return (max - min).toFixed(4);
    }
    return '-';
  };

  // Helper function to translate field names
  const translateFieldName = (key: string): string => {
    const translation = tSlideFields(key);
    if (translation !== key) return translation;
    // Fallback to formatFieldName
    return formatFieldName(key);
  };

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to display value or "-" for empty
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle enum translations
    const stringValue = String(value);

    // Translate ParallelismType values
    if (stringValue === 'TO_BED') {
      return tSlide('toBed');
    }
    if (stringValue === 'TO_BOLSTER') {
      return tSlide('toBolster');
    }
    if (stringValue === 'DNC') {
      return tSlide('dnc');
    }

    // Translate Yes/No/NA values
    if (stringValue === 'YES') {
      return tSlide('yes');
    }
    if (stringValue === 'NO') {
      return tSlide('no');
    }
    if (stringValue === 'NA') {
      return tSlide('na');
    }

    return stringValue;
  };

  return (
    <div className="text-xs space-y-3">
      {/* Section-level fields table - Only specific fields */}
      {Object.entries(data).filter(
        ([key, value]) =>
          !isIdField(key) &&
          isSlideFieldAllowedInSummary(key) &&
          key !== 'outerData' &&
          key !== 'innerData' &&
          key !== 'outerBefore' &&
          key !== 'innerBefore' &&
          (typeof value !== 'object' || value === null) &&
          value !== null &&
          value !== undefined &&
          value !== '',
      ).length > 0 && (
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
                {Object.entries(data)
                  .filter(
                    ([key, value]) =>
                      !isIdField(key) &&
                      isSlideFieldAllowedInSummary(key) &&
                      key !== 'outerData' &&
                      key !== 'innerData' &&
                      key !== 'outerBefore' &&
                      key !== 'innerBefore' &&
                      (typeof value !== 'object' || value === null) &&
                      value !== null &&
                      value !== undefined &&
                      value !== '',
                  )
                  .map(([key, value]) => (
                    <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                      <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                        {translateFieldName(key)}
                      </TableCell>
                      <TableCell className="py-1.5 text-center">{displayValue(value)}</TableCell>
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
