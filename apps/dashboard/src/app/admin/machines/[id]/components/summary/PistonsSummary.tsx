'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PistonsForm } from '../forms/PistonsForm';
import { displayValue } from '../utils/displayHelpers';

interface PistonsSummaryProps {
  data: Record<string, unknown>;
}

export function PistonsSummary({ data }: PistonsSummaryProps) {
  const tServicesSummary = useTranslations('services.modal.summary');
  const tPistons = useTranslations('inspections.form.pistons');
  const tMeasurements = useTranslations('measurements');
  const tCommon = useTranslations('common.status');

  // Helper to display values with translations
  const display = (value: unknown) => displayValue(value, tCommon('yes'), tCommon('no'));

  return (
    <div className="text-xs space-y-4">
      <div className="border-t pt-2 space-y-4">
        {/* Top-level Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-md overflow-hidden">
            <div className="p-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('guidSeals')}:</span>
                <span className="font-medium">{display(data.guidSeals)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('pistonSeals')}:</span>
                <span className="font-medium">{display(data.pistonSeals)}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="p-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tPistons('vacuumSystem')}:</span>
                <span className="font-medium">{display(data.vacuumSystem)}</span>
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
                data={data.outerData}
                errors={{}}
                updateField={() => {}}
                handleBlur={() => {}}
                title="Outer"
                readOnly={true}
              />
            </TabsContent>
          )}

          {data?.innerData && (
            <TabsContent value="inner">
              <PistonsForm
                data={data.innerData}
                errors={{}}
                updateField={() => {}}
                handleBlur={() => {}}
                title="Inner"
                readOnly={true}
              />
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
      </div>
    </div>
  );
}
