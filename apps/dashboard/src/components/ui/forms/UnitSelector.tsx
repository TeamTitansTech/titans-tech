'use client';

import { useTranslations } from 'next-intl';
import { useUnitManager, type LengthUnit } from '@/contexts/UnitManagerContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface UnitSelectorProps {
  label?: string;
  className?: string;
}

export function UnitSelector({ label, className }: UnitSelectorProps) {
  const t = useTranslations('forms.units');
  const { lengthUnit, setLengthUnit } = useUnitManager();

  const handleUnitChange = (newUnit: LengthUnit) => {
    if (newUnit === lengthUnit) return;
    setLengthUnit(newUnit);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label !== undefined && (
        <Label className="text-xs font-medium">{label || t('length.label')}</Label>
      )}
      <Select value={lengthUnit} onValueChange={(value) => handleUnitChange(value as LengthUnit)}>
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mm">{t('length.mm')}</SelectItem>
          <SelectItem value="inches">{t('length.inches')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
