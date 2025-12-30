'use client';

import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { LengthInput } from '@/components/ui/forms/LengthInput';

interface ThresholdCentralInputProps {
  label: string;
  yellowMin: number; // Below this = red (too low)
  greenMin: number; // Below this (but >= yellowMin) = yellow low
  greenMax: number; // Above greenMin, <= this = green (ideal)
  yellowMax: number; // Above greenMax, <= this = yellow high, above = red
  onYellowMinChange: (value: number) => void;
  onGreenMinChange: (value: number) => void;
  onGreenMaxChange: (value: number) => void;
  onYellowMaxChange: (value: number) => void;
}

export function ThresholdCentralInput({
  label,
  yellowMin,
  greenMin,
  greenMax,
  yellowMax,
  onYellowMinChange,
  onGreenMinChange,
  onGreenMaxChange,
  onYellowMaxChange,
}: ThresholdCentralInputProps) {
  const t = useTranslations('alerts.thresholds');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  // Convert for display
  const displayYellowMin = convertLengthFromDefault(yellowMin);
  const displayGreenMin = convertLengthFromDefault(greenMin);
  const displayGreenMax = convertLengthFromDefault(greenMax);
  const displayYellowMax = convertLengthFromDefault(yellowMax);
  const unitLabel = getLengthUnitLabel();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      {/* U-shaped color indicator bar */}
      <div className="h-8 w-full rounded-md overflow-hidden border border-border sm:h-10">
        <div className="flex h-full">
          {/* Red (too low) */}
          <div className="bg-red-500 flex items-center justify-center text-white text-[10px] font-medium w-[15%] px-1 sm:text-xs">
            <span className="hidden sm:inline">&lt; {displayYellowMin.toFixed(3)}</span>
            <span className="sm:hidden">🔴</span>
          </div>

          {/* Yellow (low warning) */}
          <div className="bg-yellow-500 flex items-center justify-center text-white text-[10px] font-medium w-[17.5%] px-1 sm:text-xs">
            <span className="hidden sm:inline">
              {displayYellowMin.toFixed(3)} - {displayGreenMin.toFixed(3)}
            </span>
            <span className="sm:hidden">🟡</span>
          </div>

          {/* Green (ideal) */}
          <div className="bg-green-500 flex items-center justify-center text-white text-[10px] font-medium w-[35%] px-1 sm:text-xs">
            <span className="hidden sm:inline">
              {displayGreenMin.toFixed(3)} - {displayGreenMax.toFixed(3)} {unitLabel}
            </span>
            <span className="sm:hidden">
              {displayGreenMin.toFixed(2)} - {displayGreenMax.toFixed(2)}
            </span>
          </div>

          {/* Yellow (high warning) */}
          <div className="bg-yellow-500 flex items-center justify-center text-white text-[10px] font-medium w-[17.5%] px-1 sm:text-xs">
            <span className="hidden sm:inline">
              {displayGreenMax.toFixed(3)} - {displayYellowMax.toFixed(3)}
            </span>
            <span className="sm:hidden">🟡</span>
          </div>

          {/* Red (too high) */}
          <div className="bg-red-500 flex items-center justify-center text-white text-[10px] font-medium w-[15%] px-1 sm:text-xs">
            <span className="hidden sm:inline">&gt; {displayYellowMax.toFixed(3)}</span>
            <span className="sm:hidden">🔴</span>
          </div>
        </div>
      </div>

      {/* Input fields - 4 columns */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground flex items-center gap-1 sm:text-xs">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 sm:w-3 sm:h-3" />
            <span className="truncate">{t('central.yellowMin')}</span>
          </Label>
          <LengthInput
            id="yellow-min"
            value={yellowMin}
            onChange={(val) => val !== undefined && onYellowMinChange(val)}
            showLabel={false}
            inputClassName="text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground flex items-center gap-1 sm:text-xs">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0 sm:w-3 sm:h-3" />
            <span className="truncate">{t('central.greenMin')}</span>
          </Label>
          <LengthInput
            id="green-min"
            value={greenMin}
            onChange={(val) => val !== undefined && onGreenMinChange(val)}
            showLabel={false}
            inputClassName="text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground flex items-center gap-1 sm:text-xs">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full shrink-0 sm:w-3 sm:h-3" />
            <span className="truncate">{t('central.greenMax')}</span>
          </Label>
          <LengthInput
            id="green-max"
            value={greenMax}
            onChange={(val) => val !== undefined && onGreenMaxChange(val)}
            showLabel={false}
            inputClassName="text-xs sm:text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground flex items-center gap-1 sm:text-xs">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 sm:w-3 sm:h-3" />
            <span className="truncate">{t('central.yellowMax')}</span>
          </Label>
          <LengthInput
            id="yellow-max"
            value={yellowMax}
            onChange={(val) => val !== undefined && onYellowMaxChange(val)}
            showLabel={false}
            inputClassName="text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Help text showing ranges */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md space-y-1">
        <p>
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1 align-middle" />
          {t('central.redRange')}: 0 - {displayYellowMin.toFixed(4)} {t('central.or')} &gt;{' '}
          {displayYellowMax.toFixed(4)} {unitLabel}
        </p>
        <p>
          <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1 align-middle" />
          {t('central.yellowRange')}: {displayYellowMin.toFixed(4)} - {displayGreenMin.toFixed(4)}{' '}
          {t('central.or')} {displayGreenMax.toFixed(4)} - {displayYellowMax.toFixed(4)} {unitLabel}
        </p>
        <p>
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1 align-middle" />
          {t('central.greenRange')}: {displayGreenMin.toFixed(4)} - {displayGreenMax.toFixed(4)}{' '}
          {unitLabel}
        </p>
      </div>
    </div>
  );
}
