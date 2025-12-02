'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ThresholdRangeInput } from './ThresholdRangeInput';
import { useTranslations } from 'next-intl';

export interface TrammingThresholdsData {
  greenMin: number;
  yellowMin: number;
  redMin: number;
}

interface TrammingThresholdsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TrammingThresholdsData;
  onChange: (data: TrammingThresholdsData) => void;
}

export function TrammingThresholds({
  open,
  onOpenChange,
  data,
  onChange,
}: TrammingThresholdsProps) {
  const t = useTranslations('alerts.tramming');

  const updateField = (field: keyof TrammingThresholdsData, value: number) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <div className="border rounded-lg p-4 bg-card hover:bg-muted transition-colors flex items-center justify-between">
          <h3 className="text-base font-semibold">{t('title')}</h3>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${open ? 'transform rotate-180' : ''}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg p-6 bg-card space-y-6">
          <p className="text-sm text-muted-foreground mb-4">{t('description')}</p>
          <ThresholdRangeInput
            label={t('sum')}
            greenMin={data.greenMin}
            yellowMin={data.yellowMin}
            redMin={data.redMin}
            onGreenMinChange={(v) => updateField('greenMin', v)}
            onYellowMinChange={(v) => updateField('yellowMin', v)}
            onRedMinChange={(v) => updateField('redMin', v)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
