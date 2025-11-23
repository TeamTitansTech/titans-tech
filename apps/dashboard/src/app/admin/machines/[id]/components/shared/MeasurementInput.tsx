'use client';

import { Input } from '@/components/ui/input';
import { useNumericInput } from '@/hooks/useNumericInput';

// TODO - Transformar em componente genérico de Input numérico
interface MeasurementInputProps<T extends string> {
  field: T;
  value: number | undefined;
  onChange: (field: T, value: number | undefined) => void;
  onBlur: (field: T) => void;
  error?: string;
  readOnly?: boolean;
  step?: string;
  min?: string;
  max?: string;
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
  step = '0.0001',
  min = '0',
  max = '999999.9999',
  className = 'w-20 h-8 text-sm px-2 py-1',
  required = true,
}: MeasurementInputProps<T>) {
  const [displayValue, handleChange, handleBlur] = useNumericInput(
    value,
    (val) => onChange(field, val),
    {
      maxDecimals: 4,
      min: parseFloat(min),
      max: parseFloat(max),
      required,
    },
  );

  if (readOnly) {
    return (
      <div
        className={`${className} border rounded-md bg-muted/50 flex items-center justify-center font-medium`}
      >
        {value !== undefined ? value : ''}
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
      value={displayValue}
      onChange={handleChange}
      onBlur={() => {
        handleBlur();
        onBlur(field);
      }}
      className={`${className} ${error ? 'border-destructive' : ''}`}
      required={required}
    />
  );
}
