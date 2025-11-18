'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrammingForm } from '../forms/TrammingForm';
import { displayValue } from '../utils/displayHelpers';

interface TrammingSummaryProps {
  data: any;
}

export function TrammingSummary({ data }: TrammingSummaryProps) {
  const tServicesSummary = useTranslations('services.modal.summary');
  const tTramming = useTranslations('inspections.form.tramming');
  const tMeasurements = useTranslations('measurements');
  const tCommon = useTranslations('common.status');

  // Helper to display values with translations
  const display = (value: any) => displayValue(value, tCommon('yes'), tCommon('no'));

  return (
    <div className="text-xs space-y-4">
      <div className="border-t pt-2 space-y-4">
        {/* Slide Tram and Unit Fields */}
        <div className="border rounded-md overflow-hidden">
          <div className="p-2 space-y-1.5 text-[11px]">
            {data?.slideTram && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{tTramming('slideTram')}:</span>
                <span className="font-medium">{display(data.slideTram)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tTramming('unit')}:</span>
              <span className="font-medium">{data?.unit || 'inches'}</span>
            </div>
          </div>
        </div>

        {/* Render actual tramming forms in read-only mode */}
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
              <TrammingForm
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
              <TrammingForm
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
