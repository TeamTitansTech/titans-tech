'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ThresholdRangeInput } from './ThresholdRangeInput';
import { useTranslations } from 'next-intl';

export interface SlideThresholdsData {
  maxDeviation_greenMin: number;
  maxDeviation_yellowMin: number;
  maxDeviation_redMin: number;
}

interface SlideThresholdsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SlideThresholdsData;
  onChange: (data: SlideThresholdsData) => void;
}

export function SlideThresholds({ open, onOpenChange, data, onChange }: SlideThresholdsProps) {
  const t = useTranslations('alerts.slide');

  const updateField = (field: keyof SlideThresholdsData, value: number) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <div className="border rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between">
          <h3 className="text-base font-semibold">{t('title')}</h3>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${open ? 'transform rotate-180' : ''}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg p-6 bg-white space-y-6">
          <ThresholdRangeInput
            label={t('maxDeviation')}
            greenMin={data.maxDeviation_greenMin}
            yellowMin={data.maxDeviation_yellowMin}
            redMin={data.maxDeviation_redMin}
            onGreenMinChange={(v) => updateField('maxDeviation_greenMin', v)}
            onYellowMinChange={(v) => updateField('maxDeviation_yellowMin', v)}
            onRedMinChange={(v) => updateField('maxDeviation_redMin', v)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
