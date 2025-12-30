'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ThresholdRangeInput } from './ThresholdRangeInput';
import { useTranslations } from 'next-intl';

export interface BearingClearanceThresholdsData {
  totalClearance_greenMin: number;
  totalClearance_yellowMin: number;
  totalClearance_redMin: number;
  mainBearings_greenMin: number;
  mainBearings_yellowMin: number;
  mainBearings_redMin: number;
  upperConnectionBearings_greenMin: number;
  upperConnectionBearings_yellowMin: number;
  upperConnectionBearings_redMin: number;
  wristPinToMatingPart_greenMin: number;
  wristPinToMatingPart_yellowMin: number;
  wristPinToMatingPart_redMin: number;
  wristPinToBushing_greenMin: number;
  wristPinToBushing_yellowMin: number;
  wristPinToBushing_redMin: number;
  slideAdjNutToScrewSleeve_greenMin: number;
  slideAdjNutToScrewSleeve_yellowMin: number;
  slideAdjNutToScrewSleeve_redMin: number;
}

interface BearingClearanceThresholdsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: BearingClearanceThresholdsData;
  onChange: (data: BearingClearanceThresholdsData) => void;
  title?: string;
}

export function BearingClearanceThresholds({
  open,
  onOpenChange,
  data,
  onChange,
  title,
}: BearingClearanceThresholdsProps) {
  const t = useTranslations('alerts.bearingClearance');

  const updateField = (field: keyof BearingClearanceThresholdsData, value: number) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <div className="border rounded-lg p-4 bg-card hover:bg-muted transition-colors flex items-center justify-between">
          <h3 className="text-base font-semibold">{title || t('title')}</h3>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${open ? 'transform rotate-180' : ''}`}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-t-0 rounded-b-lg p-3 bg-card space-y-4 sm:p-6 sm:space-y-6">
          <ThresholdRangeInput
            label={t('totalClearance')}
            greenMin={data.totalClearance_greenMin}
            yellowMin={data.totalClearance_yellowMin}
            redMin={data.totalClearance_redMin}
            onGreenMinChange={(v) => updateField('totalClearance_greenMin', v)}
            onYellowMinChange={(v) => updateField('totalClearance_yellowMin', v)}
            onRedMinChange={(v) => updateField('totalClearance_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('mainBearings')}
            greenMin={data.mainBearings_greenMin}
            yellowMin={data.mainBearings_yellowMin}
            redMin={data.mainBearings_redMin}
            onGreenMinChange={(v) => updateField('mainBearings_greenMin', v)}
            onYellowMinChange={(v) => updateField('mainBearings_yellowMin', v)}
            onRedMinChange={(v) => updateField('mainBearings_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('upperConnectionBearings')}
            greenMin={data.upperConnectionBearings_greenMin}
            yellowMin={data.upperConnectionBearings_yellowMin}
            redMin={data.upperConnectionBearings_redMin}
            onGreenMinChange={(v) => updateField('upperConnectionBearings_greenMin', v)}
            onYellowMinChange={(v) => updateField('upperConnectionBearings_yellowMin', v)}
            onRedMinChange={(v) => updateField('upperConnectionBearings_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('wristPinToMatingPart')}
            greenMin={data.wristPinToMatingPart_greenMin}
            yellowMin={data.wristPinToMatingPart_yellowMin}
            redMin={data.wristPinToMatingPart_redMin}
            onGreenMinChange={(v) => updateField('wristPinToMatingPart_greenMin', v)}
            onYellowMinChange={(v) => updateField('wristPinToMatingPart_yellowMin', v)}
            onRedMinChange={(v) => updateField('wristPinToMatingPart_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('wristPinToBushing')}
            greenMin={data.wristPinToBushing_greenMin}
            yellowMin={data.wristPinToBushing_yellowMin}
            redMin={data.wristPinToBushing_redMin}
            onGreenMinChange={(v) => updateField('wristPinToBushing_greenMin', v)}
            onYellowMinChange={(v) => updateField('wristPinToBushing_yellowMin', v)}
            onRedMinChange={(v) => updateField('wristPinToBushing_redMin', v)}
          />

          <ThresholdRangeInput
            label={t('slideAdjNutToScrewSleeve')}
            greenMin={data.slideAdjNutToScrewSleeve_greenMin}
            yellowMin={data.slideAdjNutToScrewSleeve_yellowMin}
            redMin={data.slideAdjNutToScrewSleeve_redMin}
            onGreenMinChange={(v) => updateField('slideAdjNutToScrewSleeve_greenMin', v)}
            onYellowMinChange={(v) => updateField('slideAdjNutToScrewSleeve_yellowMin', v)}
            onRedMinChange={(v) => updateField('slideAdjNutToScrewSleeve_redMin', v)}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
