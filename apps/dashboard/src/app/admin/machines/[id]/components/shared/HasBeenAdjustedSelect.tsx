'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { YesNoNaDncType } from '@/data/types/services.types';

interface HasBeenAdjustedSelectProps {
  value: YesNoNaDncType | undefined;
  onValueChange: (value: YesNoNaDncType) => void;
  id: string;
  label?: string;
  required?: boolean;
}

export function HasBeenAdjustedSelect({
  value,
  onValueChange,
  id,
  label,
  required = true,
}: HasBeenAdjustedSelectProps) {
  const t = useTranslations('inspections');

  return (
    <div className="mb-6">
      <Label htmlFor={id} className="text-xs font-semibold mb-2 block">
        {label || t('form.bearingClearanceSection.hasBeenAdjusted')}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={(val) => onValueChange(val as YesNoNaDncType)}>
        <SelectTrigger id={id} className="text-sm w-full max-w-xs">
          <SelectValue placeholder={t('form.common.selectOption')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="YES">{t('form.enums.yesNoNaDnc.yes')}</SelectItem>
          <SelectItem value="NO">{t('form.enums.yesNoNaDnc.no')}</SelectItem>
          <SelectItem value="NA">{t('form.enums.yesNoNaDnc.na')}</SelectItem>
          <SelectItem value="DNC">{t('form.enums.yesNoNaDnc.dnc')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
