'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { PistonsCheck, LatestPistons } from '@/data/types/services.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PistonsForm, type PistonsDbData } from '../forms/PistonsForm';
import { displayValue } from '../utils/displayHelpers';
import { cn } from '@/lib/utils';
import { SectionAttachments } from './SectionAttachments';
import { useUnitManager } from '@/contexts/UnitManagerContext';

type AlertSeverity = 'NONE' | 'GREEN' | 'YELLOW' | 'RED';

interface PistonsSummaryProps {
  data: PistonsCheck;
  alert?: LatestPistons['alert'];
}

// Helper to get color class based on severity
const getSeverityColorClass = (severity: AlertSeverity | undefined): string => {
  switch (severity) {
    case 'RED':
      return 'text-red-500 font-bold';
    case 'YELLOW':
      return 'text-yellow-500 font-semibold';
    case 'GREEN':
      return 'text-green-500';
    default:
      return '';
  }
};

// Helper to get severity icon
const getSeverityIcon = (severity: AlertSeverity | undefined): string => {
  switch (severity) {
    case 'RED':
      return '🔴';
    case 'YELLOW':
      return '🟡';
    case 'GREEN':
      return '🟢';
    default:
      return '';
  }
};

export function PistonsSummary({ data, alert }: PistonsSummaryProps): React.ReactElement | null {
  const tServicesSummary = useTranslations('services.modal.summary');
  const tPistons = useTranslations('inspections.form.pistons');
  const tMeasurements = useTranslations('measurements');
  const tCommon = useTranslations('common.status');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  // Return null if no data provided
  if (!data) {
    return null;
  }

  // Helper to display values with translations
  const display = (value: unknown): string => displayValue(value, tCommon('yes'), tCommon('no'));

  // Render calculated differences section
  const renderDifferences = (prefix: 'outer' | 'inner', label: string) => {
    if (!alert) return null;

    const differences = [
      {
        label: 'LH Left-Right',
        diff: prefix === 'outer' ? alert.outer_lhLeftRight_diff : alert.inner_lhLeftRight_diff,
        severity:
          prefix === 'outer' ? alert.outer_lhLeftRight_severity : alert.inner_lhLeftRight_severity,
      },
      {
        label: 'LH Top-Bottom',
        diff: prefix === 'outer' ? alert.outer_lhTopBottom_diff : alert.inner_lhTopBottom_diff,
        severity:
          prefix === 'outer' ? alert.outer_lhTopBottom_severity : alert.inner_lhTopBottom_severity,
      },
      {
        label: 'RH Left-Right',
        diff: prefix === 'outer' ? alert.outer_rhLeftRight_diff : alert.inner_rhLeftRight_diff,
        severity:
          prefix === 'outer' ? alert.outer_rhLeftRight_severity : alert.inner_rhLeftRight_severity,
      },
      {
        label: 'RH Top-Bottom',
        diff: prefix === 'outer' ? alert.outer_rhTopBottom_diff : alert.inner_rhTopBottom_diff,
        severity:
          prefix === 'outer' ? alert.outer_rhTopBottom_severity : alert.inner_rhTopBottom_severity,
      },
    ];

    // Only render if at least one difference has a value
    if (!differences.some((d) => d.diff !== null && d.diff !== undefined)) {
      return null;
    }

    return (
      <div className="mt-3 border rounded-md p-2 bg-muted/10">
        <div className="font-medium text-muted-foreground mb-2 text-xs">{label}</div>
        <div className="grid grid-cols-2 gap-2">
          {differences.map((d, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-[11px] p-1 border rounded bg-background"
            >
              <span className="text-muted-foreground">{d.label}:</span>
              <span className={cn('font-mono', getSeverityColorClass(d.severity))}>
                {d.diff !== null && d.diff !== undefined
                  ? `${convertLengthFromDefault(Number(d.diff)).toFixed(4)} ${getLengthUnitLabel()} ${getSeverityIcon(d.severity)}`
                  : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="text-xs space-y-4">
      <div className="border-t pt-2 space-y-4">
        {/* Top-level Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-md overflow-hidden">
            <div className="p-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('guideSeals')}:</span>
                <span className="font-medium">
                  {displayValue(data.guideSeals, tCommon('yes'), tCommon('no'))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('pistonSeals')}:</span>
                <span className="font-medium">
                  {displayValue(data.pistonSeals, tCommon('yes'), tCommon('no'))}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="p-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('vacuumSystem')}:</span>
                <span className="font-medium">
                  {displayValue(data.vacuumSystem, tCommon('yes'), tCommon('no'))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {tPistons('vacuumSystemAirPressureSetting')}:
                </span>
                <span className="font-medium">
                  {data.vacuumSystemAirPressureSetting ? data.vacuumSystemAirPressureSetting : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Render actual pistons forms in read-only mode */}
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outer">
              <span className="hidden sm:inline">{tMeasurements('outerMeasurements')}</span>
              <span className="sm:hidden">Outer</span>
            </TabsTrigger>
            <TabsTrigger value="inner">
              <span className="hidden sm:inline">{tMeasurements('innerMeasurements')}</span>
              <span className="sm:hidden">Inner</span>
            </TabsTrigger>
          </TabsList>

          {data?.outerData && (
            <TabsContent value="outer">
              <PistonsForm
                data={data.outerData as unknown as PistonsDbData}
                errors={{}}
                updateField={() => {}}
                handleBlur={() => {}}
                readOnly={true}
              />
              {renderDifferences('outer', 'Calculated Differences (Outer)')}
            </TabsContent>
          )}

          {data?.innerData && (
            <TabsContent value="inner">
              <PistonsForm
                data={data.innerData as unknown as PistonsDbData}
                errors={{}}
                updateField={() => {}}
                handleBlur={() => {}}
                readOnly={true}
              />
              {renderDifferences('inner', 'Calculated Differences (Inner)')}
            </TabsContent>
          )}
        </Tabs>

        {/* Notes */}
        {data?.notes && (
          <div className="border-t pt-2">
            <div className="font-semibold text-muted-foreground mb-2 text-xs">
              {tServicesSummary('notes')}
            </div>
            <div className="border rounded-md overflow-hidden">
              <div className="p-2 text-[11px]">
                <span className="font-medium">{display(data.notes)}</span>
              </div>
            </div>
          </div>
        )}

        <SectionAttachments attachments={data.attachments} />
      </div>
    </div>
  );
}
