'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PistonsForm } from '../forms/PistonsForm';

interface PistonsSummaryProps {
  data: any;
}

export function PistonsSummary({ data }: PistonsSummaryProps) {
  const tServicesSummary = useTranslations('services.modal.summary');
  const tPistons = useTranslations('inspections.form.pistons');
  const tMeasurements = useTranslations('measurements');
  const tCommon = useTranslations('common.status');

  // Helper function to display value or "-" for empty
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? tCommon('yes') : tCommon('no');
    }
    return String(value);
  };

  return (
    <div className="text-xs space-y-4">
      <div className="border-t pt-2 space-y-4">
        {/* Top-level Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-md overflow-hidden">
            <div className="p-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('guidSeals')}:</span>
                <span className="font-medium">{displayValue(data.guidSeals)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('pistonSeals')}:</span>
                <span className="font-medium">{displayValue(data.pistonSeals)}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="p-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('vacuumSystem')}:</span>
                <span className="font-medium">{displayValue(data.vacuumSystem)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {tPistons('vacuumSystemAirPressureSetting')}:
                </span>
                <span className="font-medium">
                  {data?.vacuumSystemAirPressureSetting
                    ? `${data.vacuumSystemAirPressureSetting} ${data.vacuumSystemAirPressureUnit || 'PSI'}`
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('unit')}:</span>
                <span className="font-medium">{data?.unit || 'inches'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Render actual pistons forms in read-only mode */}
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outer">{tMeasurements('outerMeasurements')}</TabsTrigger>
            <TabsTrigger value="inner">{tMeasurements('innerMeasurements')}</TabsTrigger>
          </TabsList>

          {data?.outerData && (
            <TabsContent value="outer">
              <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
                <PistonsForm
                  data={data.outerData}
                  errors={{}}
                  updateField={() => {}}
                  handleBlur={() => {}}
                  title="Outer"
                  readOnly={true}
                />
              </div>
            </TabsContent>
          )}

          {data?.innerData && (
            <TabsContent value="inner">
              <div className="bg-muted/20 dark:bg-slate-700/40 border border-border/50 dark:border-slate-600/50 rounded-lg p-4">
                <PistonsForm
                  data={data.innerData}
                  errors={{}}
                  updateField={() => {}}
                  handleBlur={() => {}}
                  title="Inner"
                  readOnly={true}
                />
              </div>
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
                <span className="font-medium">{displayValue(data.notes)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
