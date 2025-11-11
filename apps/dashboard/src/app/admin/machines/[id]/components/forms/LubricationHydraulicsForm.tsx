'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { type LubricationHydraulicsFormProps } from '@/data/types/services.types';

export function LubricationHydraulicsForm({
  data,
  updateFn,
  errors,
  handleBlur,
}: LubricationHydraulicsFormProps) {
  const t = useTranslations('inspections');

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-sm mb-4">
          {t('form.lubricationHydraulics.systemPressuresTitle')}
        </h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="lubePSI" className="text-xs">
              {t('form.lubricationHydraulics.lubePSI')}
            </Label>
            <Input
              id="lubePSI"
              type="number"
              step="0.01"
              min="0"
              max="99999.99"
              value={data.lubePSI || ''}
              onChange={(e) =>
                updateFn('lubePSI', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('lubePSI')}
              className={`mt-1 ${errors.lubePSI ? 'border-destructive' : ''}`}
            />
            {errors.lubePSI && <p className="text-xs text-destructive mt-1">{errors.lubePSI}</p>}
          </div>

          <div>
            <Label htmlFor="monitorflowPSI" className="text-xs">
              {t('form.lubricationHydraulics.monitorflowPSI')}
            </Label>
            <Input
              id="monitorflowPSI"
              type="number"
              step="0.01"
              min="0"
              max="99999.99"
              value={data.monitorflowPSI || ''}
              onChange={(e) =>
                updateFn('monitorflowPSI', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('monitorflowPSI')}
              className={`mt-1 ${errors.monitorflowPSI ? 'border-destructive' : ''}`}
            />
            {errors.monitorflowPSI && (
              <p className="text-xs text-destructive mt-1">{errors.monitorflowPSI}</p>
            )}
          </div>

          <div>
            <Label htmlFor="hydPSI" className="text-xs">
              {t('form.lubricationHydraulics.hydPSI')}
            </Label>
            <Input
              id="hydPSI"
              type="number"
              step="0.01"
              min="0"
              max="99999.99"
              value={data.hydPSI || ''}
              onChange={(e) =>
                updateFn('hydPSI', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('hydPSI')}
              className={`mt-1 ${errors.hydPSI ? 'border-destructive' : ''}`}
            />
            {errors.hydPSI && <p className="text-xs text-destructive mt-1">{errors.hydPSI}</p>}
          </div>

          <div>
            <Label htmlFor="pressSWPSI" className="text-xs">
              {t('form.lubricationHydraulics.pressSWPSI')}
            </Label>
            <Input
              id="pressSWPSI"
              type="number"
              step="0.01"
              min="0"
              max="99999.99"
              value={data.pressSWPSI || ''}
              onChange={(e) =>
                updateFn('pressSWPSI', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('pressSWPSI')}
              className={`mt-1 ${errors.pressSWPSI ? 'border-destructive' : ''}`}
            />
            {errors.pressSWPSI && (
              <p className="text-xs text-destructive mt-1">{errors.pressSWPSI}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="otherGauges" className="text-xs">
          {t('form.lubricationHydraulics.otherGauges')}
        </Label>
        <Input
          id="otherGauges"
          value={data.otherGauges || ''}
          onChange={(e) => updateFn('otherGauges', e.target.value)}
          onBlur={() => handleBlur('otherGauges')}
          className={`mt-1 ${errors.otherGauges ? 'border-destructive' : ''}`}
        />
        {errors.otherGauges && (
          <p className="text-xs text-destructive mt-1">{errors.otherGauges}</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">
          {t('form.lubricationHydraulics.oilInfoTitle')}
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              id="changedOil"
              checked={data.changedOil}
              onCheckedChange={(checked: boolean) => updateFn('changedOil', checked)}
            />
            <Label htmlFor="changedOil" className="cursor-pointer text-xs">
              {t('form.lubricationHydraulics.changedOil')}
            </Label>
          </div>

          <div>
            <Label htmlFor="oilTemperatureF" className="text-xs">
              {t('form.lubricationHydraulics.oilTemperatureF')}
            </Label>
            <Input
              id="oilTemperatureF"
              type="number"
              step="0.01"
              value={data.oilTemperatureF || ''}
              onChange={(e) =>
                updateFn('oilTemperatureF', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('oilTemperatureF')}
              className={`mt-1 ${errors.oilTemperatureF ? 'border-destructive' : ''}`}
            />
            {errors.oilTemperatureF && (
              <p className="text-xs text-destructive mt-1">{errors.oilTemperatureF}</p>
            )}
          </div>

          <div>
            <Label htmlFor="oilMfgType" className="text-xs">
              {t('form.lubricationHydraulics.oilMfgType')}
            </Label>
            <Input
              id="oilMfgType"
              value={data.oilMfgType || ''}
              onChange={(e) => updateFn('oilMfgType', e.target.value)}
              onBlur={() => handleBlur('oilMfgType')}
              className={`mt-1 ${errors.oilMfgType ? 'border-destructive' : ''}`}
            />
            {errors.oilMfgType && (
              <p className="text-xs text-destructive mt-1">{errors.oilMfgType}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="changedFilter"
          checked={data.changedFilter}
          onCheckedChange={(checked: boolean) => updateFn('changedFilter', checked)}
        />
        <Label htmlFor="changedFilter" className="cursor-pointer text-xs">
          {t('form.lubricationHydraulics.changedFilter')}
        </Label>
      </div>
    </div>
  );
}
