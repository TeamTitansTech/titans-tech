'use client';

import { LengthInput } from '@/components/ui/forms/LengthInput';
import { useUnitManager } from '@/contexts/UnitManagerContext';

interface MeasurementInputProps<T extends string> {
  field: T;
  value: number | undefined;
  onChange: (field: T, value: number | undefined) => void;
  onBlur: (field: T) => void;
  error?: string;
  readOnly?: boolean;
  className?: string;
  required?: boolean;
}

export function MeasurementInput<T extends string>({
  field,
  value,
  onChange,
  onBlur,
  error,
  readOnly = false,
  className = 'w-21 h-8 text-sm px-2 py-1',
  required = true,
}: MeasurementInputProps<T>) {
  const { convertLengthFromDefault, getLengthUnitLabel } = useUnitManager();

  if (readOnly) {
    const displayValue =
      value !== undefined && value !== null ? convertLengthFromDefault(value).toFixed(4) : '';
    return (
      <div
        className={`${className} border rounded-md bg-muted/50 flex items-center justify-center font-medium`}
      >
        {displayValue}{' '}
        {displayValue !== '' && (
          <span className="ml-1 text-xs text-muted-foreground">{getLengthUnitLabel()}</span>
        )}
      </div>
    );
  }

  return (
    <LengthInput
      id={`${field}`}
      value={value !== undefined && value !== null ? value : ''}
      onChange={(val) => onChange(field, val)}
      onBlur={() => onBlur(field)}
      error={error}
      required={required}
      showLabel={false}
      inputClassName={className}
    />
  );
}
