'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  type BearingClearanceData,
  type BearingClearanceFormProps,
} from '@/data/types/services.types';

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

  const calculateDifferential = (rhField: string, lhField: string): string => {
    const rh = Number(data[rhField as keyof BearingClearanceData]) || 0;
    const lh = Number(data[lhField as keyof BearingClearanceData]) || 0;
    const diff = Math.abs(rh - lh);
    return diff.toFixed(4);
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm">{title}</h4>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 border-b pb-2">
          <div className="text-xs font-semibold">Measurement</div>
          <div className="text-xs font-semibold text-center">LH</div>
          <div className="text-xs font-semibold text-center">RH</div>
          <div className="text-xs font-semibold text-center">Differential</div>
        </div>

        {MEASUREMENT_ROWS.map(({ key, rhField, lhField }) => (
          <div key={key} className="grid grid-cols-4 gap-4 items-center">
            <div className="text-xs font-medium">{t(`form.bearingClearance.fields.${key}`)}</div>

            <div>
              <Input
                id={`${lhField}-${title}`}
                type="number"
                step="0.0001"
                min="0"
                max="999999.9999"
                value={Number(data[lhField as keyof BearingClearanceData])}
                onChange={(e) =>
                  updateFn(lhField as keyof BearingClearanceData, Number(e.target.value))
                }
                onBlur={() => handleBlur(lhField as keyof BearingClearanceData)}
                className={`text-sm ${errors[lhField] ? 'border-destructive' : ''}`}
                required
              />
              {errors[lhField] && (
                <p className="text-xs text-destructive mt-1">{errors[lhField]}</p>
              )}
            </div>

            <div>
              <Input
                id={`${rhField}-${title}`}
                type="number"
                step="0.0001"
                min="0"
                max="999999.9999"
                value={Number(data[rhField as keyof BearingClearanceData])}
                onChange={(e) =>
                  updateFn(rhField as keyof BearingClearanceData, Number(e.target.value))
                }
                onBlur={() => handleBlur(rhField as keyof BearingClearanceData)}
                className={`text-sm ${errors[rhField] ? 'border-destructive' : ''}`}
                required
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
        ))}
      </div>
    </div>
  );
}
