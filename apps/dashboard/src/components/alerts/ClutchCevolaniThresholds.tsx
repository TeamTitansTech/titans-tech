'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ThresholdRangeInput } from './ThresholdRangeInput';
import { useTranslations } from 'next-intl';

export interface ClutchCevolaniThresholdsData {
  pneumaticClutchClearanceTotal_greenMin: number;
  pneumaticClutchClearanceTotal_yellowMin: number;
  pneumaticClutchClearanceTotal_redMin: number;
}

interface ClutchCevolaniThresholdsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ClutchCevolaniThresholdsData;
  onChange: (data: ClutchCevolaniThresholdsData) => void;
}

export function ClutchCevolaniThresholds({
  open,
  onOpenChange,
  data,
  onChange,
}: ClutchCevolaniThresholdsProps) {
  const t = useTranslations('alerts.clutchCevolani');

  const updateField = (field: keyof ClutchCevolaniThresholdsData, value: number) => {
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
        <div className="border border-t-0 rounded-b-lg p-3 bg-card space-y-4 sm:p-6 sm:space-y-6">
          <ThresholdRangeInput
            label={t('pneumaticClutchClearanceTotal')}
            greenMin={data.pneumaticClutchClearanceTotal_greenMin}
            yellowMin={data.pneumaticClutchClearanceTotal_yellowMin}
            redMin={data.pneumaticClutchClearanceTotal_redMin}
            onGreenMinChange={(v) => updateField('pneumaticClutchClearanceTotal_greenMin', v)}
            onYellowMinChange={(v) => updateField('pneumaticClutchClearanceTotal_yellowMin', v)}
            onRedMinChange={(v) => updateField('pneumaticClutchClearanceTotal_redMin', v)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
