'use client';

import { Input } from '@/components/ui/input';

interface MeasurementInputProps<T extends string> {
  field: T;
  value: number;
  onChange: (field: T, value: number) => void;
  onBlur: (field: T) => void;
  error?: string;
  readOnly?: boolean;
  step?: string;
  min?: string;
  max?: string;
  className?: string;
}

export function MeasurementInput<T extends string>({
  field,
  value,
  onChange,
  onBlur,
  error,
  readOnly = false,
  step = '0.0001',
  min = '0',
  max = '999999.9999',
  className = 'w-20 h-8 text-sm px-2 py-1',
}: MeasurementInputProps<T>) {
  if (readOnly) {
    return (
      <div
        className={`${className} border rounded-md bg-muted/50 flex items-center justify-center font-medium`}
      >
        {value}
      </div>
    );
  }

  return (
    <Input
      id={`${field}`}
      type="number"
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(field, Number(e.target.value))}
      onBlur={() => onBlur(field)}
      className={`${className} ${error ? 'border-destructive' : ''}`}
      required
    />
  );
}
