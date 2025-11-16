'use client';

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
          <Label htmlFor="clutchType">Clutch Type</Label>
          <Select
            value={data.clutchType || ''}
            onValueChange={(value) => handleSelectChange('clutchType', value)}
          >
            <SelectTrigger id="clutchType">
              <SelectValue placeholder="Select type" />
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
          <Label htmlFor="clutchLocation">Clutch Location</Label>
          <Select
            value={data.clutchLocation || ''}
            onValueChange={(value) => handleSelectChange('clutchLocation', value)}
          >
            <SelectTrigger id="clutchLocation">
              <SelectValue placeholder="Select location" />
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
        <h4 className="font-semibold text-sm">Brake Spring Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brakeSpringBrake">Brake (inches)</Label>
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
            <Label htmlFor="brakeSpringClutch">Clutch (inches)</Label>
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
            <Label htmlFor="brakeSpringFB">F-B (inches)</Label>
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
            <Label htmlFor="brakeSpringFTB">F-TB (inches)</Label>
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
            <Label htmlFor="brakeSpringRTB">R-TB (inches)</Label>
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
            <Label htmlFor="brakeSpringStudBolt">Brake Spring Stud/Bolt</Label>
            <Select
              value={data.brakeSpringStudBolt || ''}
              onValueChange={(value) => handleSelectChange('brakeSpringStudBolt', value)}
            >
              <SelectTrigger id="brakeSpringStudBolt">
                <SelectValue placeholder="Select" />
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
        <h4 className="font-semibold text-sm">Brake Measurements</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brakeStoppingTime">Brake Stopping Time</Label>
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
            <Label htmlFor="brakeLining">Brake Lining</Label>
            <Select
              value={data.brakeLining || ''}
              onValueChange={(value) => handleSelectChange('brakeLining', value)}
            >
              <SelectTrigger id="brakeLining">
                <SelectValue placeholder="Select" />
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
            <Label htmlFor="brakeClearing">Brake Clearing</Label>
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
            <Label htmlFor="brakeClearanceTotal">Brake Clearance (Total)</Label>
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
            <Label htmlFor="brakeClearanceRear">Brake Clearance (Rear)</Label>
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
        <h4 className="font-semibold text-sm">Flywheel</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flywheelStoppingTime">Flywheel Stopping Time</Label>
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
            <Label htmlFor="flywheelBearings">Flywheel Bearings</Label>
            <Select
              value={data.flywheelBearings || ''}
              onValueChange={(value) => handleSelectChange('flywheelBearings', value)}
            >
              <SelectTrigger id="flywheelBearings">
                <SelectValue placeholder="Select" />
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
            <Label htmlFor="flywheelBrake">Flywheel Brake</Label>
            <Select
              value={data.flywheelBrake || ''}
              onValueChange={(value) => handleSelectChange('flywheelBrake', value)}
            >
              <SelectTrigger id="flywheelBrake">
                <SelectValue placeholder="Select" />
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
        <h4 className="font-semibold text-sm">Clutch Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rotaryUnion">Rotary Union</Label>
            <Select
              value={data.rotaryUnion || ''}
              onValueChange={(value) => handleSelectChange('rotaryUnion', value)}
            >
              <SelectTrigger id="rotaryUnion">
                <SelectValue placeholder="Select" />
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
            <Label htmlFor="clutchLining">Clutch Lining</Label>
            <Select
              value={data.clutchLining || ''}
              onValueChange={(value) => handleSelectChange('clutchLining', value)}
            >
              <SelectTrigger id="clutchLining">
                <SelectValue placeholder="Select" />
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
            <Label htmlFor="clutchSeals">Clutch Seals</Label>
            <Select
              value={data.clutchSeals || ''}
              onValueChange={(value) => handleSelectChange('clutchSeals', value)}
            >
              <SelectTrigger id="clutchSeals">
                <SelectValue placeholder="Select" />
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
            <Label htmlFor="clutchEngagements">Clutch Engagements</Label>
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
          Gear Backlash & Crank Endplay
          <span className="text-xs text-muted-foreground ml-2">
            *Check only if excessive noise and/or vibration is present
          </span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gearBacklashBefore">Gear Backlash (Before)</Label>
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
            <Label htmlFor="gearBacklashAfter">Gear Backlash (After)</Label>
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
            <Label htmlFor="crankEndplayBefore">Crank Endplay (Before)</Label>
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
            <Label htmlFor="crankEndplayAfter">Crank Endplay (After)</Label>
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
        <h4 className="font-semibold text-sm">Air System</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="airRegulatorValue">Air Regulator</Label>
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
            <Label htmlFor="airClutchTravel">Air Clutch Travel/Clearance</Label>
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
            <Label htmlFor="airLineOilerSetting">Air Line Oiler Setting</Label>
            <Select
              value={data.airLineOilerSetting || ''}
              onValueChange={(value) => handleSelectChange('airLineOilerSetting', value)}
            >
              <SelectTrigger id="airLineOilerSetting">
                <SelectValue placeholder="Select" />
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
            <Label htmlFor="splinesDriveRingDisc">Splines: Drive Ring Disc</Label>
            <Select
              value={data.splinesDriveRingDisc || ''}
              onValueChange={(value) => handleSelectChange('splinesDriveRingDisc', value)}
            >
              <SelectTrigger id="splinesDriveRingDisc">
                <SelectValue placeholder="Select" />
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
            <Label htmlFor="adjustingNutLockSecure">Adjusting Nut/Lock Secure</Label>
            <Select
              value={data.adjustingNutLockSecure || ''}
              onValueChange={(value) => handleSelectChange('adjustingNutLockSecure', value)}
            >
              <SelectTrigger id="adjustingNutLockSecure">
                <SelectValue placeholder="Select" />
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
            <Label htmlFor="separateBrakeSeals">Separate Brake Seals</Label>
            <Select
              value={data.separateBrakeSeals || ''}
              onValueChange={(value) => handleSelectChange('separateBrakeSeals', value)}
            >
              <SelectTrigger id="separateBrakeSeals">
                <SelectValue placeholder="Select" />
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
        <h4 className="font-semibold text-sm">Hydraulic System</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hydClutchClearanceTotal">Hyd Clutch Clearance (Total)</Label>
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
            <Label htmlFor="hydClutchClearanceRear">Hyd Clutch Clearance (Rear)</Label>
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
            <Label htmlFor="hydraulicPressureValue">Hydraulic Pressure</Label>
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
            <Label htmlFor="accumulatorValue">Accumulator</Label>
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
            <Label htmlFor="flexDisc">Flex Disc</Label>
            <Select
              value={data.flexDisc || ''}
              onValueChange={(value) => handleSelectChange('flexDisc', value)}
            >
              <SelectTrigger id="flexDisc">
                <SelectValue placeholder="Select" />
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
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={data.notes ?? ''}
          onChange={(e) => updateFn('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          rows={4}
          placeholder="Add any additional notes..."
        />
      </div>
    </div>
  );
}
