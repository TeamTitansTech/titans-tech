'use client';

import { useTranslations } from 'next-intl';
import { Typography } from '@/components/ui/typography';

interface ClutchSummaryProps {
  data: any;
}

export function ClutchSummary({ data }: ClutchSummaryProps) {
  const tServicesSummary = useTranslations('services.modal.summary');
  const tClutchFields = useTranslations('inspections.form.clutch.fields');
  const tClutchSections = useTranslations('inspections.form.clutch.sections');
  const tCommon = useTranslations('common.status');

  // Helper function to translate field names
  const translateFieldName = (key: string): string => {
    const translation = tClutchFields(key);
    if (translation !== key) return translation;
    // Fallback to formatFieldName
    return formatFieldName(key);
  };

  // Helper function to format field names
  const formatFieldName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to display value with translations
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? tCommon('yes') : tCommon('no');
    }
    // Translate enum values
    const stringValue = String(value);
    if (stringValue === 'YES') return tCommon('yes');
    if (stringValue === 'NO') return tCommon('no');
    if (stringValue === 'DNC') return tCommon('dnc');
    if (stringValue === 'NA') return tCommon('na');
    if (stringValue === 'OK') return tCommon('ok');
    if (stringValue === 'DAMAGED') return tCommon('damaged');
    if (stringValue === 'LEAKING') return tCommon('leaking');
    if (stringValue === 'NOT_OPERATIONAL') return tCommon('not_operational');

    return stringValue;
  };

  // Helper to render a field group - shows all fields even if empty
  const renderFieldGroup = (
    title: string,
    fields: Array<{ key: string; label?: string; combine?: boolean }>,
  ) => {
    const formattedFields = fields.map((field) => {
      // Handle combined pressure fields
      if (field.combine && field.key.endsWith('Value')) {
        const baseKey = field.key.replace('Value', '');
        const value = data[field.key];
        const unit = data[`${baseKey}Unit`];
        const displayVal =
          value !== null && value !== undefined && value !== '' ? `${value} ${unit || 'PSI'}` : '-';
        return {
          key: field.key,
          label: field.label || translateFieldName(baseKey),
          value: displayVal,
        };
      }
      // Handle regular fields
      const value = data[field.key];
      return {
        key: field.key,
        label: field.label || translateFieldName(field.key),
        value: displayValue(value),
      };
    });

    return (
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold border-b">{title}</div>
        <div className="p-2 space-y-1.5 text-[11px]">
          {formattedFields.map((field) => (
            <div key={field.key} className="flex justify-between gap-2">
              <span className="text-muted-foreground">{field.label}:</span>
              <span className="font-medium text-right">{field.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hasAnyData = Object.values(data).some(
    (val) => val !== null && val !== undefined && val !== '',
  );

  if (!hasAnyData) {
    return (
      <div className="border-t pt-2">
        <Typography variant="muted" className="text-center py-4 text-xs">
          Nenhum dado disponível
        </Typography>
      </div>
    );
  }

  return (
    <div className="text-xs space-y-3">
      <div className="border-t pt-2">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup(tClutchSections('basicInformation'), [
            { key: 'clutchType' },
            { key: 'clutchLocation' },
          ])}
        </div>

        {/* Brake Spring Settings */}
        <div className="mb-3">
          {renderFieldGroup(tClutchSections('brakeSpringSettings'), [
            { key: 'brakeSpringBrake', label: tClutchFields('brakeSpringBrake') },
            { key: 'brakeSpringClutch', label: tClutchFields('brakeSpringClutch') },
            { key: 'brakeSpringFB', label: tClutchFields('brakeSpringFB') },
            { key: 'brakeSpringFTB', label: tClutchFields('brakeSpringFTB') },
            { key: 'brakeSpringRTB', label: tClutchFields('brakeSpringRTB') },
            { key: 'brakeSpringStudBolt', label: tClutchFields('brakeSpringStudBolt') },
          ])}
        </div>

        {/* Brake Measurements */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup(tClutchSections('brakeMeasurements'), [
            { key: 'brakeStoppingTime' },
            { key: 'brakeLining' },
            { key: 'brakeClearing' },
            { key: 'brakeClearanceTotal' },
            { key: 'brakeClearanceRear' },
          ])}

          {renderFieldGroup(tClutchSections('flywheel'), [
            { key: 'flywheelStoppingTime' },
            { key: 'flywheelBearings' },
            { key: 'flywheelBrake' },
          ])}
        </div>

        {/* Clutch & Seals */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup(tClutchSections('clutchSeals'), [
            { key: 'rotaryUnion' },
            { key: 'clutchEngagements' },
            { key: 'clutchLining' },
            { key: 'clutchSeals' },
            { key: 'separateBrakeSeals' },
            { key: 'flexDisc' },
          ])}

          {renderFieldGroup(tClutchSections('adjustments'), [
            { key: 'splinesDriveRingDisc' },
            { key: 'adjustingNutLockSecure' },
          ])}
        </div>

        {/* Measurements - Before/After */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup(tClutchSections('gearBacklash'), [
            { key: 'gearBacklashBefore', label: tClutchSections('before') },
            { key: 'gearBacklashAfter', label: tClutchSections('after') },
          ])}

          {renderFieldGroup(tClutchSections('crankEndplay'), [
            { key: 'crankEndplayBefore', label: tClutchSections('before') },
            { key: 'crankEndplayAfter', label: tClutchSections('after') },
          ])}
        </div>

        {/* Air System */}
        <div className="mb-3">
          {renderFieldGroup(tClutchSections('airSystem'), [
            { key: 'airRegulatorValue', combine: true },
            { key: 'airClutchTravel' },
            { key: 'airLineOilerSetting' },
          ])}
        </div>

        {/* Hydraulic System */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup(tClutchSections('hydraulicSystem'), [
            { key: 'hydClutchClearanceTotal' },
            { key: 'hydClutchClearanceRear' },
            { key: 'hydraulicPressureValue', combine: true },
            { key: 'accumulatorValue', combine: true },
          ])}
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="border-t pt-2 mt-3">
            <div className="font-semibold text-muted-foreground mb-2 text-xs">
              {tServicesSummary('notes')}
            </div>
            <div className="border rounded-md overflow-hidden">
              <div className="p-2 text-[11px]">
                <span className="font-medium">{displayValue(data.notes)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
