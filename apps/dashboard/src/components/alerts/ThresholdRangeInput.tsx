'use client';

import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { LengthInput } from '@/components/ui/forms/LengthInput';

interface ThresholdRangeInputProps {
  label: string;
  greenMin: number;
  yellowMin: number;
  redMin: number;
  onGreenMinChange: (value: number) => void;
  onYellowMinChange: (value: number) => void;
  onRedMinChange: (value: number) => void;
}

export function ThresholdRangeInput({
  label,
  greenMin,
  yellowMin,
  redMin,
  onGreenMinChange,
  onYellowMinChange,
  onRedMinChange,
}: ThresholdRangeInputProps) {
  const t = useTranslations('alerts.thresholds');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  // Convert for display in the visual bar only
  const displayYellowMin = convertLengthFromDefault(yellowMin);
  const displayRedMin = convertLengthFromDefault(redMin);
  const unitLabel = getLengthUnitLabel();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      <div className="h-10 w-full rounded-md overflow-hidden border border-border">
        <div className="flex h-full">
          <div className="bg-green-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            &lt; {displayYellowMin.toFixed(4)} {unitLabel}
          </div>

          <div className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            {displayYellowMin.toFixed(4)} - &lt; {displayRedMin.toFixed(4)} {unitLabel}
          </div>

          <div className="bg-red-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            ≥ {displayRedMin.toFixed(4)} {unitLabel}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            {t('greenStartMin')}
          </Label>
          <LengthInput
            id="green-min"
            value={greenMin}
            onChange={(val) => val !== undefined && onGreenMinChange(val)}
            showLabel={false}
            inputClassName="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded-full" />
            {t('yellowStartMin')}
          </Label>
          <LengthInput
            id="yellow-min"
            value={yellowMin}
            onChange={(val) => val !== undefined && onYellowMinChange(val)}
            showLabel={false}
            inputClassName="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            {t('redStartMin')}
          </Label>
          <LengthInput
            id="red-min"
            value={redMin}
            onChange={(val) => val !== undefined && onRedMinChange(val)}
            showLabel={false}
            inputClassName="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
