'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, Bell } from 'lucide-react';
import { TemperatureInput } from '@/components/ui/forms/TemperatureInput';
import {
  type LubricationHydraulicsFormProps,
  LubeHydMonitorFlowPressSwGibType,
  YesNoDncType,
  type LubricationHydraulicsGauge,
} from '@/data/types/services.types';

// Preset options for PSI field (used for datalist suggestions)
// These are string values since PSI field accepts free text
// Note: value and label must match to avoid browsers showing both in dropdown
const PSI_PRESET_OPTIONS = [
  { value: 'OK', label: 'OK' },
  { value: 'N/A', label: 'N/A' },
  { value: 'DNC', label: 'DNC' },
  { value: 'Damaged', label: 'Damaged' },
];

export function LubricationHydraulicsForm({
  data,
  updateFn,
  errors,
  handleBlur,
}: LubricationHydraulicsFormProps) {
  const t = useTranslations('inspections');
  const tCommon = useTranslations('common.status');
  const tFormCommon = useTranslations('inspections.form.common');

  const addGauge = () => {
    const newGauge: LubricationHydraulicsGauge = {
      system: LubeHydMonitorFlowPressSwGibType.LUBE,
      gaugeSwitchIdentifier: '',
      psi: undefined,
    };
    updateFn('gauges', [...data.gauges, newGauge]);
  };

  const removeGauge = (index: number) => {
    const updatedGauges = data.gauges.filter((_, i) => i !== index);
    updateFn('gauges', updatedGauges);
  };

  const updateGauge = (
    index: number,
    field: keyof LubricationHydraulicsGauge,
    value: string | LubeHydMonitorFlowPressSwGibType | undefined,
  ) => {
    const updatedGauges = [...data.gauges];
    updatedGauges[index] = { ...updatedGauges[index], [field]: value };
    updateFn('gauges', updatedGauges);
  };

  const getSystemLabel = (system: LubeHydMonitorFlowPressSwGibType) => {
    return t(`form.lubricationHydraulics.systems.${system.toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-sm">
            {t('form.lubricationHydraulics.systemPressuresTitle')}
          </h4>
          <Button type="button" variant="outline" size="sm" onClick={addGauge}>
            <Plus className="h-4 w-4 mr-2" />
            {t('form.lubricationHydraulics.addRow')}
          </Button>
        </div>

        <div className="bg-muted/50 rounded-t-lg border border-b-0 p-3">
          <div className="grid grid-cols-10 gap-4 font-semibold text-xs">
            <div className="col-span-3">{t('form.lubricationHydraulics.systemLabel')}</div>
            <div className="col-span-3">{t('form.lubricationHydraulics.gaugeSwitchLabel')}</div>
            <div className="col-span-3">{t('form.lubricationHydraulics.psiLabel')}</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        <div className="border rounded-b-lg">
          {!data.gauges || data.gauges.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              {t('form.lubricationHydraulics.noSystemsAdded')}
            </div>
          ) : (
            data.gauges.map((gauge, index) => (
              <div
                key={index}
                className={`grid grid-cols-10 gap-4 p-3 items-center ${
                  index !== data.gauges.length - 1 ? 'border-b' : ''
                } ${index % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
              >
                <div className="col-span-3">
                  <Select
                    value={gauge.system}
                    onValueChange={(value) =>
                      updateGauge(index, 'system', value as LubeHydMonitorFlowPressSwGibType)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(LubeHydMonitorFlowPressSwGibType).map((system) => (
                        <SelectItem key={system} value={system}>
                          {getSystemLabel(system)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3">
                  <Input
                    type="text"
                    value={gauge.gaugeSwitchIdentifier || ''}
                    onChange={(e) => updateGauge(index, 'gaugeSwitchIdentifier', e.target.value)}
                    className="h-9 text-xs"
                    placeholder={t('form.lubricationHydraulics.gaugeSwitchPlaceholder')}
                  />
                </div>

                <div className="col-span-3">
                  <Select
                    value={gauge.psi || ''}
                    onValueChange={(value) => updateGauge(index, 'psi', value || undefined)}
                  >
                    <SelectTrigger
                      className="h-9 text-xs"
                      clearable
                      hasValue={!!gauge.psi}
                      onClear={() => updateGauge(index, 'psi', undefined)}
                    >
                      <SelectValue
                        placeholder={t('form.lubricationHydraulics.selectPlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {PSI_PRESET_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGauge(index)}
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">
          {t('form.lubricationHydraulics.oilInfoTitle')}
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="changedOil" className="text-xs flex items-center gap-1">
              {t('form.lubricationHydraulics.changedOil')}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Bell className="h-3 w-3 text-amber-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{tFormCommon('oilChangeGeneratesAlert')}</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select
              value={data.changedOil}
              onValueChange={(value) => updateFn('changedOil', value as YesNoDncType)}
            >
              <SelectTrigger
                className="mt-1"
                clearable
                hasValue={!!data.changedOil}
                onClear={() => updateFn('changedOil', undefined)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={YesNoDncType.YES}>{tCommon('yes')}</SelectItem>
                <SelectItem value={YesNoDncType.NO}>{tCommon('no')}</SelectItem>
                <SelectItem value={YesNoDncType.DNC}>{tCommon('dnc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TemperatureInput
            id="oilTemperature"
            label={t('form.lubricationHydraulics.oilTemperature')}
            value={data.oilTemperature ?? 0}
            onChange={(val) => updateFn('oilTemperature', val)}
            onBlur={() => handleBlur('oilTemperature')}
            error={errors.oilTemperature}
          />

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

      <div>
        <h4 className="font-semibold text-sm mb-4">
          {t('form.lubricationHydraulics.filterTitle')}
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="changedFilter" className="text-xs">
              {t('form.lubricationHydraulics.changedFilter')}
            </Label>
            <Select
              value={data.changedFilter}
              onValueChange={(value) => updateFn('changedFilter', value as YesNoDncType)}
            >
              <SelectTrigger
                className="mt-1"
                clearable
                hasValue={!!data.changedFilter}
                onClear={() => updateFn('changedFilter', undefined)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={YesNoDncType.YES}>{tCommon('yes')}</SelectItem>
                <SelectItem value={YesNoDncType.NO}>{tCommon('no')}</SelectItem>
                <SelectItem value={YesNoDncType.DNC}>{tCommon('dnc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-xs font-semibold">
          {t('form.lubricationHydraulics.notes')}
        </Label>
        <Input
          id="notes"
          value={data.notes || ''}
          onChange={(e) => updateFn('notes', e.target.value)}
          className="mt-2"
          placeholder={t('form.lubricationHydraulics.notesPlaceholder')}
        />
      </div>
    </div>
  );
}
