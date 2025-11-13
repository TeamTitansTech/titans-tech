'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type CounterbalanceCylinderFormProps,
  CounterbalanceTypeEnum,
  AirbagPistonSealsType,
  RegulatorGaugeType,
  PneumaticsPlumbingType,
  RodSealsType,
  RodBushingType,
  OilWickType,
} from '@/data/types/services.types';

export function CounterbalanceCylinderForm({
  data,
  updateFn,
  errors,
  handleBlur,
  title,
}: CounterbalanceCylinderFormProps) {
  const t = useTranslations('inspections.form.counterbalanceCylinder');

  const getCounterbalanceTypeLabel = (type: CounterbalanceTypeEnum) => {
    return t(`counterbalanceTypes.${type.toLowerCase()}`);
  };

  const getAirbagPistonSealsLabel = (type: AirbagPistonSealsType) => {
    return t(`airbagPistonSealsType.${type.toLowerCase()}`);
  };

  const getRegulatorGaugeLabel = (type: RegulatorGaugeType) => {
    return t(`regulatorGaugeType.${type.toLowerCase()}`);
  };

  const getPneumaticsPlumbingLabel = (type: PneumaticsPlumbingType) => {
    return t(`pneumaticsPlumbingType.${type.toLowerCase()}`);
  };

  const getRodSealsLabel = (type: RodSealsType) => {
    return t(`rodSealsType.${type.toLowerCase()}`);
  };

  const getRodBushingLabel = (type: RodBushingType) => {
    return t(`rodBushingType.${type.toLowerCase()}`);
  };

  const getOilWickLabel = (type: OilWickType) => {
    return t(`oilWickType.${type.toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm">{title}</h4>

      <div>
        <Label htmlFor={`counterbalanceType-${title}`} className="text-xs">
          {t('counterbalanceType')}
        </Label>
        <Select
          value={data.counterbalanceType || ''}
          onValueChange={(value) => updateFn('counterbalanceType', value ? value : undefined)}
        >
          <SelectTrigger
            id={`counterbalanceType-${title}`}
            className={`mt-1 h-9 text-xs ${errors.counterbalanceType ? 'border-destructive' : ''}`}
            onBlur={() => handleBlur('counterbalanceType')}
          >
            <SelectValue placeholder={t('selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CounterbalanceTypeEnum).map((type) => (
              <SelectItem key={type} value={type}>
                {getCounterbalanceTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.counterbalanceType && (
          <p className="text-xs text-destructive mt-1">{errors.counterbalanceType}</p>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('airbagConditionTitle')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`airbagPistonSeals-${title}`} className="text-xs">
              {t('pistonSeals')}
            </Label>
            <Select
              value={data.airbagPistonSeals || ''}
              onValueChange={(value) => updateFn('airbagPistonSeals', value ? value : undefined)}
            >
              <SelectTrigger
                id={`airbagPistonSeals-${title}`}
                className={`mt-1 h-9 text-xs ${errors.airbagPistonSeals ? 'border-destructive' : ''}`}
                onBlur={() => handleBlur('airbagPistonSeals')}
              >
                <SelectValue placeholder={t('selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AirbagPistonSealsType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getAirbagPistonSealsLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.airbagPistonSeals && (
              <p className="text-xs text-destructive mt-1">{errors.airbagPistonSeals}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`airbagPistonSealsLeakLocation-${title}`} className="text-xs">
              {t('leakLocation')}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`regulator-${title}`} className="text-xs">
            {t('regulator')}
          </Label>
          <Select
            value={data.regulator || ''}
            onValueChange={(value) => updateFn('regulator', value ? value : undefined)}
          >
            <SelectTrigger
              id={`regulator-${title}`}
              className={`mt-1 h-9 text-xs ${errors.regulator ? 'border-destructive' : ''}`}
              onBlur={() => handleBlur('regulator')}
            >
              <SelectValue placeholder={t('selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RegulatorGaugeType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getRegulatorGaugeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.regulator && <p className="text-xs text-destructive mt-1">{errors.regulator}</p>}
        </div>

        <div>
          <Label htmlFor={`gauge-${title}`} className="text-xs">
            {t('gauge')}
          </Label>
          <Select
            value={data.gauge || ''}
            onValueChange={(value) => updateFn('gauge', value ? value : undefined)}
          >
            <SelectTrigger
              id={`gauge-${title}`}
              className={`mt-1 h-9 text-xs ${errors.gauge ? 'border-destructive' : ''}`}
              onBlur={() => handleBlur('gauge')}
            >
              <SelectValue placeholder={t('selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RegulatorGaugeType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getRegulatorGaugeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gauge && <p className="text-xs text-destructive mt-1">{errors.gauge}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor={`pneumaticsPlumbing-${title}`} className="text-xs">
          {t('pneumaticsPlumbing')}
        </Label>
        <Select
          value={data.pneumaticsPlumbing || ''}
          onValueChange={(value) => updateFn('pneumaticsPlumbing', value ? value : undefined)}
        >
          <SelectTrigger
            id={`pneumaticsPlumbing-${title}`}
            className={`mt-1 h-9 text-xs ${errors.pneumaticsPlumbing ? 'border-destructive' : ''}`}
            onBlur={() => handleBlur('pneumaticsPlumbing')}
          >
            <SelectValue placeholder={t('selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PneumaticsPlumbingType).map((type) => (
              <SelectItem key={type} value={type}>
                {getPneumaticsPlumbingLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.pneumaticsPlumbing && (
          <p className="text-xs text-destructive mt-1">{errors.pneumaticsPlumbing}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`rodSeals-${title}`} className="text-xs">
            {t('rodSeals')}
          </Label>
          <Select
            value={data.rodSeals || ''}
            onValueChange={(value) => updateFn('rodSeals', value ? value : undefined)}
          >
            <SelectTrigger
              id={`rodSeals-${title}`}
              className={`mt-1 h-9 text-xs ${errors.rodSeals ? 'border-destructive' : ''}`}
              onBlur={() => handleBlur('rodSeals')}
            >
              <SelectValue placeholder={t('selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RodSealsType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getRodSealsLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rodSeals && <p className="text-xs text-destructive mt-1">{errors.rodSeals}</p>}
        </div>

        <div>
          <Label htmlFor={`rodBushing-${title}`} className="text-xs">
            {t('rodBushing')}
          </Label>
          <Select
            value={data.rodBushing || ''}
            onValueChange={(value) => updateFn('rodBushing', value ? value : undefined)}
          >
            <SelectTrigger
              id={`rodBushing-${title}`}
              className={`mt-1 h-9 text-xs ${errors.rodBushing ? 'border-destructive' : ''}`}
              onBlur={() => handleBlur('rodBushing')}
            >
              <SelectValue placeholder={t('selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(RodBushingType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getRodBushingLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rodBushing && (
            <p className="text-xs text-destructive mt-1">{errors.rodBushing}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`oilWick-${title}`} className="text-xs">
            {t('oilWick')}
          </Label>
          <Select
            value={data.oilWick || ''}
            onValueChange={(value) => updateFn('oilWick', value ? value : undefined)}
          >
            <SelectTrigger
              id={`oilWick-${title}`}
              className={`mt-1 h-9 text-xs ${errors.oilWick ? 'border-destructive' : ''}`}
              onBlur={() => handleBlur('oilWick')}
            >
              <SelectValue placeholder={t('selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(OilWickType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getOilWickLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.oilWick && <p className="text-xs text-destructive mt-1">{errors.oilWick}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor={`notes-${title}`} className="text-xs">
          {t('notes')}
        </Label>
        <Textarea
          id={`notes-${title}`}
          value={data.notes || ''}
          onChange={(e) => updateFn('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          className={`mt-1 ${errors.notes ? 'border-destructive' : ''}`}
          rows={3}
        />
        {errors.notes && <p className="text-xs text-destructive mt-1">{errors.notes}</p>}
      </div>
    </div>
  );
}
