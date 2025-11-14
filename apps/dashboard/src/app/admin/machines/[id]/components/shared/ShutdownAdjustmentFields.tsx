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
import {
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
} from '@/data/types/services.types';

interface ShutdownAdjustmentFieldsProps {
  slideMotorMounts: ConditionOkNaDncBrokenWornType | undefined;
  onSlideMotorMountsChange: (value: ConditionOkNaDncBrokenWornType) => void;
  powerCordHoses: ConditionOkNaDncDamagedType | undefined;
  onPowerCordHosesChange: (value: ConditionOkNaDncDamagedType) => void;
  chainsGearsSprockets: ConditionOkNaDncBrokenLooseType | undefined;
  onChainsGearsSprocketsChange: (value: ConditionOkNaDncBrokenLooseType) => void;
  lockingClamps: ConditionOkNaDncDamagedType | undefined;
  onLockingClampsChange: (value: ConditionOkNaDncDamagedType) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

export function ShutdownAdjustmentFields({
  slideMotorMounts,
  onSlideMotorMountsChange,
  powerCordHoses,
  onPowerCordHosesChange,
  chainsGearsSprockets,
  onChainsGearsSprocketsChange,
  lockingClamps,
  onLockingClampsChange,
  notes,
  onNotesChange,
}: ShutdownAdjustmentFieldsProps) {
  const t = useTranslations('inspections');

  return (
    <div className="space-y-6 pt-6 border-t">
      <div className="space-y-4">
        <h5 className="text-sm font-semibold">
          {t('form.bearingClearanceSection.shutdownAdjustmentMechanism')}
        </h5>

        <div className="grid grid-cols-2 gap-6">
          {/* Slide Motor/Mounts */}
          <div>
            <Label htmlFor="slideMotorMounts" className="text-xs font-medium mb-2 block">
              {t('form.bearingClearanceSection.slideMotorMounts')}
            </Label>
            <Select
              value={slideMotorMounts}
              onValueChange={(val) =>
                onSlideMotorMountsChange(val as ConditionOkNaDncBrokenWornType)
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={t('form.common.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConditionOkNaDncBrokenWornType.OK}>
                  {t('form.enums.conditionOkNaDncBrokenWorn.ok')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncBrokenWornType.NA}>
                  {t('form.enums.conditionOkNaDncBrokenWorn.na')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncBrokenWornType.DNC}>
                  {t('form.enums.conditionOkNaDncBrokenWorn.dnc')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncBrokenWornType.BROKEN}>
                  {t('form.enums.conditionOkNaDncBrokenWorn.broken')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncBrokenWornType.WORN}>
                  {t('form.enums.conditionOkNaDncBrokenWorn.worn')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Power Cord/Hoses */}
          <div>
            <Label htmlFor="powerCordHoses" className="text-xs font-medium mb-2 block">
              {t('form.bearingClearanceSection.powerCordHoses')}
            </Label>
            <Select
              value={powerCordHoses}
              onValueChange={(val) => onPowerCordHosesChange(val as ConditionOkNaDncDamagedType)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={t('form.common.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConditionOkNaDncDamagedType.OK}>
                  {t('form.enums.conditionOkNaDncDamaged.ok')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncDamagedType.NA}>
                  {t('form.enums.conditionOkNaDncDamaged.na')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncDamagedType.DNC}>
                  {t('form.enums.conditionOkNaDncDamaged.dnc')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncDamagedType.DAMAGED}>
                  {t('form.enums.conditionOkNaDncDamaged.damaged')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chains & Gears/Sprockets */}
          <div>
            <Label htmlFor="chainsGearsSprockets" className="text-xs font-medium mb-2 block">
              {t('form.bearingClearanceSection.chainsGearsSprockets')}
            </Label>
            <Select
              value={chainsGearsSprockets}
              onValueChange={(val) =>
                onChainsGearsSprocketsChange(val as ConditionOkNaDncBrokenLooseType)
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={t('form.common.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConditionOkNaDncBrokenLooseType.OK}>
                  {t('form.enums.conditionOkNaDncBrokenLoose.ok')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncBrokenLooseType.NA}>
                  {t('form.enums.conditionOkNaDncBrokenLoose.na')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncBrokenLooseType.DNC}>
                  {t('form.enums.conditionOkNaDncBrokenLoose.dnc')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncBrokenLooseType.BROKEN}>
                  {t('form.enums.conditionOkNaDncBrokenLoose.broken')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncBrokenLooseType.LOOSE}>
                  {t('form.enums.conditionOkNaDncBrokenLoose.loose')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Locking Clamps */}
          <div>
            <Label htmlFor="lockingClamps" className="text-xs font-medium mb-2 block">
              {t('form.bearingClearanceSection.lockingClamps')}
            </Label>
            <Select
              value={lockingClamps}
              onValueChange={(val) => onLockingClampsChange(val as ConditionOkNaDncDamagedType)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={t('form.common.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ConditionOkNaDncDamagedType.OK}>
                  {t('form.enums.conditionOkNaDncDamaged.ok')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncDamagedType.NA}>
                  {t('form.enums.conditionOkNaDncDamaged.na')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncDamagedType.DNC}>
                  {t('form.enums.conditionOkNaDncDamaged.dnc')}
                </SelectItem>
                <SelectItem value={ConditionOkNaDncDamagedType.DAMAGED}>
                  {t('form.enums.conditionOkNaDncDamaged.damaged')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-xs font-medium mb-2 block">
            {t('form.common.notes')}
          </Label>
          <Input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t('form.common.additionalNotes')}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
