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
import { hasActualData, extractBearingRows } from '../utils/sectionDataUtils';
import { displayValue } from '../utils/fieldFormatters';

interface GibsSummaryProps {
  data: Record<string, unknown>;
}

export function GibsSummary({ data }: GibsSummaryProps) {
  const tTable = useTranslations('table');
  const tServices = useTranslations('services');
  const tServicesSummary = useTranslations('services.modal.summary');

  // Type helpers for accessing nested properties
  const outerData = data?.outerData as Record<string, unknown> | undefined;
  const innerData = data?.innerData as Record<string, unknown> | undefined;
  const outerBefore = data?.outerBefore as Record<string, unknown> | undefined;
  const innerBefore = data?.innerBefore as Record<string, unknown> | undefined;

  // Check if we have before data
  const hasBeforeData: boolean =
    !!(outerBefore && hasActualData(outerBefore)) || !!(innerBefore && hasActualData(innerBefore));
  const hasAfterData: boolean =
    !!(outerData && hasActualData(outerData)) || !!(innerData && hasActualData(innerData));

  const outerBeforeRows = extractBearingRows(outerBefore);
  const innerBeforeRows = extractBearingRows(innerBefore);
  const outerDataRows = extractBearingRows(outerData);
  const innerDataRows = extractBearingRows(innerData);

  return (
    <div className="text-xs space-y-3">
      {/* Before Measurements (only if data exists) */}
      {hasBeforeData && (
        <div className="border-t pt-2 mb-3">
          <div className="font-semibold text-muted-foreground mb-2 text-sm">
            {tServices('modal.sections.beforeMaintenance')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Outer Table */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('outer')}
              </div>
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
                  {outerBeforeRows.map((row, idx) => (
                    <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                      <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                        {row.field}
                      </TableCell>
                      <TableCell className="py-1.5 text-center border-r">
                        {displayValue(row.lh)}
                      </TableCell>
                      <TableCell className="py-1.5 text-center border-r">
                        {displayValue(row.rh)}
                      </TableCell>
                      <TableCell className="py-1.5 text-center">{row.differential}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Inner Table */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('inner')}
              </div>
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
                  {innerBeforeRows.map((row, idx) => (
                    <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                      <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                        {row.field}
                      </TableCell>
                      <TableCell className="py-1.5 text-center border-r">
                        {displayValue(row.lh)}
                      </TableCell>
                      <TableCell className="py-1.5 text-center border-r">
                        {displayValue(row.rh)}
                      </TableCell>
                      <TableCell className="py-1.5 text-center">{row.differential}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Data Measurements */}
      {hasAfterData && (
        <div className="border-t pt-2">
          {hasBeforeData && (
            <div className="font-semibold text-muted-foreground mb-2 text-sm">
              {tServicesSummary('dataMeasurements')}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {/* Outer Table */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('outer')}
              </div>
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
                  {outerDataRows.map((row, idx) => (
                    <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                      <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                        {row.field}
                      </TableCell>
                      <TableCell className="py-1.5 text-center border-r">
                        {displayValue(row.lh)}
                      </TableCell>
                      <TableCell className="py-1.5 text-center border-r">
                        {displayValue(row.rh)}
                      </TableCell>
                      <TableCell className="py-1.5 text-center">{row.differential}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Inner Table */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('inner')}
              </div>
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
                  {innerDataRows.map((row, idx) => (
                    <TableRow key={idx} className="text-[11px] hover:bg-muted/30">
                      <TableCell className="py-1.5 font-medium border-r bg-muted/20">
                        {row.field}
                      </TableCell>
                      <TableCell className="py-1.5 text-center border-r">
                        {displayValue(row.lh)}
                      </TableCell>
                      <TableCell className="py-1.5 text-center border-r">
                        {displayValue(row.rh)}
                      </TableCell>
                      <TableCell className="py-1.5 text-center">{row.differential}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
