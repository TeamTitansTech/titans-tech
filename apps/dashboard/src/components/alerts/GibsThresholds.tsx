'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ThresholdRangeInput } from './ThresholdRangeInput';
import { useTranslations } from 'next-intl';

export interface GibsThresholdsData {
  usable_greenMin: number;
  usable_yellowMin: number;
  usable_redMin: number;
}

interface GibsThresholdsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: GibsThresholdsData;
  onChange: (data: GibsThresholdsData) => void;
}

export function GibsThresholds({ open, onOpenChange, data, onChange }: GibsThresholdsProps) {
  const t = useTranslations('alerts.gibs');

  const updateField = (field: keyof GibsThresholdsData, value: number) => {
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
          <ThresholdRangeInput
            label={t('usable')}
            greenMin={data.usable_greenMin}
            yellowMin={data.usable_yellowMin}
            redMin={data.usable_redMin}
            onGreenMinChange={(v) => updateField('usable_greenMin', v)}
            onYellowMinChange={(v) => updateField('usable_yellowMin', v)}
            onRedMinChange={(v) => updateField('usable_redMin', v)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
