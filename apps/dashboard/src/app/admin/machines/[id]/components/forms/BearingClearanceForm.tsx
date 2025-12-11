'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LengthInput } from '@/components/ui/forms/LengthInput';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { Bell } from 'lucide-react';
import {
  type BearingClearanceData,
  type BearingClearanceFormProps,
} from '@/data/types/services.types';

// Fields that generate alerts when thresholds are configured
const ALERT_FIELDS = [
  'totalClearance',
  'mainBearings',
  'upperConnectionBearings',
  'wristPinToMatingPart',
  'wristPinToBushing',
  'slideAdjNutToScrewSleeve',
];

const MEASUREMENT_ROWS = [
  { key: 'totalClearance', rhField: 'totalClearance_RH', lhField: 'totalClearance_LH' },
  { key: 'mainBearings', rhField: 'mainBearings_RH', lhField: 'mainBearings_LH' },
  {
    key: 'upperConnectionBearings',
    rhField: 'upperConnectionBearings_RH',
    lhField: 'upperConnectionBearings_LH',
  },
  {
    key: 'wristPinToMatingPart',
    rhField: 'wristPinToMatingPart_RH',
    lhField: 'wristPinToMatingPart_LH',
  },
  { key: 'wristPinToBushing', rhField: 'wristPinToBushing_RH', lhField: 'wristPinToBushing_LH' },
  {
    key: 'slideAdjNutToScrewSleeve',
    rhField: 'slideAdjNutToScrewSleeve_RH',
    lhField: 'slideAdjNutToScrewSleeve_LH',
  },
  {
    key: 'extraDoubleLockOpen',
    rhField: 'extraDoubleLockOpen_RH',
    lhField: 'extraDoubleLockOpen_LH',
  },
  { key: 'ballBoxArea', rhField: 'ballBoxArea_RH', lhField: 'ballBoxArea_LH' },
] as const;

export function BearingClearanceForm({
  data,
  updateFn,
  errors,
  handleBlur,
  title,
}: BearingClearanceFormProps) {
  const t = useTranslations('inspections');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  const calculateDifferential = (rhField: string, lhField: string): string => {
    const rh = data[rhField as keyof BearingClearanceData];
    const lh = data[lhField as keyof BearingClearanceData];
    // If both are undefined, return empty
    if (rh === undefined && lh === undefined) return '';
    // Treat undefined as 0 for calculation
    const rhValue = rh !== undefined ? Number(rh) : 0;
    const lhValue = lh !== undefined ? Number(lh) : 0;
    // Values are stored in mm, calculate diff in mm then convert to display unit
    const diffInMm = Math.abs(rhValue - lhValue);
    const diffInDisplayUnit = convertLengthFromDefault(diffInMm);
    return diffInDisplayUnit.toFixed(4);
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm">{title}</h4>

      <div className="space-y-4">
        {/* Desktop/Tablet Headers - Hidden on mobile */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-4 border-b pb-2">
          <div className="text-xs font-semibold">{t('form.common.measurement')}</div>
          <div className="text-xs font-semibold text-center">{t('form.common.lh')}</div>
          <div className="text-xs font-semibold text-center">{t('form.common.rh')}</div>
          <div className="text-xs font-semibold text-center">Diff.</div>
        </div>

        {MEASUREMENT_ROWS.map(({ key, rhField, lhField }) => (
          <div key={key}>
            {/* Mobile Layout - Stacked vertically */}
            <div className="sm:hidden space-y-3 border rounded-lg p-3 bg-muted/30">
              <div className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
                {t(`form.bearingClearance.fields.${key}`)}
                {ALERT_FIELDS.includes(key) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Bell className="h-3 w-3 text-amber-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{t('form.common.generatesAlert')}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground block text-center">
                    LH
                  </label>
                  <LengthInput
                    id={`${lhField}-${title}-mobile`}
                    value={data[lhField as keyof BearingClearanceData]}
                    onChange={(val) => updateFn(lhField as keyof BearingClearanceData, val)}
                    onBlur={() => handleBlur(lhField as keyof BearingClearanceData)}
                    error={errors[lhField]}
                    inputClassName="text-xs h-9"
                    showLabel={false}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground block text-center">
                    RH
                  </label>
                  <LengthInput
                    id={`${rhField}-${title}-mobile`}
                    value={data[rhField as keyof BearingClearanceData]}
                    onChange={(val) => updateFn(rhField as keyof BearingClearanceData, val)}
                    onBlur={() => handleBlur(rhField as keyof BearingClearanceData)}
                    error={errors[rhField]}
                    inputClassName="text-xs h-9"
                    showLabel={false}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground block text-center">
                    Diff ({getLengthUnitLabel()})
                  </label>
                  <Input
                    value={calculateDifferential(rhField, lhField)}
                    readOnly
                    disabled
                    className="text-xs h-9 bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* Desktop/Tablet Layout - Grid */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-4 items-center">
              <div className="text-xs font-medium flex items-center gap-1">
                {t(`form.bearingClearance.fields.${key}`)}
                {ALERT_FIELDS.includes(key) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Bell className="h-3 w-3 text-amber-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{t('form.common.generatesAlert')}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <LengthInput
                id={`${lhField}-${title}`}
                value={data[lhField as keyof BearingClearanceData]}
                onChange={(val) => updateFn(lhField as keyof BearingClearanceData, val)}
                onBlur={() => handleBlur(lhField as keyof BearingClearanceData)}
                error={errors[lhField]}
                inputClassName="text-sm"
                showLabel={false}
              />

              <LengthInput
                id={`${rhField}-${title}`}
                value={data[rhField as keyof BearingClearanceData]}
                onChange={(val) => updateFn(rhField as keyof BearingClearanceData, val)}
                onBlur={() => handleBlur(rhField as keyof BearingClearanceData)}
                error={errors[rhField]}
                inputClassName="text-sm"
                showLabel={false}
              />

              <div className="relative">
                <Input
                  value={calculateDifferential(rhField, lhField)}
                  readOnly
                  disabled
                  className="text-sm bg-muted pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                  {getLengthUnitLabel()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
