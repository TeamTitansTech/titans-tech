'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { useNumericInput } from '@/hooks/useNumericInput';
import {
  type BearingClearanceData,
  type BearingClearanceFormProps,
} from '@/data/types/services.types';

// Fields that have alerts (required)
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

interface BearingNumericInputProps {
  id: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onBlur: () => void;
  error?: string;
  className?: string;
  required?: boolean;
}

function BearingNumericInput({
  id,
  value,
  onChange,
  onBlur,
  error,
  className = '',
  required = false,
}: BearingNumericInputProps) {
  const [displayValue, handleChange, handleBlur] = useNumericInput(value, onChange, {
    maxDecimals: 4,
    min: 0,
    max: 999999.9999,
    required,
  });

  return (
    <Input
      id={id}
      type="number"
      step="0.0001"
      min="0"
      max="999999.9999"
      value={displayValue}
      onChange={handleChange}
      onBlur={() => {
        handleBlur();
        onBlur();
      }}
      className={`${className} ${error ? 'border-destructive' : ''}`}
    />
  );
}

export function BearingClearanceForm({
  data,
  updateFn,
  errors,
  handleBlur,
  title,
}: BearingClearanceFormProps) {
  const t = useTranslations('inspections');

  const calculateDifferential = (rhField: string, lhField: string): string => {
    const rh = data[rhField as keyof BearingClearanceData];
    const lh = data[lhField as keyof BearingClearanceData];
    if (rh === undefined || lh === undefined) return '';
    const diff = Math.abs(Number(rh) - Number(lh));
    return diff.toFixed(4);
  };

  const isFieldRequired = (key: string): boolean => {
    return ALERT_FIELDS.includes(key);
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

        {MEASUREMENT_ROWS.map(({ key, rhField, lhField }) => {
          const required = isFieldRequired(key);

          return (
            <div key={key}>
              {/* Mobile Layout - Stacked vertically */}
              <div className="sm:hidden space-y-3 border rounded-lg p-3 bg-muted/30">
                <div className="text-xs font-semibold text-foreground/80">
                  {t(`form.bearingClearance.fields.${key}`)}
                  {required && <span className="text-destructive ml-1">*</span>}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground block text-center">
                      LH
                    </label>
                    <BearingNumericInput
                      id={`${lhField}-${title}-mobile`}
                      value={data[lhField as keyof BearingClearanceData] as number | undefined}
                      onChange={(val) => updateFn(lhField as keyof BearingClearanceData, val)}
                      onBlur={() => handleBlur(lhField as keyof BearingClearanceData)}
                      error={errors[lhField]}
                      className="text-xs h-9"
                      required={required}
                    />
                    {errors[lhField] && (
                      <p className="text-[10px] text-destructive mt-0.5">{errors[lhField]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground block text-center">
                      RH
                    </label>
                    <BearingNumericInput
                      id={`${rhField}-${title}-mobile`}
                      value={data[rhField as keyof BearingClearanceData] as number | undefined}
                      onChange={(val) => updateFn(rhField as keyof BearingClearanceData, val)}
                      onBlur={() => handleBlur(rhField as keyof BearingClearanceData)}
                      error={errors[rhField]}
                      className="text-xs h-9"
                      required={required}
                    />
                    {errors[rhField] && (
                      <p className="text-[10px] text-destructive mt-0.5">{errors[rhField]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground block text-center">
                      Diff
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
                <div className="text-xs font-medium">
                  {t(`form.bearingClearance.fields.${key}`)}
                  {required && <span className="text-destructive ml-1">*</span>}
                </div>

                <div>
                  <BearingNumericInput
                    id={`${lhField}-${title}`}
                    value={data[lhField as keyof BearingClearanceData] as number | undefined}
                    onChange={(val) => updateFn(lhField as keyof BearingClearanceData, val)}
                    onBlur={() => handleBlur(lhField as keyof BearingClearanceData)}
                    error={errors[lhField]}
                    className="text-sm"
                    required={required}
                  />
                  {errors[lhField] && (
                    <p className="text-xs text-destructive mt-1">{errors[lhField]}</p>
                  )}
                </div>

                <div>
                  <BearingNumericInput
                    id={`${rhField}-${title}`}
                    value={data[rhField as keyof BearingClearanceData] as number | undefined}
                    onChange={(val) => updateFn(rhField as keyof BearingClearanceData, val)}
                    onBlur={() => handleBlur(rhField as keyof BearingClearanceData)}
                    error={errors[rhField]}
                    className="text-sm"
                    required={required}
                  />
                  {errors[rhField] && (
                    <p className="text-xs text-destructive mt-1">{errors[rhField]}</p>
                  )}
                </div>

                <div>
                  <Input
                    value={calculateDifferential(rhField, lhField)}
                    readOnly
                    disabled
                    className="text-sm bg-muted"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
