'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type ClutchFormProps } from '@/data/types/services.types';

export function ClutchForm({ data, updateFn, errors, handleBlur }: ClutchFormProps) {
  const t = useTranslations('inspections');

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.clutch.clutchInfoTitle')}</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clutchType" className="text-xs">
              {t('form.clutch.clutchType')}
            </Label>
            <Input
              id="clutchType"
              value={data.clutchType || ''}
              onChange={(e) => updateFn('clutchType', e.target.value)}
              onBlur={() => handleBlur('clutchType')}
              className={`mt-1 ${errors.clutchType ? 'border-destructive' : ''}`}
            />
            {errors.clutchType && (
              <p className="text-xs text-destructive mt-1">{errors.clutchType}</p>
            )}
          </div>

          <div>
            <Label htmlFor="clutchLocation" className="text-xs">
              {t('form.clutch.clutchLocation')}
            </Label>
            <Input
              id="clutchLocation"
              value={data.clutchLocation || ''}
              onChange={(e) => updateFn('clutchLocation', e.target.value)}
              onBlur={() => handleBlur('clutchLocation')}
              className={`mt-1 ${errors.clutchLocation ? 'border-destructive' : ''}`}
            />
            {errors.clutchLocation && (
              <p className="text-xs text-destructive mt-1">{errors.clutchLocation}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.clutch.brakeSpringTitle')}</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="brakeSpringBrake" className="text-xs">
              {t('form.clutch.brakeSpringBrake')}
            </Label>
            <Input
              id="brakeSpringBrake"
              type="number"
              step="0.0001"
              value={data.brakeSpringBrake || ''}
              onChange={(e) =>
                updateFn('brakeSpringBrake', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('brakeSpringBrake')}
              className={`mt-1 ${errors.brakeSpringBrake ? 'border-destructive' : ''}`}
            />
            {errors.brakeSpringBrake && (
              <p className="text-xs text-destructive mt-1">{errors.brakeSpringBrake}</p>
            )}
          </div>

          <div>
            <Label htmlFor="brakeSpringClutch" className="text-xs">
              {t('form.clutch.brakeSpringClutch')}
            </Label>
            <Input
              id="brakeSpringClutch"
              type="number"
              step="0.0001"
              value={data.brakeSpringClutch || ''}
              onChange={(e) =>
                updateFn('brakeSpringClutch', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('brakeSpringClutch')}
              className={`mt-1 ${errors.brakeSpringClutch ? 'border-destructive' : ''}`}
            />
            {errors.brakeSpringClutch && (
              <p className="text-xs text-destructive mt-1">{errors.brakeSpringClutch}</p>
            )}
          </div>

          <div>
            <Label htmlFor="brakeSpringStudBolt" className="text-xs">
              {t('form.clutch.brakeSpringStudBolt')}
            </Label>
            <Input
              id="brakeSpringStudBolt"
              value={data.brakeSpringStudBolt || ''}
              onChange={(e) => updateFn('brakeSpringStudBolt', e.target.value)}
              onBlur={() => handleBlur('brakeSpringStudBolt')}
              className={`mt-1 ${errors.brakeSpringStudBolt ? 'border-destructive' : ''}`}
            />
            {errors.brakeSpringStudBolt && (
              <p className="text-xs text-destructive mt-1">{errors.brakeSpringStudBolt}</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.clutch.brakeMeasurementsTitle')}</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="brakeAnchorClearanceFB" className="text-xs">
              {t('form.clutch.brakeAnchorClearanceFB')}
            </Label>
            <Input
              id="brakeAnchorClearanceFB"
              type="number"
              step="0.0001"
              value={data.brakeAnchorClearanceFB || ''}
              onChange={(e) =>
                updateFn(
                  'brakeAnchorClearanceFB',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              onBlur={() => handleBlur('brakeAnchorClearanceFB')}
              className={`mt-1 ${errors.brakeAnchorClearanceFB ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="brakeAnchorClearanceFTB" className="text-xs">
              {t('form.clutch.brakeAnchorClearanceFTB')}
            </Label>
            <Input
              id="brakeAnchorClearanceFTB"
              type="number"
              step="0.0001"
              value={data.brakeAnchorClearanceFTB || ''}
              onChange={(e) =>
                updateFn(
                  'brakeAnchorClearanceFTB',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              onBlur={() => handleBlur('brakeAnchorClearanceFTB')}
              className={`mt-1 ${errors.brakeAnchorClearanceFTB ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="brakeAnchorClearanceRTB" className="text-xs">
              {t('form.clutch.brakeAnchorClearanceRTB')}
            </Label>
            <Input
              id="brakeAnchorClearanceRTB"
              type="number"
              step="0.0001"
              value={data.brakeAnchorClearanceRTB || ''}
              onChange={(e) =>
                updateFn(
                  'brakeAnchorClearanceRTB',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              onBlur={() => handleBlur('brakeAnchorClearanceRTB')}
              className={`mt-1 ${errors.brakeAnchorClearanceRTB ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="brakeStoppingTime" className="text-xs">
              {t('form.clutch.brakeStoppingTime')}
            </Label>
            <Input
              id="brakeStoppingTime"
              type="number"
              step="0.01"
              value={data.brakeStoppingTime || ''}
              onChange={(e) =>
                updateFn('brakeStoppingTime', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('brakeStoppingTime')}
              className={`mt-1 ${errors.brakeStoppingTime ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="brakeLining" className="text-xs">
              {t('form.clutch.brakeLining')}
            </Label>
            <Input
              id="brakeLining"
              value={data.brakeLining || ''}
              onChange={(e) => updateFn('brakeLining', e.target.value)}
              onBlur={() => handleBlur('brakeLining')}
              className={`mt-1 ${errors.brakeLining ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="brakeClearing" className="text-xs">
              {t('form.clutch.brakeClearing')}
            </Label>
            <Input
              id="brakeClearing"
              type="number"
              step="0.0001"
              value={data.brakeClearing || ''}
              onChange={(e) =>
                updateFn('brakeClearing', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('brakeClearing')}
              className={`mt-1 ${errors.brakeClearing ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="brakeClearanceTotal" className="text-xs">
              {t('form.clutch.brakeClearanceTotal')}
            </Label>
            <Input
              id="brakeClearanceTotal"
              type="number"
              step="0.0001"
              value={data.brakeClearanceTotal || ''}
              onChange={(e) =>
                updateFn('brakeClearanceTotal', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('brakeClearanceTotal')}
              className={`mt-1 ${errors.brakeClearanceTotal ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="brakeClearanceRear" className="text-xs">
              {t('form.clutch.brakeClearanceRear')}
            </Label>
            <Input
              id="brakeClearanceRear"
              type="number"
              step="0.0001"
              value={data.brakeClearanceRear || ''}
              onChange={(e) =>
                updateFn('brakeClearanceRear', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('brakeClearanceRear')}
              className={`mt-1 ${errors.brakeClearanceRear ? 'border-destructive' : ''}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.clutch.flywheelTitle')}</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="flywheelStoppingTime" className="text-xs">
              {t('form.clutch.flywheelStoppingTime')}
            </Label>
            <Input
              id="flywheelStoppingTime"
              type="number"
              step="0.01"
              value={data.flywheelStoppingTime || ''}
              onChange={(e) =>
                updateFn(
                  'flywheelStoppingTime',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              onBlur={() => handleBlur('flywheelStoppingTime')}
              className={`mt-1 ${errors.flywheelStoppingTime ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="flywheelBearings" className="text-xs">
              {t('form.clutch.flywheelBearings')}
            </Label>
            <Input
              id="flywheelBearings"
              value={data.flywheelBearings || ''}
              onChange={(e) => updateFn('flywheelBearings', e.target.value)}
              onBlur={() => handleBlur('flywheelBearings')}
              className={`mt-1 ${errors.flywheelBearings ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="flywheelBrake" className="text-xs">
              {t('form.clutch.flywheelBrake')}
            </Label>
            <Input
              id="flywheelBrake"
              value={data.flywheelBrake || ''}
              onChange={(e) => updateFn('flywheelBrake', e.target.value)}
              onBlur={() => handleBlur('flywheelBrake')}
              className={`mt-1 ${errors.flywheelBrake ? 'border-destructive' : ''}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.clutch.clutchDetailsTitle')}</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="clutchEngagements" className="text-xs">
              {t('form.clutch.clutchEngagements')}
            </Label>
            <Input
              id="clutchEngagements"
              type="number"
              value={data.clutchEngagements || ''}
              onChange={(e) =>
                updateFn('clutchEngagements', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('clutchEngagements')}
              className={`mt-1 ${errors.clutchEngagements ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="clutchLining" className="text-xs">
              {t('form.clutch.clutchLining')}
            </Label>
            <Input
              id="clutchLining"
              value={data.clutchLining || ''}
              onChange={(e) => updateFn('clutchLining', e.target.value)}
              onBlur={() => handleBlur('clutchLining')}
              className={`mt-1 ${errors.clutchLining ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="clutchSeals" className="text-xs">
              {t('form.clutch.clutchSeals')}
            </Label>
            <Input
              id="clutchSeals"
              value={data.clutchSeals || ''}
              onChange={(e) => updateFn('clutchSeals', e.target.value)}
              onBlur={() => handleBlur('clutchSeals')}
              className={`mt-1 ${errors.clutchSeals ? 'border-destructive' : ''}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.clutch.gearCrankTitle')}</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="gearBacklashBefore" className="text-xs">
              {t('form.clutch.gearBacklashBefore')}
            </Label>
            <Input
              id="gearBacklashBefore"
              type="number"
              step="0.0001"
              value={data.gearBacklashBefore || ''}
              onChange={(e) =>
                updateFn('gearBacklashBefore', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('gearBacklashBefore')}
              className={`mt-1 ${errors.gearBacklashBefore ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="gearBacklashAfter" className="text-xs">
              {t('form.clutch.gearBacklashAfter')}
            </Label>
            <Input
              id="gearBacklashAfter"
              type="number"
              step="0.0001"
              value={data.gearBacklashAfter || ''}
              onChange={(e) =>
                updateFn('gearBacklashAfter', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('gearBacklashAfter')}
              className={`mt-1 ${errors.gearBacklashAfter ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="crankEndplayBefore" className="text-xs">
              {t('form.clutch.crankEndplayBefore')}
            </Label>
            <Input
              id="crankEndplayBefore"
              type="number"
              step="0.0001"
              value={data.crankEndplayBefore || ''}
              onChange={(e) =>
                updateFn('crankEndplayBefore', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('crankEndplayBefore')}
              className={`mt-1 ${errors.crankEndplayBefore ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="crankEndplayAfter" className="text-xs">
              {t('form.clutch.crankEndplayAfter')}
            </Label>
            <Input
              id="crankEndplayAfter"
              type="number"
              step="0.0001"
              value={data.crankEndplayAfter || ''}
              onChange={(e) =>
                updateFn('crankEndplayAfter', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('crankEndplayAfter')}
              className={`mt-1 ${errors.crankEndplayAfter ? 'border-destructive' : ''}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.clutch.airSystemTitle')}</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="airRegulatorPSI" className="text-xs">
              {t('form.clutch.airRegulatorPSI')}
            </Label>
            <Input
              id="airRegulatorPSI"
              type="number"
              step="0.01"
              value={data.airRegulatorPSI || ''}
              onChange={(e) =>
                updateFn('airRegulatorPSI', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('airRegulatorPSI')}
              className={`mt-1 ${errors.airRegulatorPSI ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="airClutchTravel" className="text-xs">
              {t('form.clutch.airClutchTravel')}
            </Label>
            <Input
              id="airClutchTravel"
              type="number"
              step="0.0001"
              value={data.airClutchTravel || ''}
              onChange={(e) =>
                updateFn('airClutchTravel', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('airClutchTravel')}
              className={`mt-1 ${errors.airClutchTravel ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="airLineOilerSetting" className="text-xs">
              {t('form.clutch.airLineOilerSetting')}
            </Label>
            <Input
              id="airLineOilerSetting"
              value={data.airLineOilerSetting || ''}
              onChange={(e) => updateFn('airLineOilerSetting', e.target.value)}
              onBlur={() => handleBlur('airLineOilerSetting')}
              className={`mt-1 ${errors.airLineOilerSetting ? 'border-destructive' : ''}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.clutch.hydraulicSystemTitle')}</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="hydClutchClearanceTotal" className="text-xs">
              {t('form.clutch.hydClutchClearanceTotal')}
            </Label>
            <Input
              id="hydClutchClearanceTotal"
              type="number"
              step="0.0001"
              value={data.hydClutchClearanceTotal || ''}
              onChange={(e) =>
                updateFn(
                  'hydClutchClearanceTotal',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              onBlur={() => handleBlur('hydClutchClearanceTotal')}
              className={`mt-1 ${errors.hydClutchClearanceTotal ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="hydClutchClearanceRear" className="text-xs">
              {t('form.clutch.hydClutchClearanceRear')}
            </Label>
            <Input
              id="hydClutchClearanceRear"
              type="number"
              step="0.0001"
              value={data.hydClutchClearanceRear || ''}
              onChange={(e) =>
                updateFn(
                  'hydClutchClearanceRear',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              onBlur={() => handleBlur('hydClutchClearanceRear')}
              className={`mt-1 ${errors.hydClutchClearanceRear ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="hydraulicPressurePSI" className="text-xs">
              {t('form.clutch.hydraulicPressurePSI')}
            </Label>
            <Input
              id="hydraulicPressurePSI"
              type="number"
              step="0.01"
              value={data.hydraulicPressurePSI || ''}
              onChange={(e) =>
                updateFn(
                  'hydraulicPressurePSI',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              onBlur={() => handleBlur('hydraulicPressurePSI')}
              className={`mt-1 ${errors.hydraulicPressurePSI ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="accumulatorPSI" className="text-xs">
              {t('form.clutch.accumulatorPSI')}
            </Label>
            <Input
              id="accumulatorPSI"
              type="number"
              step="0.01"
              value={data.accumulatorPSI || ''}
              onChange={(e) =>
                updateFn('accumulatorPSI', e.target.value ? Number(e.target.value) : undefined)
              }
              onBlur={() => handleBlur('accumulatorPSI')}
              className={`mt-1 ${errors.accumulatorPSI ? 'border-destructive' : ''}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-4">{t('form.clutch.componentConditionTitle')}</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="rotaryUnion" className="text-xs">
              {t('form.clutch.rotaryUnion')}
            </Label>
            <Input
              id="rotaryUnion"
              value={data.rotaryUnion || ''}
              onChange={(e) => updateFn('rotaryUnion', e.target.value)}
              onBlur={() => handleBlur('rotaryUnion')}
              className={`mt-1 ${errors.rotaryUnion ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="splinesDriveRingDisc" className="text-xs">
              {t('form.clutch.splinesDriveRingDisc')}
            </Label>
            <Input
              id="splinesDriveRingDisc"
              value={data.splinesDriveRingDisc || ''}
              onChange={(e) => updateFn('splinesDriveRingDisc', e.target.value)}
              onBlur={() => handleBlur('splinesDriveRingDisc')}
              className={`mt-1 ${errors.splinesDriveRingDisc ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="adjustingNutLockSecure" className="text-xs">
              {t('form.clutch.adjustingNutLockSecure')}
            </Label>
            <Input
              id="adjustingNutLockSecure"
              value={data.adjustingNutLockSecure || ''}
              onChange={(e) => updateFn('adjustingNutLockSecure', e.target.value)}
              onBlur={() => handleBlur('adjustingNutLockSecure')}
              className={`mt-1 ${errors.adjustingNutLockSecure ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="separateBrakeSeals" className="text-xs">
              {t('form.clutch.separateBrakeSeals')}
            </Label>
            <Input
              id="separateBrakeSeals"
              value={data.separateBrakeSeals || ''}
              onChange={(e) => updateFn('separateBrakeSeals', e.target.value)}
              onBlur={() => handleBlur('separateBrakeSeals')}
              className={`mt-1 ${errors.separateBrakeSeals ? 'border-destructive' : ''}`}
            />
          </div>

          <div>
            <Label htmlFor="flexDisc" className="text-xs">
              {t('form.clutch.flexDisc')}
            </Label>
            <Input
              id="flexDisc"
              value={data.flexDisc || ''}
              onChange={(e) => updateFn('flexDisc', e.target.value)}
              onBlur={() => handleBlur('flexDisc')}
              className={`mt-1 ${errors.flexDisc ? 'border-destructive' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
