'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrammingForm } from '../forms/TrammingForm';

interface TrammingSummaryProps {
  data: any;
}

export function TrammingSummary({ data }: TrammingSummaryProps) {
  const tServicesSummary = useTranslations('services.modal.summary');

  // Helper function to display value or "-" for empty
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  return (
    <div className="text-xs space-y-4">
      <div className="border-t pt-2 space-y-4">
        {/* Slide Tram and Unit Fields */}
        <div className="border rounded-md overflow-hidden">
          <div className="p-2 space-y-1.5 text-[11px]">
            {data?.slideTram && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slide Tram:</span>
                <span className="font-medium">{displayValue(data.slideTram)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit:</span>
              <span className="font-medium">{data?.unit || 'inches'}</span>
            </div>
          </div>
        </div>

        {/* Render actual tramming forms in read-only mode */}
        <Tabs defaultValue="outer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="outer">Outer Measurements</TabsTrigger>
            <TabsTrigger value="inner">Inner Measurements</TabsTrigger>
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
                <span className="font-medium">{displayValue(data.notes)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
