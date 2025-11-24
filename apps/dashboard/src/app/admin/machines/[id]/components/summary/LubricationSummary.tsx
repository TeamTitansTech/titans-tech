'use client';

import { useTranslations } from 'next-intl';
import type { LubricationHydraulicsData } from '@/data/types/services.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Typography } from '@/components/ui/typography';
import { translateEnumValue } from './utils/translateEnum';

interface LubricationSummaryProps {
  data: LubricationHydraulicsData;
}

export function LubricationSummary({ data }: LubricationSummaryProps) {
  const tTable = useTranslations('table');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tLubricationFields = useTranslations('inspections.form.lubricationHydraulics');
  const tCommon = useTranslations('common.status');

  // Helper function to translate field names
  const translateFieldName = (key: string): string => {
    const translation = tLubricationFields(key);
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

  // Helper function to display value with translations
  const displayValue = (value: unknown): string => {
    return translateEnumValue(value, tCommon);
  };

  // Define all scalar fields that should be shown
  const scalarFieldKeys = ['changedOil', 'oilTemperatureF', 'oilMfgType', 'changedFilter', 'notes'];

  const gauges = Array.isArray(data.gauges) ? data.gauges : [];

  return (
    <div className="text-xs space-y-3">
      {/* Scalar fields table */}
      {scalarFieldKeys.length > 0 && (
        <div className="border-t pt-2 mb-3">
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
                {scalarFieldKeys.map((key) => (
                  <TableRow key={key} className="text-[11px] hover:bg-muted/30">
                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                      {translateFieldName(key)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center">
                      {displayValue(data[key as keyof LubricationHydraulicsData])}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Gauges table */}
      {gauges.length > 0 && (
        <div className="border-t pt-2">
          <div className="font-medium text-muted-foreground mb-2 text-[11px]">
            {tServicesSummary('gauges')}
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-8 text-[10px] font-semibold border-r">
                    {tTable('system')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold border-r">
                    {tTable('gauge')}
                  </TableHead>
                  <TableHead className="h-8 text-[10px] text-center font-semibold">
                    {tTable('psi')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gauges.map((gauge: Record<string, unknown>, idx: number) => (
                  <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                    <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                      {displayValue(gauge.system)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center border-r">
                      {displayValue(gauge.gauge)}
                    </TableCell>
                    <TableCell className="py-1.5 text-center">{displayValue(gauge.psi)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Show message if no data at all */}
      {scalarFieldKeys.length === 0 && gauges.length === 0 && (
        <div className="border-t pt-2">
          <Typography variant="muted" className="text-center py-4 text-xs">
            Nenhum dado disponível
          </Typography>
        </div>
      )}
    </div>
  );
}
