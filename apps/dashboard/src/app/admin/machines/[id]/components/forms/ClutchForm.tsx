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
import { Textarea } from '@/components/ui/textarea';
import {
  type ClutchData,
  type ClutchFormProps,
  ClutchType,
  ClutchLocation,
  BrakeSpringStudBoltType,
  BrakeLiningType,
  FlywheelBearingsType,
  FlywheelBrakeType,
  RotaryUnionType,
  ClutchLiningType,
  ClutchSealsType,
  PressureUnit,
  SplinesConditionType,
  AdjustingNutLockType,
  AirLineOilerSettingType,
  SeparateBrakeSealsType,
  FlexDiscType,
} from '@titans-tech/shared/types';

export function ClutchForm({ data, updateFn, errors: _errors, handleBlur }: ClutchFormProps) {
  const tClutch = useTranslations('inspections.form.clutch.fields');
  const tSections = useTranslations('inspections.form.clutch.sections');
  const tPlaceholders = useTranslations('inspections.form.clutch.placeholders');
  const tNotes = useTranslations('inspections.form.clutch.notes');
  const handleSelectChange = (field: keyof ClutchData, value: string) => {
    updateFn(field, value);
  };

  const handleNumberChange = (field: keyof ClutchData, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    updateFn(field, numValue);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clutchType">{tClutch('clutchType')}</Label>
          <Select
            value={data.clutchType || ''}
            onValueChange={(value) => handleSelectChange('clutchType', value)}
          >
            <SelectTrigger id="clutchType">
              <SelectValue placeholder={tPlaceholders('selectType')} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ClutchType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clutchLocation">{tClutch('clutchLocation')}</Label>
          <Select
            value={data.clutchLocation || ''}
            onValueChange={(value) => handleSelectChange('clutchLocation', value)}
          >
            <SelectTrigger id="clutchLocation">
              <SelectValue placeholder={tPlaceholders('selectLocation')} />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ClutchLocation).map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">{tSections('brakeSpringSettings')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brakeSpringBrake">{tClutch('brakeSpringBrake')}</Label>
            <Input
              id="brakeSpringBrake"
              type="number"
              step="0.0001"
              value={data.brakeSpringBrake ?? ''}
              onChange={(e) => handleNumberChange('brakeSpringBrake', e.target.value)}
              onBlur={() => handleBlur('brakeSpringBrake')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeSpringClutch">{tClutch('brakeSpringClutch')}</Label>
            <Input
              id="brakeSpringClutch"
              type="number"
              step="0.0001"
              value={data.brakeSpringClutch ?? ''}
              onChange={(e) => handleNumberChange('brakeSpringClutch', e.target.value)}
              onBlur={() => handleBlur('brakeSpringClutch')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeSpringFB">{tClutch('brakeSpringFB')}</Label>
            <Input
              id="brakeSpringFB"
              type="number"
              step="0.0001"
              value={data.brakeSpringFB ?? ''}
              onChange={(e) => handleNumberChange('brakeSpringFB', e.target.value)}
              onBlur={() => handleBlur('brakeSpringFB')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeSpringFTB">{tClutch('brakeSpringFTB')}</Label>
            <Input
              id="brakeSpringFTB"
              type="number"
              step="0.0001"
              value={data.brakeSpringFTB ?? ''}
              onChange={(e) => handleNumberChange('brakeSpringFTB', e.target.value)}
              onBlur={() => handleBlur('brakeSpringFTB')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeSpringRTB">{tClutch('brakeSpringRTB')}</Label>
            <Input
              id="brakeSpringRTB"
              type="number"
              step="0.0001"
              value={data.brakeSpringRTB ?? ''}
              onChange={(e) => handleNumberChange('brakeSpringRTB', e.target.value)}
              onBlur={() => handleBlur('brakeSpringRTB')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeSpringStudBolt">{tClutch('brakeSpringStudBolt')}</Label>
            <Select
              value={data.brakeSpringStudBolt || ''}
              onValueChange={(value) => handleSelectChange('brakeSpringStudBolt', value)}
            >
              <SelectTrigger id="brakeSpringStudBolt">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BrakeSpringStudBoltType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">{tSections('brakeMeasurements')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brakeStoppingTime">{tClutch('brakeStoppingTime')}</Label>
            <Input
              id="brakeStoppingTime"
              type="number"
              step="0.01"
              value={data.brakeStoppingTime ?? ''}
              onChange={(e) => handleNumberChange('brakeStoppingTime', e.target.value)}
              onBlur={() => handleBlur('brakeStoppingTime')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeLining">{tClutch('brakeLining')}</Label>
            <Select
              value={data.brakeLining || ''}
              onValueChange={(value) => handleSelectChange('brakeLining', value)}
            >
              <SelectTrigger id="brakeLining">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BrakeLiningType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeClearing">{tClutch('brakeClearing')}</Label>
            <Input
              id="brakeClearing"
              type="number"
              step="0.0001"
              value={data.brakeClearing ?? ''}
              onChange={(e) => handleNumberChange('brakeClearing', e.target.value)}
              onBlur={() => handleBlur('brakeClearing')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeClearanceTotal">{tClutch('brakeClearanceTotal')}</Label>
            <Input
              id="brakeClearanceTotal"
              type="number"
              step="0.0001"
              value={data.brakeClearanceTotal ?? ''}
              onChange={(e) => handleNumberChange('brakeClearanceTotal', e.target.value)}
              onBlur={() => handleBlur('brakeClearanceTotal')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakeClearanceRear">{tClutch('brakeClearanceRear')}</Label>
            <Input
              id="brakeClearanceRear"
              type="number"
              step="0.0001"
              value={data.brakeClearanceRear ?? ''}
              onChange={(e) => handleNumberChange('brakeClearanceRear', e.target.value)}
              onBlur={() => handleBlur('brakeClearanceRear')}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">{tSections('flywheel')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flywheelStoppingTime">{tClutch('flywheelStoppingTime')}</Label>
            <Input
              id="flywheelStoppingTime"
              type="number"
              step="0.01"
              value={data.flywheelStoppingTime ?? ''}
              onChange={(e) => handleNumberChange('flywheelStoppingTime', e.target.value)}
              onBlur={() => handleBlur('flywheelStoppingTime')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flywheelBearings">{tClutch('flywheelBearings')}</Label>
            <Select
              value={data.flywheelBearings || ''}
              onValueChange={(value) => handleSelectChange('flywheelBearings', value)}
            >
              <SelectTrigger id="flywheelBearings">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FlywheelBearingsType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flywheelBrake">{tClutch('flywheelBrake')}</Label>
            <Select
              value={data.flywheelBrake || ''}
              onValueChange={(value) => handleSelectChange('flywheelBrake', value)}
            >
              <SelectTrigger id="flywheelBrake">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FlywheelBrakeType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">{tSections('clutchDetails')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rotaryUnion">{tClutch('rotaryUnion')}</Label>
            <Select
              value={data.rotaryUnion || ''}
              onValueChange={(value) => handleSelectChange('rotaryUnion', value)}
            >
              <SelectTrigger id="rotaryUnion">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(RotaryUnionType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clutchLining">{tClutch('clutchLining')}</Label>
            <Select
              value={data.clutchLining || ''}
              onValueChange={(value) => handleSelectChange('clutchLining', value)}
            >
              <SelectTrigger id="clutchLining">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ClutchLiningType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clutchSeals">{tClutch('clutchSeals')}</Label>
            <Select
              value={data.clutchSeals || ''}
              onValueChange={(value) => handleSelectChange('clutchSeals', value)}
            >
              <SelectTrigger id="clutchSeals">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ClutchSealsType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clutchEngagements">{tClutch('clutchEngagements')}</Label>
            <Input
              id="clutchEngagements"
              type="number"
              value={data.clutchEngagements ?? ''}
              onChange={(e) => handleNumberChange('clutchEngagements', e.target.value)}
              onBlur={() => handleBlur('clutchEngagements')}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">
          {tSections('gearBacklashCrankEndplay')}
          <span className="text-xs text-muted-foreground ml-2">
            {tNotes('gearBacklashCheck')}
          </span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gearBacklashBefore">{tClutch('gearBacklashBefore')}</Label>
            <Input
              id="gearBacklashBefore"
              type="number"
              step="0.0001"
              value={data.gearBacklashBefore ?? ''}
              onChange={(e) => handleNumberChange('gearBacklashBefore', e.target.value)}
              onBlur={() => handleBlur('gearBacklashBefore')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gearBacklashAfter">{tClutch('gearBacklashAfter')}</Label>
            <Input
              id="gearBacklashAfter"
              type="number"
              step="0.0001"
              value={data.gearBacklashAfter ?? ''}
              onChange={(e) => handleNumberChange('gearBacklashAfter', e.target.value)}
              onBlur={() => handleBlur('gearBacklashAfter')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crankEndplayBefore">{tClutch('crankEndplayBefore')}</Label>
            <Input
              id="crankEndplayBefore"
              type="number"
              step="0.0001"
              value={data.crankEndplayBefore ?? ''}
              onChange={(e) => handleNumberChange('crankEndplayBefore', e.target.value)}
              onBlur={() => handleBlur('crankEndplayBefore')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crankEndplayAfter">{tClutch('crankEndplayAfter')}</Label>
            <Input
              id="crankEndplayAfter"
              type="number"
              step="0.0001"
              value={data.crankEndplayAfter ?? ''}
              onChange={(e) => handleNumberChange('crankEndplayAfter', e.target.value)}
              onBlur={() => handleBlur('crankEndplayAfter')}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">{tSections('airSystem')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="airRegulatorValue">{tClutch('airRegulator')}</Label>
            <div className="flex gap-2">
              <Input
                id="airRegulatorValue"
                type="number"
                step="0.01"
                value={data.airRegulatorValue ?? ''}
                onChange={(e) => handleNumberChange('airRegulatorValue', e.target.value)}
                onBlur={() => handleBlur('airRegulatorValue')}
                className="flex-1"
              />
              <Select
                value={data.airRegulatorUnit || PressureUnit.PSI}
                onValueChange={(value) => handleSelectChange('airRegulatorUnit', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PressureUnit).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="airClutchTravel">{tClutch('airClutchTravelClearance')}</Label>
            <Input
              id="airClutchTravel"
              type="number"
              step="0.0001"
              value={data.airClutchTravel ?? ''}
              onChange={(e) => handleNumberChange('airClutchTravel', e.target.value)}
              onBlur={() => handleBlur('airClutchTravel')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="airLineOilerSetting">{tClutch('airLineOilerSetting')}</Label>
            <Select
              value={data.airLineOilerSetting || ''}
              onValueChange={(value) => handleSelectChange('airLineOilerSetting', value)}
            >
              <SelectTrigger id="airLineOilerSetting">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AirLineOilerSettingType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="splinesDriveRingDisc">{tClutch('splinesDriveRingDisc')}</Label>
            <Select
              value={data.splinesDriveRingDisc || ''}
              onValueChange={(value) => handleSelectChange('splinesDriveRingDisc', value)}
            >
              <SelectTrigger id="splinesDriveRingDisc">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SplinesConditionType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustingNutLockSecure">{tClutch('adjustingNutLockSecure')}</Label>
            <Select
              value={data.adjustingNutLockSecure || ''}
              onValueChange={(value) => handleSelectChange('adjustingNutLockSecure', value)}
            >
              <SelectTrigger id="adjustingNutLockSecure">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AdjustingNutLockType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="separateBrakeSeals">{tClutch('separateBrakeSeals')}</Label>
            <Select
              value={data.separateBrakeSeals || ''}
              onValueChange={(value) => handleSelectChange('separateBrakeSeals', value)}
            >
              <SelectTrigger id="separateBrakeSeals">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SeparateBrakeSealsType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">{tSections('hydraulicSystem')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hydClutchClearanceTotal">{tClutch('hydClutchClearanceTotal')}</Label>
            <Input
              id="hydClutchClearanceTotal"
              type="number"
              step="0.0001"
              value={data.hydClutchClearanceTotal ?? ''}
              onChange={(e) => handleNumberChange('hydClutchClearanceTotal', e.target.value)}
              onBlur={() => handleBlur('hydClutchClearanceTotal')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hydClutchClearanceRear">{tClutch('hydClutchClearanceRear')}</Label>
            <Input
              id="hydClutchClearanceRear"
              type="number"
              step="0.0001"
              value={data.hydClutchClearanceRear ?? ''}
              onChange={(e) => handleNumberChange('hydClutchClearanceRear', e.target.value)}
              onBlur={() => handleBlur('hydClutchClearanceRear')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hydraulicPressureValue">{tClutch('hydraulicPressure')}</Label>
            <div className="flex gap-2">
              <Input
                id="hydraulicPressureValue"
                type="number"
                step="0.01"
                value={data.hydraulicPressureValue ?? ''}
                onChange={(e) => handleNumberChange('hydraulicPressureValue', e.target.value)}
                onBlur={() => handleBlur('hydraulicPressureValue')}
                className="flex-1"
              />
              <Select
                value={data.hydraulicPressureUnit || PressureUnit.PSI}
                onValueChange={(value) => handleSelectChange('hydraulicPressureUnit', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PressureUnit).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accumulatorValue">{tClutch('accumulator')}</Label>
            <div className="flex gap-2">
              <Input
                id="accumulatorValue"
                type="number"
                step="0.01"
                value={data.accumulatorValue ?? ''}
                onChange={(e) => handleNumberChange('accumulatorValue', e.target.value)}
                onBlur={() => handleBlur('accumulatorValue')}
                className="flex-1"
              />
              <Select
                value={data.accumulatorUnit || PressureUnit.PSI}
                onValueChange={(value) => handleSelectChange('accumulatorUnit', value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PressureUnit).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flexDisc">{tClutch('flexDisc')}</Label>
            <Select
              value={data.flexDisc || ''}
              onValueChange={(value) => handleSelectChange('flexDisc', value)}
            >
              <SelectTrigger id="flexDisc">
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FlexDiscType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{tClutch('notes')}</Label>
        <Textarea
          id="notes"
          value={data.notes ?? ''}
          onChange={(e) => updateFn('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          rows={4}
          placeholder={tPlaceholders('notes')}
        />
      </div>
    </div>
  );
}
