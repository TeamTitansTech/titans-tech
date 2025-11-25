'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ThresholdRangeInput } from './ThresholdRangeInput';
import { useTranslations } from 'next-intl';

export interface ClutchThresholdsData {
  gearBacklash_greenMin: number;
  gearBacklash_yellowMin: number;
  gearBacklash_redMin: number;
  crankEndplay_greenMin: number;
  crankEndplay_yellowMin: number;
  crankEndplay_redMin: number;
  brakeClearance_greenMin: number;
  brakeClearance_yellowMin: number;
  brakeClearance_redMin: number;
  hydClutchClearance_greenMin: number;
  hydClutchClearance_yellowMin: number;
  hydClutchClearance_redMin: number;
}

interface ClutchThresholdsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ClutchThresholdsData;
  onChange: (data: ClutchThresholdsData) => void;
}

export function ClutchThresholds({ open, onOpenChange, data, onChange }: ClutchThresholdsProps) {
  const t = useTranslations('alerts.clutch');

  const updateField = (field: keyof ClutchThresholdsData, value: number) => {
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
            label={t('gearBacklash')}
            greenMin={data.gearBacklash_greenMin}
            yellowMin={data.gearBacklash_yellowMin}
            redMin={data.gearBacklash_redMin}
            onGreenMinChange={(v) => updateField('gearBacklash_greenMin', v)}
            onYellowMinChange={(v) => updateField('gearBacklash_yellowMin', v)}
            onRedMinChange={(v) => updateField('gearBacklash_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('crankEndplay')}
            greenMin={data.crankEndplay_greenMin}
            yellowMin={data.crankEndplay_yellowMin}
            redMin={data.crankEndplay_redMin}
            onGreenMinChange={(v) => updateField('crankEndplay_greenMin', v)}
            onYellowMinChange={(v) => updateField('crankEndplay_yellowMin', v)}
            onRedMinChange={(v) => updateField('crankEndplay_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('brakeClearance')}
            greenMin={data.brakeClearance_greenMin}
            yellowMin={data.brakeClearance_yellowMin}
            redMin={data.brakeClearance_redMin}
            onGreenMinChange={(v) => updateField('brakeClearance_greenMin', v)}
            onYellowMinChange={(v) => updateField('brakeClearance_yellowMin', v)}
            onRedMinChange={(v) => updateField('brakeClearance_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('hydClutchClearance')}
            greenMin={data.hydClutchClearance_greenMin}
            yellowMin={data.hydClutchClearance_yellowMin}
            redMin={data.hydClutchClearance_redMin}
            onGreenMinChange={(v) => updateField('hydClutchClearance_greenMin', v)}
            onYellowMinChange={(v) => updateField('hydClutchClearance_yellowMin', v)}
            onRedMinChange={(v) => updateField('hydClutchClearance_redMin', v)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
