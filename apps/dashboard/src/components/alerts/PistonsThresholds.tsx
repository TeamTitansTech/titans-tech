'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ThresholdRangeInput } from './ThresholdRangeInput';
import { useTranslations } from 'next-intl';

export interface PistonsThresholdsData {
  difference_greenMin: number;
  difference_yellowMin: number;
  difference_redMin: number;
}

interface PistonsThresholdsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PistonsThresholdsData;
  onChange: (data: PistonsThresholdsData) => void;
}

export function PistonsThresholds({ open, onOpenChange, data, onChange }: PistonsThresholdsProps) {
  const t = useTranslations('alerts.pistons');

  const updateField = (field: keyof PistonsThresholdsData, value: number) => {
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
        <div className="border border-t-0 rounded-b-lg p-3 bg-card sm:p-6">
          <ThresholdRangeInput
            label={t('difference')}
            greenMin={data.difference_greenMin}
            yellowMin={data.difference_yellowMin}
            redMin={data.difference_redMin}
            onGreenMinChange={(v) => updateField('difference_greenMin', v)}
            onYellowMinChange={(v) => updateField('difference_yellowMin', v)}
            onRedMinChange={(v) => updateField('difference_redMin', v)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
