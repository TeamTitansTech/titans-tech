'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { CounterbalanceCylinderCheck, CounterbalanceAlert } from '@/data/types/services.types';
import { translateEnumValue } from './utils/translateEnum';
import { getCounterbalanceAlertsForService } from '@/data/services/services.api';
import { SectionAttachments } from './SectionAttachments';

interface CounterbalanceSummaryProps {
  data: CounterbalanceCylinderCheck;
  serviceId?: string;
}

export function CounterbalanceSummary({ data, serviceId }: CounterbalanceSummaryProps) {
  const tTable = useTranslations('table');
  const tServicesSummary = useTranslations('services.modal.summary');
  const tCounterbalanceFields = useTranslations('inspections.form.counterbalanceCylinder');
  const tCommon = useTranslations('common.status');
  const tAlerts = useTranslations('inspections.form.counterbalanceCylinder.alerts');

  // Alerts state
  const [alerts, setAlerts] = useState<CounterbalanceAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  // Fetch alerts when serviceId is available
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!serviceId) return;

      setIsLoadingAlerts(true);
      try {
        const response = await getCounterbalanceAlertsForService(serviceId);
        if (response.data) {
          setAlerts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch counterbalance alerts:', error);
      } finally {
        setIsLoadingAlerts(false);
      }
    };

    fetchAlerts();
  }, [serviceId]);

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

        {/* Custom Alerts Section */}
        {serviceId && (
          <div className="mt-3 border-t pt-2">
            <div className="font-semibold text-muted-foreground mb-2 text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              {tAlerts('title')} ({alerts.length})
            </div>
            {isLoadingAlerts ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border border-red-200 bg-red-50 rounded-md p-2 text-[11px]"
                  >
                    <div className="font-semibold text-red-700">
                      {tAlerts(`fieldLabels.${alert.fieldName}`)}
                    </div>
                    <div className="text-red-600 mt-1">{alert.justification}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground text-center py-2">
                {tAlerts('noAlerts')}
              </div>
            )}
          </div>
        )}
      </div>

      <SectionAttachments attachments={data.attachments} />
    </div>
  );
}
