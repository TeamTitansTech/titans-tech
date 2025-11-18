'use client';

import { useTranslations } from 'next-intl';
import { Typography } from '@/components/ui/typography';

interface ClutchSummaryProps {
  data: any;
}

export function ClutchSummary({ data }: ClutchSummaryProps) {
  const tServicesSummary = useTranslations('services.modal.summary');

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

  // Helper function to display value or "-" for empty
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  // Helper to render a field group
  const renderFieldGroup = (
    title: string,
    fields: Array<{ key: string; label?: string; combine?: boolean }>,
  ) => {
    const visibleFields = fields
      .map((field) => {
        // Handle combined pressure fields
        if (field.combine && field.key.endsWith('Value')) {
          const baseKey = field.key.replace('Value', '');
          const value = data[field.key];
          const unit = data[`${baseKey}Unit`];
          if (value !== null && value !== undefined && value !== '') {
            return {
              key: field.key,
              label: field.label || formatFieldName(baseKey),
              value: `${value} ${unit || 'PSI'}`,
            };
          }
          return null;
        }
        // Handle regular fields
        const value = data[field.key];
        if (value !== null && value !== undefined && value !== '') {
          return {
            key: field.key,
            label: field.label || formatFieldName(field.key),
            value: displayValue(value),
          };
        }
        return null;
      })
      .filter(Boolean);

    if (visibleFields.length === 0) return null;

    return (
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted/50 px-2 py-1 text-[10px] font-semibold border-b">{title}</div>
        <div className="p-2 space-y-1.5 text-[11px]">
          {visibleFields.map((field) => (
            <div key={field!.key} className="flex justify-between gap-2">
              <span className="text-muted-foreground">{field!.label}:</span>
              <span className="font-medium text-right">{field!.value}</span>
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
          {renderFieldGroup('Basic Information', [
            { key: 'clutchType' },
            { key: 'clutchLocation' },
          ])}
        </div>

        {/* Brake Spring Settings */}
        <div className="mb-3">
          {renderFieldGroup('Brake Spring Settings (inches)', [
            { key: 'brakeSpringBrake', label: 'Brake' },
            { key: 'brakeSpringClutch', label: 'Clutch' },
            { key: 'brakeSpringFB', label: 'FB' },
            { key: 'brakeSpringFTB', label: 'FTB' },
            { key: 'brakeSpringRTB', label: 'RTB' },
            { key: 'brakeSpringStudBolt', label: 'Stud Bolt' },
          ])}
        </div>

        {/* Brake Measurements */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup('Brake Measurements', [
            { key: 'brakeStoppingTime' },
            { key: 'brakeLining' },
            { key: 'brakeClearing' },
            { key: 'brakeClearanceTotal' },
            { key: 'brakeClearanceRear' },
          ])}

          {renderFieldGroup('Flywheel', [
            { key: 'flywheelStoppingTime' },
            { key: 'flywheelBearings' },
            { key: 'flywheelBrake' },
          ])}
        </div>

        {/* Clutch & Seals */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup('Clutch & Seals', [
            { key: 'rotaryUnion' },
            { key: 'clutchEngagements' },
            { key: 'clutchLining' },
            { key: 'clutchSeals' },
            { key: 'separateBrakeSeals' },
            { key: 'flexDisc' },
          ])}

          {renderFieldGroup('Adjustments', [
            { key: 'splinesDriveRingDisc' },
            { key: 'adjustingNutLockSecure' },
          ])}
        </div>

        {/* Measurements - Before/After */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup('Gear Backlash', [
            { key: 'gearBacklashBefore', label: 'Before' },
            { key: 'gearBacklashAfter', label: 'After' },
          ])}

          {renderFieldGroup('Crank Endplay', [
            { key: 'crankEndplayBefore', label: 'Before' },
            { key: 'crankEndplayAfter', label: 'After' },
          ])}
        </div>

        {/* Air System */}
        <div className="mb-3">
          {renderFieldGroup('Air System', [
            { key: 'airRegulatorValue', combine: true },
            { key: 'airClutchTravel' },
            { key: 'airLineOilerSetting' },
          ])}
        </div>

        {/* Hydraulic System */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {renderFieldGroup('Hydraulic System', [
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
