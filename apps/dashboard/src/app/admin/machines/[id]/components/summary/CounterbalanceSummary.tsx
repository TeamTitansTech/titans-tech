'use client';

import { useTranslations } from 'next-intl';
import type { CounterbalanceCylinderCheck } from '@/data/types/services.types';
import { translateEnumValue } from './utils/translateEnum';

interface CounterbalanceSummaryProps {
  data: CounterbalanceCylinderCheck;
}

export function CounterbalanceSummary({ data }: CounterbalanceSummaryProps) {
  const tTable = useTranslations('table');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tCounterbalanceFields = useTranslations('inspections.form.counterbalanceCylinder');
  const tCommon = useTranslations('common.status');

  // Guard against undefined data
  if (!data) {
    return (
      <div className="text-xs space-y-3">
        <div className="border-t pt-2">
          <div className="text-muted-foreground text-center py-4 text-xs">
            {tServicesSummary('noDataAvailable')}
          </div>
        </div>
      </div>
    );
  }

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
  const displayValue = (value: unknown): string => {
    return translateEnumValue(value, tCommon);
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
          {!!data?.outerData && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('outer')}
              </div>
              <div className="p-2 space-y-1.5 text-[11px]">
                {counterbalanceFields.map((key) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{translateFieldName(key)}:</span>
                    <span className="font-medium">
                      {displayValue((data.outerData as Record<string, unknown>)[key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!!data?.innerData && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold text-center border-b">
                {tTable('inner')}
              </div>
              <div className="p-2 space-y-1.5 text-[11px]">
                {counterbalanceFields.map((key) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{translateFieldName(key)}:</span>
                    <span className="font-medium">
                      {displayValue((data.innerData as Record<string, unknown>)[key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes (if exists) */}
        {!!data?.notes && (
          <div className="mt-3 border-t pt-2">
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
