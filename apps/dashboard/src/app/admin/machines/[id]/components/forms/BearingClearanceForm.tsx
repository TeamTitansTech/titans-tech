'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MatingPartType,
  type BearingClearanceData,
  type BearingClearanceFormProps,
} from '@/data/types/services.types';

const BEARING_FIELDS = [
  'totalClearance_RH',
  'totalClearance_LH',
  'mainBearings_RH',
  'mainBearings_LH',
  'upperConnectionBearings_RH',
  'upperConnectionBearings_LH',
  'wristPinToMatingPart_RH',
  'wristPinToMatingPart_LH',
  'wristPinToBushing_RH',
  'wristPinToBushing_LH',
  'slideAdjNutToScrewSleeve_RH',
  'slideAdjNutToScrewSleeve_LH',
  'extraDoubleLockOpen_RH',
  'extraDoubleLockOpen_LH',
  'ballBoxArea_RH',
  'ballBoxArea_LH',
] as const;

export function BearingClearanceForm({
  data,
  updateFn,
  errors,
  handleBlur,
  title,
}: BearingClearanceFormProps) {
  const t = useTranslations('inspections');

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-sm">{title}</h4>
      <div className="grid grid-cols-2 gap-4">
        {BEARING_FIELDS.map((field) => (
          <div key={field}>
            <Label htmlFor={field} className="text-xs">
              {t(`form.bearingClearance.fields.${field}`)}
            </Label>
            <Input
              id={field}
              type="number"
              step="0.0001"
              min="0"
              max="999999.9999"
              value={Number(data[field as keyof BearingClearanceData])}
              onChange={(e) =>
                updateFn(field as keyof BearingClearanceData, Number(e.target.value))
              }
              onBlur={() => handleBlur(field as keyof BearingClearanceData)}
              className={`mt-1 ${errors[field] ? 'border-destructive' : ''}`}
              required
            />
            {errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`hasBeenAdjusted-${title}`}
            checked={data.hasBeenAdjusted}
            onCheckedChange={(checked: boolean) => updateFn('hasBeenAdjusted', checked)}
          />
          <Label htmlFor={`hasBeenAdjusted-${title}`} className="cursor-pointer text-xs">
            Has Been Adjusted
          </Label>
        </div>

        <div>
          <Label htmlFor={`combinedWith-${title}`} className="text-xs">
            {t('form.bearingClearance.combined_with.label')}
          </Label>
          <Input
            id={`combinedWith-${title}`}
            value={data.combinedWith || ''}
            onChange={(e) => updateFn('combinedWith', e.target.value)}
            onBlur={() => handleBlur('combinedWith')}
            placeholder={t('form.bearingClearance.combined_with.placeholder')}
            className={`mt-1 ${errors.combinedWith ? 'border-destructive' : ''}`}
          />
          {errors.combinedWith && (
            <p className="text-xs text-destructive mt-1">{errors.combinedWith}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`matingPart-${title}`} className="text-xs">
            {t('form.bearingClearance.mating_part.label')}
          </Label>
          <Select
            value={data.matingPart || MatingPartType.BUSHING}
            onValueChange={(value) => updateFn('matingPart', value as MatingPartType)}
          >
            <SelectTrigger className="mt-1" id={`matingPart-${title}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={MatingPartType.BUSHING}>
                {t('form.bearingClearance.mating_part.bushing')}
              </SelectItem>
              <SelectItem value={MatingPartType.CONNECTION}>
                {t('form.bearingClearance.mating_part.connection')}
              </SelectItem>
              <SelectItem value={MatingPartType.NUT_SCREW_SLEEVE}>
                {t('form.bearingClearance.mating_part.nut_screw_sleeve')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
