'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { useNumericInput } from '@/hooks/useNumericInput';

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

  // Use numeric input hook for each threshold
  // Wrap the onChange callbacks to ensure number (never undefined) since thresholds are required
  const [greenValue, handleGreenChange, handleGreenBlur] = useNumericInput(
    greenMin,
    (val) => val !== undefined && onGreenMinChange(val),
    { maxDecimals: 4, allowNegative: true, required: true },
  );

  const [yellowValue, handleYellowChange, handleYellowBlur] = useNumericInput(
    yellowMin,
    (val) => val !== undefined && onYellowMinChange(val),
    { maxDecimals: 4, allowNegative: true, min: greenMin, required: true },
  );

  const [redValue, handleRedChange, handleRedBlur] = useNumericInput(
    redMin,
    (val) => val !== undefined && onRedMinChange(val),
    { maxDecimals: 4, allowNegative: true, min: yellowMin, required: true },
  );

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      <div className="h-10 w-full rounded-md overflow-hidden border border-border">
        <div className="flex h-full">
          <div className="bg-green-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            {greenMin.toFixed(4)} - {(yellowMin - 0.0001).toFixed(4)}
          </div>

          <div className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            {yellowMin.toFixed(4)} - {(redMin - 0.0001).toFixed(4)}
          </div>

          <div className="bg-red-500 flex items-center justify-center text-white text-xs font-medium w-1/3">
            ≥ {redMin.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            {t('greenStartMin')}
          </Label>
          <Input
            type="number"
            step="0.0001"
            value={greenValue}
            onChange={handleGreenChange}
            onBlur={handleGreenBlur}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded-full" />
            {t('yellowStartMin')}
          </Label>
          <Input
            type="number"
            step="0.0001"
            min={greenMin}
            value={yellowValue}
            onChange={handleYellowChange}
            onBlur={handleYellowBlur}
            className="text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            {t('redStartMin')}
          </Label>
          <Input
            type="number"
            step="0.0001"
            min={yellowMin}
            value={redValue}
            onChange={handleRedChange}
            onBlur={handleRedBlur}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
