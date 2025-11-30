'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ThresholdRangeInput } from './ThresholdRangeInput';
import { useTranslations } from 'next-intl';

export interface ClutchThresholdsData {
  hydClutchClearanceTotal_greenMin: number;
  hydClutchClearanceTotal_yellowMin: number;
  hydClutchClearanceTotal_redMin: number;
  hydClutchClearanceRear_greenMin: number;
  hydClutchClearanceRear_yellowMin: number;
  hydClutchClearanceRear_redMin: number;
  fb_greenMin: number;
  fb_yellowMin: number;
  fb_redMin: number;
  fTB_greenMin: number;
  fTB_yellowMin: number;
  fTB_redMin: number;
  rTB_greenMin: number;
  rTB_yellowMin: number;
  rTB_redMin: number;
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
            label={t('hydClutchClearanceTotal')}
            greenMin={data.hydClutchClearanceTotal_greenMin}
            yellowMin={data.hydClutchClearanceTotal_yellowMin}
            redMin={data.hydClutchClearanceTotal_redMin}
            onGreenMinChange={(v) => updateField('hydClutchClearanceTotal_greenMin', v)}
            onYellowMinChange={(v) => updateField('hydClutchClearanceTotal_yellowMin', v)}
            onRedMinChange={(v) => updateField('hydClutchClearanceTotal_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('hydClutchClearanceRear')}
            greenMin={data.hydClutchClearanceRear_greenMin}
            yellowMin={data.hydClutchClearanceRear_yellowMin}
            redMin={data.hydClutchClearanceRear_redMin}
            onGreenMinChange={(v) => updateField('hydClutchClearanceRear_greenMin', v)}
            onYellowMinChange={(v) => updateField('hydClutchClearanceRear_yellowMin', v)}
            onRedMinChange={(v) => updateField('hydClutchClearanceRear_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('fb')}
            greenMin={data.fb_greenMin}
            yellowMin={data.fb_yellowMin}
            redMin={data.fb_redMin}
            onGreenMinChange={(v) => updateField('fb_greenMin', v)}
            onYellowMinChange={(v) => updateField('fb_yellowMin', v)}
            onRedMinChange={(v) => updateField('fb_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('fTB')}
            greenMin={data.fTB_greenMin}
            yellowMin={data.fTB_yellowMin}
            redMin={data.fTB_redMin}
            onGreenMinChange={(v) => updateField('fTB_greenMin', v)}
            onYellowMinChange={(v) => updateField('fTB_yellowMin', v)}
            onRedMinChange={(v) => updateField('fTB_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('rTB')}
            greenMin={data.rTB_greenMin}
            yellowMin={data.rTB_yellowMin}
            redMin={data.rTB_redMin}
            onGreenMinChange={(v) => updateField('rTB_greenMin', v)}
            onYellowMinChange={(v) => updateField('rTB_yellowMin', v)}
            onRedMinChange={(v) => updateField('rTB_redMin', v)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
