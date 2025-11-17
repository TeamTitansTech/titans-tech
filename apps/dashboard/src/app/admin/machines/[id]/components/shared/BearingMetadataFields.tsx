'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MatingPartType } from '@/data/types/services.types';

interface BearingMetadataFieldsProps {
  combinedWithValue: string;
  onCombinedWithChange: (value: string) => void;
  matingPartValue: MatingPartType | undefined;
  onMatingPartChange: (value: MatingPartType) => void;
  prefix: string; // e.g., 'outer', 'inner'
}

export function BearingMetadataFields({
  combinedWithValue,
  onCombinedWithChange,
  matingPartValue,
  onMatingPartChange,
  prefix,
}: BearingMetadataFieldsProps) {
  const t = useTranslations('inspections');

  return (
    <div className="grid grid-cols-2 gap-6 items-end">
      {/* Combined With */}
      <div>
        <Label htmlFor={`${prefix}CombinedWith`} className="text-xs font-semibold mb-2 block">
          {t('form.bearingClearanceSection.combinedWith')}
        </Label>
        <Input
          id={`${prefix}CombinedWith`}
          type="text"
          value={combinedWithValue}
          onChange={(e) => onCombinedWithChange(e.target.value)}
          placeholder={t('form.common.referenceMeasurement')}
          className="text-sm"
        />
      </div>

      {/* Mating Part Type */}
      <div>
        <Label htmlFor={`${prefix}MatingPart`} className="text-xs font-semibold mb-2 block">
          {t('form.bearingClearanceSection.matingPartType')}
        </Label>
        <Select
          value={matingPartValue}
          onValueChange={(val) => onMatingPartChange(val as MatingPartType)}
        >
          <SelectTrigger id={`${prefix}MatingPart`} className="text-sm">
            <SelectValue placeholder={t('form.common.selectMatingPart')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MatingPartType.BUSHING}>
              {t('form.enums.matingPartType.bushing')}
            </SelectItem>
            <SelectItem value={MatingPartType.CONNECTION}>
              {t('form.enums.matingPartType.connection')}
            </SelectItem>
            <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
              {t('form.enums.matingPartType.nutScrewSleeve')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
