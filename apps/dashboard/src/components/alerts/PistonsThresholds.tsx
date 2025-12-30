'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { ThresholdRangeInput } from './ThresholdRangeInput';
import { ThresholdCentralInput } from './ThresholdCentralInput';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ThresholdMode = 'LINEAR' | 'CENTRAL';

export interface PistonsThresholdsData {
  thresholdMode: ThresholdMode;
  // LINEAR mode fields
  difference_greenMin: number;
  difference_yellowMin: number;
  difference_redMin: number;
  // CENTRAL mode fields (U-shaped with explicit boundaries)
  central_yellowMin?: number | null;
  central_greenMin?: number | null;
  central_greenMax?: number | null;
  central_yellowMax?: number | null;
}

interface PistonsThresholdsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PistonsThresholdsData;
  onChange: (data: PistonsThresholdsData) => void;
}

export function PistonsThresholds({ open, onOpenChange, data, onChange }: PistonsThresholdsProps) {
  const t = useTranslations('alerts.pistons');
  const tCommon = useTranslations('alerts.thresholds');

  const updateField = (field: keyof PistonsThresholdsData, value: number | string | null) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleModeChange = (mode: ThresholdMode) => {
    if (mode === 'CENTRAL') {
      // Always ensure central mode has valid values
      onChange({
        ...data,
        thresholdMode: mode,
        central_yellowMin: data.central_yellowMin ?? 0.002,
        central_greenMin: data.central_greenMin ?? 0.004,
        central_greenMax: data.central_greenMax ?? 0.008,
        central_yellowMax: data.central_yellowMax ?? 0.01,
      });
    } else {
      onChange({
        ...data,
        thresholdMode: mode,
      });
    }
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
          {/* Mode Selector */}
          <div className="space-y-2">
            <Label>{tCommon('mode.label')}</Label>
            <Select
              value={data.thresholdMode || 'LINEAR'}
              onValueChange={(value) => handleModeChange(value as ThresholdMode)}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LINEAR">{tCommon('mode.linear')}</SelectItem>
                <SelectItem value="CENTRAL">{tCommon('mode.central')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {data.thresholdMode === 'CENTRAL'
                ? tCommon('mode.centralDescription')
                : tCommon('mode.linearDescription')}
            </p>
          </div>

          {/* LINEAR mode inputs */}
          {data.thresholdMode !== 'CENTRAL' && (
            <ThresholdRangeInput
              label={t('difference')}
              greenMin={data.difference_greenMin}
              yellowMin={data.difference_yellowMin}
              redMin={data.difference_redMin}
              onGreenMinChange={(v) => updateField('difference_greenMin', v)}
              onYellowMinChange={(v) => updateField('difference_yellowMin', v)}
              onRedMinChange={(v) => updateField('difference_redMin', v)}
            />
          )}

          {/* CENTRAL mode inputs */}
          {data.thresholdMode === 'CENTRAL' && (
            <ThresholdCentralInput
              label={t('difference')}
              yellowMin={data.central_yellowMin ?? 0.002}
              greenMin={data.central_greenMin ?? 0.004}
              greenMax={data.central_greenMax ?? 0.008}
              yellowMax={data.central_yellowMax ?? 0.01}
              onYellowMinChange={(v) => updateField('central_yellowMin', v)}
              onGreenMinChange={(v) => updateField('central_greenMin', v)}
              onGreenMaxChange={(v) => updateField('central_greenMax', v)}
              onYellowMaxChange={(v) => updateField('central_yellowMax', v)}
            />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
