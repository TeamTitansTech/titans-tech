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

interface BearingClearanceSummaryProps {
  data: any;
}

export function BearingClearanceSummary({ data }: BearingClearanceSummaryProps) {
  const tServices = useTranslations('services');
  const tTable = useTranslations('table');
  const tBearingFields = useTranslations('bearingFields');
  const tServicesSummary = useTranslations('services.modal.summary');

  // Check if we have before data
  const hasBeforeData =
    (data?.outerBefore && hasActualData(data.outerBefore)) ||
    (data?.innerBefore && hasActualData(data.innerBefore));
  const hasAfterData =
    (data?.outerData && hasActualData(data.outerData)) ||
    (data?.innerData && hasActualData(data.innerData));

  const outerBeforeRows = extractBearingRows(data?.outerBefore, 'BEARING_CLEARANCE');
  const innerBeforeRows = extractBearingRows(data?.innerBefore, 'BEARING_CLEARANCE');
  const outerAfterRows = extractBearingRows(data?.outerData, 'BEARING_CLEARANCE');
  const innerAfterRows = extractBearingRows(data?.innerData, 'BEARING_CLEARANCE');

  return (
    <div>
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

      {/* After Measurements */}
      {hasAfterData && (
        <div className="border-t pt-2">
          {hasBeforeData && (
            <div className="font-semibold text-muted-foreground mb-2 text-sm">
              {tServices('modal.sections.afterMaintenance')}
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
                  {outerAfterRows.map((row, idx) => (
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
                  {innerAfterRows.map((row, idx) => (
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

      {/* Additional Fields */}
      {(hasBeforeData || hasAfterData) && (
        <div className="border-t pt-2 mt-3">
          <div className="font-semibold text-muted-foreground mb-2 text-sm">
            {tServicesSummary('additionalInformation')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Outer Fields */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('outer')}
              </div>
              <div className="p-2 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tBearingFields('combinedWith')}:</span>
                  <span className="font-medium">
                    {displayValue(data?.outerData?.combinedWith || data?.outerBefore?.combinedWith)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tBearingFields('matingPart')}:</span>
                  <span className="font-medium">
                    {displayValue(data?.outerData?.matingPart || data?.outerBefore?.matingPart)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {tBearingFields('hasBeenAdjusted')}:
                  </span>
                  <span className="font-medium">
                    {displayValue(
                      data?.outerData?.hasBeenAdjusted || data?.outerBefore?.hasBeenAdjusted,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Inner Fields */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('inner')}
              </div>
              <div className="p-2 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tBearingFields('combinedWith')}:</span>
                  <span className="font-medium">
                    {displayValue(data?.innerData?.combinedWith || data?.innerBefore?.combinedWith)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tBearingFields('matingPart')}:</span>
                  <span className="font-medium">
                    {displayValue(data?.innerData?.matingPart || data?.innerBefore?.matingPart)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {tBearingFields('hasBeenAdjusted')}:
                  </span>
                  <span className="font-medium">
                    {displayValue(
                      data?.innerData?.hasBeenAdjusted || data?.innerBefore?.hasBeenAdjusted,
                    )}
                  </span>
                </div>
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
                    {displayValue(
                      data?.outerData?.slideMotorMounts || data?.outerBefore?.slideMotorMounts,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tBearingFields('powerCordHoses')}:</span>
                  <span className="font-medium">
                    {displayValue(
                      data?.outerData?.powerCordHoses || data?.outerBefore?.powerCordHoses,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {tBearingFields('chainsGearsSprockets')}:
                  </span>
                  <span className="font-medium">
                    {displayValue(
                      data?.outerData?.chainsGearsSprockets ||
                        data?.outerBefore?.chainsGearsSprockets,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tBearingFields('lockingClamps')}:</span>
                  <span className="font-medium">
                    {displayValue(
                      data?.outerData?.lockingClamps || data?.outerBefore?.lockingClamps,
                    )}
                  </span>
                </div>
                {(data?.outerData?.notes || data?.outerBefore?.notes) && (
                  <div className="flex flex-col gap-1 pt-1 border-t">
                    <span className="text-muted-foreground">{tServicesSummary('notes')}:</span>
                    <span className="font-medium">
                      {displayValue(data?.outerData?.notes || data?.outerBefore?.notes)}
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
