'use client';

import { useTranslations } from 'next-intl';

interface CounterbalanceSummaryProps {
  data: any;
}

export function CounterbalanceSummary({ data }: CounterbalanceSummaryProps) {
  const tTable = useTranslations('table');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tCounterbalanceFields = useTranslations('inspections.form.counterbalanceCylinder');

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

  // Helper function to translate field names
  const translateFieldName = (key: string): string => {
    const translation = tCounterbalanceFields(key);
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
    return String(value);
  };

  return (
    <div className="text-xs space-y-3">
      <div className="border-t pt-2">
        <div className="grid grid-cols-2 gap-3">
          {data?.outerData && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('outer')}
              </div>
              <div className="p-2 space-y-1.5 text-[11px]">
                {Object.entries(data.outerData)
                  .filter(([key]) => !isIdField(key) && key !== 'notes')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{translateFieldName(key)}:</span>
                      <span className="font-medium">{displayValue(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {data?.innerData && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('inner')}
              </div>
              <div className="p-2 space-y-1.5 text-[11px]">
                {Object.entries(data.innerData)
                  .filter(([key]) => !isIdField(key) && key !== 'notes')
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{translateFieldName(key)}:</span>
                      <span className="font-medium">{displayValue(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes (if exists) */}
        {(data?.outerData?.notes || data?.innerData?.notes) && (
          <div className="mt-3 border-t pt-2">
            <div className="font-semibold text-muted-foreground mb-2 text-xs">
              {tServicesSummary('notes')}
            </div>
            <div className="border rounded-md overflow-hidden">
              <div className="p-2 text-[11px]">
                <span className="font-medium">
                  {displayValue(data?.outerData?.notes || data?.innerData?.notes)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
