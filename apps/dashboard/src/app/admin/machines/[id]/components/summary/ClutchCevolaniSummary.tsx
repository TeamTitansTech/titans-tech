'use client';

import { useTranslations } from 'next-intl';
import type { ClutchData, Attachment } from '@/data/types/services.types';
import { Typography } from '@/components/ui/typography';
import { translateEnumValue } from './utils/translateEnum';
import { SectionAttachments } from './SectionAttachments';
import { useUnitManager } from '@/contexts/UnitManagerContext';

interface ClutchCevolaniSummaryProps {
  data: ClutchData;
  attachments?: Attachment[];
}

// Fields that are length measurements and need unit conversion
const LENGTH_FIELDS = [
  'brakeClearing',
  'brakeClearanceTotal',
  'brakeClearanceRear',
  'gearBacklashBefore',
  'gearBacklashAfter',
  'crankEndplayBefore',
  'crankEndplayAfter',
  'airClutchTravel',
  'pneumaticClutchClearanceTotal',
];

export function ClutchCevolaniSummary({ data, attachments }: ClutchCevolaniSummaryProps) {
  const tServicesSummary = useTranslations('services.modal.summary');
  const tClutchFields = useTranslations('inspections.form.clutch.fields');
  const tClutchSections = useTranslations('inspections.form.clutch.sections');
  const tClutchCevolani = useTranslations('inspections.form.clutchCevolani');
  const tCommon = useTranslations('common.status');
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  // Guard against undefined data
  if (!data) {
    return (
      <div className="text-xs space-y-3">
        <div className="border-t pt-2">
          <Typography variant="muted" className="text-center py-4 text-xs">
            {tServicesSummary('noDataAvailable')}
          </Typography>
        </div>
      </div>
    );
  }

  // Helper function to translate field names
  const translateFieldName = (key: string): string => {
    const translation = tClutchFields(key);
    if (translation !== key) return translation;
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
  const displayValue = (value: unknown): string => {
    return translateEnumValue(value, tCommon);
  };

  // Helper function to display length value with unit conversion
  const displayLengthValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '-';
    const numValue = Number(value);
    if (isNaN(numValue)) return translateEnumValue(value, tCommon);
    const convertedValue = convertLengthFromDefault(numValue);
    return `${convertedValue.toFixed(4)} ${getLengthUnitLabel()}`;
  };

  // Helper to render a field group
  const renderFieldGroup = (
    title: string,
    fields: Array<{ key: string; label?: string; combine?: boolean }>,
  ) => {
    const formattedFields = fields.map((field) => {
      // Handle combined pressure fields
      if (field.combine && field.key.endsWith('Value')) {
        const baseKey = field.key.replace('Value', '');
        const value = data[field.key as keyof ClutchData];
        const unit = data[`${baseKey}Unit` as keyof ClutchData];
        const displayVal =
          value !== null && value !== undefined && value !== '' ? `${value} ${unit || 'PSI'}` : '-';
        return {
          key: field.key,
          label: field.label || translateFieldName(baseKey),
          value: displayVal,
        };
      }
      // Handle length fields with unit conversion
      if (LENGTH_FIELDS.includes(field.key)) {
        const value = data[field.key as keyof ClutchData];
        return {
          key: field.key,
          label: field.label || translateFieldName(field.key),
          value: displayLengthValue(value),
        };
      }
      // Handle regular fields
      const value = data[field.key as keyof ClutchData];
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

  const hasAnyData: boolean = Object.values(data).some(
    (val) => val !== null && val !== undefined && val !== '',
  );

  if (!hasAnyData) {
    return (
      <div className="border-t pt-2">
        <Typography variant="muted" className="text-center py-4 text-xs">
          {tServicesSummary('noDataAvailable')}
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

        {/* Pneumatic System - instead of Hydraulic System */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup(tClutchCevolani('sections.pneumaticSystem'), [
            {
              key: 'pneumaticClutchClearanceTotal',
              label: tClutchCevolani('fields.pneumaticClutchClearanceTotal'),
            },
          ])}
        </div>

        {/* Notes */}
        {!!data.notes && (
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

        <SectionAttachments attachments={attachments} />
      </div>
    </div>
  );
}
