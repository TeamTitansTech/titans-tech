'use client';

import { useTranslations } from 'next-intl';

interface CounterbalanceSummaryProps {
  data: any;
}

export function CounterbalanceSummary({ data }: CounterbalanceSummaryProps) {
  const tTable = useTranslations('table');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tCounterbalanceFields = useTranslations('inspections.form.counterbalanceCylinder');
  const tCommon = useTranslations('common.status');

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

  // Helper function to display value with translations
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? tCommon('yes') : tCommon('no');
    }
    // Translate enum values
    const stringValue = String(value);
    if (stringValue === 'YES') return tCommon('yes');
    if (stringValue === 'NO') return tCommon('no');
    if (stringValue === 'DNC') return tCommon('dnc');
    if (stringValue === 'NA') return tCommon('na');
    if (stringValue === 'OK') return tCommon('ok');
    if (stringValue === 'DAMAGED') return tCommon('damaged');
    if (stringValue === 'LEAKING') return tCommon('leaking');
    if (stringValue === 'NOT_OPERATIONAL') return tCommon('not_operational');

    return stringValue;
  };

  // Define all fields that should be shown for counterbalance data
  const counterbalanceFields = [
    'counterbalanceType',
    'airbagPistonSeals',
    'airbagPistonSealsLeakLocation',
    'regulator',
    'gauge',
    'pneumaticsPlumbing',
    'rodSeals',
    'rodBushing',
    'oilWick',
  ];

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
                {counterbalanceFields.map((key) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{translateFieldName(key)}:</span>
                    <span className="font-medium">{displayValue(data.outerData[key])}</span>
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
                {counterbalanceFields.map((key) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{translateFieldName(key)}:</span>
                    <span className="font-medium">{displayValue(data.innerData[key])}</span>
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
