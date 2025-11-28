'use client';

import { useTranslations } from 'next-intl';
import { useUnitManager, type PressureUnit } from '@/contexts/UnitManagerContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PressureUnitSelectorProps {
  label?: string;
  className?: string;
}

export function PressureUnitSelector({ label, className }: PressureUnitSelectorProps) {
  const t = useTranslations('forms.units');
  const { pressureUnit, setPressureUnit } = useUnitManager();

  const handleUnitChange = (newUnit: PressureUnit) => {
    if (newUnit === pressureUnit) return;
    setPressureUnit(newUnit);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label !== undefined && (
        <Label className="text-xs font-medium">{label || t('pressure.label')}</Label>
      )}
      <Select
        value={pressureUnit}
        onValueChange={(value) => handleUnitChange(value as PressureUnit)}
      >
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="atm">{t('pressure.atm')}</SelectItem>
          <SelectItem value="bar">{t('pressure.bar')}</SelectItem>
          <SelectItem value="psi">{t('pressure.psi')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
