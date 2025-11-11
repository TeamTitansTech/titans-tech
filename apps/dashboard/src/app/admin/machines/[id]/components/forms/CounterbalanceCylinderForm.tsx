'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type CounterbalanceCylinderFormProps } from '@/data/types/services.types';

export function CounterbalanceCylinderForm({
  data,
  updateFn,
  errors,
  handleBlur,
  title,
}: CounterbalanceCylinderFormProps) {
  const t = useTranslations('inspections');

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm">{title}</h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`counterbalanceType-${title}`} className="text-xs">
            {t('form.counterbalanceCylinder.counterbalanceType')}
          </Label>
          <Input
            id={`counterbalanceType-${title}`}
            value={data.counterbalanceType || ''}
            onChange={(e) => updateFn('counterbalanceType', e.target.value)}
            onBlur={() => handleBlur('counterbalanceType')}
            className={`mt-1 ${errors.counterbalanceType ? 'border-destructive' : ''}`}
          />
          {errors.counterbalanceType && (
            <p className="text-xs text-destructive mt-1">{errors.counterbalanceType}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`gaugePSI-${title}`} className="text-xs">
            {t('form.counterbalanceCylinder.gaugePSI')}
          </Label>
          <Input
            id={`gaugePSI-${title}`}
            type="number"
            step="0.01"
            min="0"
            max="99999.99"
            value={data.gaugePSI || ''}
            onChange={(e) =>
              updateFn('gaugePSI', e.target.value ? Number(e.target.value) : undefined)
            }
            onBlur={() => handleBlur('gaugePSI')}
            className={`mt-1 ${errors.gaugePSI ? 'border-destructive' : ''}`}
          />
          {errors.gaugePSI && <p className="text-xs text-destructive mt-1">{errors.gaugePSI}</p>}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">
          {t('form.counterbalanceCylinder.airbagConditionTitle')}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`airbagPistonSeals-${title}`} className="text-xs">
              {t('form.counterbalanceCylinder.airbagPistonSeals')}
            </Label>
            <Input
              id={`airbagPistonSeals-${title}`}
              value={data.airbagPistonSeals || ''}
              onChange={(e) => updateFn('airbagPistonSeals', e.target.value)}
              onBlur={() => handleBlur('airbagPistonSeals')}
              className={`mt-1 ${errors.airbagPistonSeals ? 'border-destructive' : ''}`}
            />
            {errors.airbagPistonSeals && (
              <p className="text-xs text-destructive mt-1">{errors.airbagPistonSeals}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`airbagPistonSealsLeakLocation-${title}`} className="text-xs">
              {t('form.counterbalanceCylinder.leakLocation')}
            </Label>
            <Input
              id={`airbagPistonSealsLeakLocation-${title}`}
              value={data.airbagPistonSealsLeakLocation || ''}
              onChange={(e) => updateFn('airbagPistonSealsLeakLocation', e.target.value)}
              onBlur={() => handleBlur('airbagPistonSealsLeakLocation')}
              className={`mt-1 ${errors.airbagPistonSealsLeakLocation ? 'border-destructive' : ''}`}
            />
            {errors.airbagPistonSealsLeakLocation && (
              <p className="text-xs text-destructive mt-1">
                {errors.airbagPistonSealsLeakLocation}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`regulator-${title}`} className="text-xs">
            {t('form.counterbalanceCylinder.regulator')}
          </Label>
          <Input
            id={`regulator-${title}`}
            value={data.regulator || ''}
            onChange={(e) => updateFn('regulator', e.target.value)}
            onBlur={() => handleBlur('regulator')}
            className={`mt-1 ${errors.regulator ? 'border-destructive' : ''}`}
          />
          {errors.regulator && <p className="text-xs text-destructive mt-1">{errors.regulator}</p>}
        </div>

        <div>
          <Label htmlFor={`pneumaticsPlumbing-${title}`} className="text-xs">
            {t('form.counterbalanceCylinder.pneumaticsPlumbing')}
          </Label>
          <Input
            id={`pneumaticsPlumbing-${title}`}
            value={data.pneumaticsPlumbing || ''}
            onChange={(e) => updateFn('pneumaticsPlumbing', e.target.value)}
            onBlur={() => handleBlur('pneumaticsPlumbing')}
            className={`mt-1 ${errors.pneumaticsPlumbing ? 'border-destructive' : ''}`}
          />
          {errors.pneumaticsPlumbing && (
            <p className="text-xs text-destructive mt-1">{errors.pneumaticsPlumbing}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`rodSeals-${title}`} className="text-xs">
            {t('form.counterbalanceCylinder.rodSeals')}
          </Label>
          <Input
            id={`rodSeals-${title}`}
            value={data.rodSeals || ''}
            onChange={(e) => updateFn('rodSeals', e.target.value)}
            onBlur={() => handleBlur('rodSeals')}
            className={`mt-1 ${errors.rodSeals ? 'border-destructive' : ''}`}
          />
          {errors.rodSeals && <p className="text-xs text-destructive mt-1">{errors.rodSeals}</p>}
        </div>

        <div>
          <Label htmlFor={`rodBushing-${title}`} className="text-xs">
            {t('form.counterbalanceCylinder.rodBushing')}
          </Label>
          <Input
            id={`rodBushing-${title}`}
            value={data.rodBushing || ''}
            onChange={(e) => updateFn('rodBushing', e.target.value)}
            onBlur={() => handleBlur('rodBushing')}
            className={`mt-1 ${errors.rodBushing ? 'border-destructive' : ''}`}
          />
          {errors.rodBushing && (
            <p className="text-xs text-destructive mt-1">{errors.rodBushing}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`oilWick-${title}`} className="text-xs">
            {t('form.counterbalanceCylinder.oilWick')}
          </Label>
          <Input
            id={`oilWick-${title}`}
            value={data.oilWick || ''}
            onChange={(e) => updateFn('oilWick', e.target.value)}
            onBlur={() => handleBlur('oilWick')}
            className={`mt-1 ${errors.oilWick ? 'border-destructive' : ''}`}
          />
          {errors.oilWick && <p className="text-xs text-destructive mt-1">{errors.oilWick}</p>}
        </div>
      </div>
    </div>
  );
}
