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
import { LengthInput } from '@/components/ui/forms/LengthInput';
import { PressureInput } from '@/components/ui/forms/PressureInput';
import {
  ClutchType,
  ClutchLocation,
  BrakeSpringStudBoltType,
  BrakeLiningType,
  FlywheelBearingsType,
  FlywheelBrakeType,
  RotaryUnionType,
  ClutchLiningType,
  ClutchSealsType,
  SplinesConditionType,
  AdjustingNutLockType,
  AirLineOilerSettingType,
  SeparateBrakeSealsType,
  FlexDiscType,
} from '@titans-tech/shared/types/services';
import type { ClutchData } from '@titans-tech/shared/types/services';

export interface ClutchCevolaniFormProps {
  data: ClutchData;
  updateFn: (field: keyof ClutchData, value: string | number | undefined) => void;
  errors?: Record<string, string>;
  handleBlur: (field: keyof ClutchData) => void;
}

export function ClutchCevolaniForm({
  data,
  updateFn,
  errors: _errors,
  handleBlur,
}: ClutchCevolaniFormProps) {
  const tClutch = useTranslations('inspections.form.clutch.fields');
  const tSections = useTranslations('inspections.form.clutch.sections');
  const tPlaceholders = useTranslations('inspections.form.clutch.placeholders');
  const tNotes = useTranslations('inspections.form.clutch.notes');
  const tCommon = useTranslations('common.status');
  const tClutchCevolani = useTranslations('inspections.form.clutchCevolani');

  const handleSelectChange = (field: keyof ClutchData, value: string) => {
    updateFn(field, value);
  };

  const handleSelectClear = (field: keyof ClutchData) => {
    updateFn(field, undefined);
  };

  const handleNumberChange = (field: keyof ClutchData, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    updateFn(field, numValue);
  };

  // Helper function to translate enum values for display
  const translateEnum = (value: string): string => {
    const enumMap: Record<string, string> = {
      OK: tCommon('ok'),
      NA: tCommon('na'),
      DNC: tCommon('dnc'),
      YES: tCommon('yes'),
      NO: tCommon('no'),
      DAMAGED: tCommon('damaged'),
      LEAKING: tCommon('leaking'),
      NOT_OPERATIONAL: tCommon('not_operational'),
      GLAZED: tCommon('glazed'),
      OIL_SOAKED: tCommon('oil_soaked'),
      MISSING_SEGMENTS: tCommon('missing_segments'),
      BROKEN: tCommon('broken'),
      BENT_WORN: tCommon('bent_worn'),
      LINING_WORN: tCommon('lining_worn'),
      NOISE: tCommon('noise'),
      WOBBLE: tCommon('wobble'),
      AIR_LEAK: tCommon('air_leak'),
      OIL_LEAK: tCommon('oil_leak'),
      CONCENTRICITY: tCommon('concentricity'),
      SLOW_RESPONSE: tCommon('slow_response'),
      NOT_VISIBLE: tCommon('not_visible'),
      WEAR_VISIBLE: tCommon('wear_visible'),
      NEEDS_OIL: tCommon('needs_oil'),
      NEEDS_OIL_RESET: tCommon('needs_oil_reset'),
      NEEDS_RESET: tCommon('needs_reset'),
      BUCKLED: tCommon('buckled'),
      CRACKED: tCommon('cracked'),
    };
    return enumMap[value] || value;
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
            <SelectTrigger
              id="clutchType"
              clearable
              hasValue={!!data.clutchType}
              onClear={() => handleSelectClear('clutchType')}
            >
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
            <SelectTrigger
              id="clutchLocation"
              clearable
              hasValue={!!data.clutchLocation}
              onClear={() => handleSelectClear('clutchLocation')}
            >
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
              <SelectTrigger
                id="brakeSpringStudBolt"
                clearable
                hasValue={!!data.brakeSpringStudBolt}
                onClear={() => handleSelectClear('brakeSpringStudBolt')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BrakeSpringStudBoltType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
              <SelectTrigger
                id="brakeLining"
                clearable
                hasValue={!!data.brakeLining}
                onClear={() => handleSelectClear('brakeLining')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BrakeLiningType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <LengthInput
            id="brakeClearing"
            label={tClutch('brakeClearing')}
            value={data.brakeClearing}
            onChange={(val) => updateFn('brakeClearing', val)}
            onBlur={() => handleBlur('brakeClearing')}
          />

          <LengthInput
            id="brakeClearanceTotal"
            label={tClutch('brakeClearanceTotal')}
            value={data.brakeClearanceTotal}
            onChange={(val) => updateFn('brakeClearanceTotal', val)}
            onBlur={() => handleBlur('brakeClearanceTotal')}
          />

          <LengthInput
            id="brakeClearanceRear"
            label={tClutch('brakeClearanceRear')}
            value={data.brakeClearanceRear}
            onChange={(val) => updateFn('brakeClearanceRear', val)}
            onBlur={() => handleBlur('brakeClearanceRear')}
          />
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
              <SelectTrigger
                id="flywheelBearings"
                clearable
                hasValue={!!data.flywheelBearings}
                onClear={() => handleSelectClear('flywheelBearings')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FlywheelBearingsType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
              <SelectTrigger
                id="flywheelBrake"
                clearable
                hasValue={!!data.flywheelBrake}
                onClear={() => handleSelectClear('flywheelBrake')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FlywheelBrakeType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
              <SelectTrigger
                id="rotaryUnion"
                clearable
                hasValue={!!data.rotaryUnion}
                onClear={() => handleSelectClear('rotaryUnion')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(RotaryUnionType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
              <SelectTrigger
                id="clutchLining"
                clearable
                hasValue={!!data.clutchLining}
                onClear={() => handleSelectClear('clutchLining')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ClutchLiningType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
              <SelectTrigger
                id="clutchSeals"
                clearable
                hasValue={!!data.clutchSeals}
                onClear={() => handleSelectClear('clutchSeals')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ClutchSealsType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
          <span className="text-xs text-muted-foreground ml-2">{tNotes('gearBacklashCheck')}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LengthInput
            id="gearBacklashBefore"
            label={tClutch('gearBacklashBefore')}
            value={data.gearBacklashBefore}
            onChange={(val) => updateFn('gearBacklashBefore', val)}
            onBlur={() => handleBlur('gearBacklashBefore')}
          />

          <LengthInput
            id="gearBacklashAfter"
            label={tClutch('gearBacklashAfter')}
            value={data.gearBacklashAfter}
            onChange={(val) => updateFn('gearBacklashAfter', val)}
            onBlur={() => handleBlur('gearBacklashAfter')}
          />

          <LengthInput
            id="crankEndplayBefore"
            label={tClutch('crankEndplayBefore')}
            value={data.crankEndplayBefore}
            onChange={(val) => updateFn('crankEndplayBefore', val)}
            onBlur={() => handleBlur('crankEndplayBefore')}
          />

          <LengthInput
            id="crankEndplayAfter"
            label={tClutch('crankEndplayAfter')}
            value={data.crankEndplayAfter}
            onChange={(val) => updateFn('crankEndplayAfter', val)}
            onBlur={() => handleBlur('crankEndplayAfter')}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm">{tSections('airSystem')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PressureInput
            id="airRegulatorValue"
            label={tClutch('airRegulator')}
            value={data.airRegulatorValue}
            onChange={(val) => updateFn('airRegulatorValue', val)}
            onBlur={() => handleBlur('airRegulatorValue')}
          />

          <LengthInput
            id="airClutchTravel"
            label={tClutch('airClutchTravelClearance')}
            value={data.airClutchTravel}
            onChange={(val) => updateFn('airClutchTravel', val)}
            onBlur={() => handleBlur('airClutchTravel')}
          />

          <div className="space-y-2">
            <Label htmlFor="airLineOilerSetting">{tClutch('airLineOilerSetting')}</Label>
            <Select
              value={data.airLineOilerSetting || ''}
              onValueChange={(value) => handleSelectChange('airLineOilerSetting', value)}
            >
              <SelectTrigger
                id="airLineOilerSetting"
                clearable
                hasValue={!!data.airLineOilerSetting}
                onClear={() => handleSelectClear('airLineOilerSetting')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AirLineOilerSettingType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
              <SelectTrigger
                id="splinesDriveRingDisc"
                clearable
                hasValue={!!data.splinesDriveRingDisc}
                onClear={() => handleSelectClear('splinesDriveRingDisc')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SplinesConditionType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
              <SelectTrigger
                id="adjustingNutLockSecure"
                clearable
                hasValue={!!data.adjustingNutLockSecure}
                onClear={() => handleSelectClear('adjustingNutLockSecure')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AdjustingNutLockType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
              <SelectTrigger
                id="separateBrakeSeals"
                clearable
                hasValue={!!data.separateBrakeSeals}
                onClear={() => handleSelectClear('separateBrakeSeals')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SeparateBrakeSealsType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pneumatic System Section - replaces Hydraulic System for CLUTCH_CEVOLANI */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">{tClutchCevolani('sections.pneumaticSystem')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LengthInput
            id="pneumaticClutchClearanceTotal"
            label={tClutchCevolani('fields.pneumaticClutchClearanceTotal')}
            value={data.pneumaticClutchClearanceTotal}
            onChange={(val) => updateFn('pneumaticClutchClearanceTotal', val)}
            onBlur={() => handleBlur('pneumaticClutchClearanceTotal')}
            required
            generatesAlert
          />

          <div className="space-y-2">
            <Label htmlFor="flexDisc">{tClutch('flexDisc')}</Label>
            <Select
              value={data.flexDisc || ''}
              onValueChange={(value) => handleSelectChange('flexDisc', value)}
            >
              <SelectTrigger
                id="flexDisc"
                clearable
                hasValue={!!data.flexDisc}
                onClear={() => handleSelectClear('flexDisc')}
              >
                <SelectValue placeholder={tPlaceholders('select')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FlexDiscType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateEnum(type)}
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
