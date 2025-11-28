'use client';

import { useTranslations } from 'next-intl';
import { useUnitManager, type TemperatureUnit } from '@/contexts/UnitManagerContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TemperatureUnitSelectorProps {
  label?: string;
  className?: string;
}

export function TemperatureUnitSelector({ label, className }: TemperatureUnitSelectorProps) {
  const t = useTranslations('forms.units');
  const { temperatureUnit, setTemperatureUnit } = useUnitManager();

  const handleUnitChange = (newUnit: TemperatureUnit) => {
    if (newUnit === temperatureUnit) return;
    setTemperatureUnit(newUnit);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label !== undefined && (
        <Label className="text-xs font-medium">{label || t('temperature.label')}</Label>
      )}
      <Select
        value={temperatureUnit}
        onValueChange={(value) => handleUnitChange(value as TemperatureUnit)}
      >
        <SelectTrigger className="w-16 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="C">{t('temperature.celsius')}</SelectItem>
          <SelectItem value="F">{t('temperature.fahrenheit')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
