'use client';

import { useState, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnitManager, celsiusToFahrenheit } from '@/contexts/UnitManagerContext';
import { cn } from '@/lib/utils';

export interface TemperatureInputProps {
  id: string;
  label?: string;
  /** Value in the default unit (Celsius) */
  value: number | string;
  /** Callback receives value in the default unit (Celsius) */
  onChange: (value: number) => void;
  onBlur?: () => void;
  error?: string;
  min?: number;
  max?: number;
  step?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
  /** Number of decimal places to display */
  decimalPlaces?: number;
}

export function TemperatureInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  min = -273.15, // Absolute zero in Celsius
  max = 9999.99,
  step = '0.01',
  required = false,
  disabled = false,
  placeholder,
  className,
  inputClassName,
  labelClassName,
  showLabel = true,
  decimalPlaces = 2,
}: TemperatureInputProps) {
  const {
    convertTemperatureFromDefault,
    convertTemperatureToDefault,
    getTemperatureUnitLabel,
    temperatureUnit,
  } = useUnitManager();
  const inputRef = useRef<HTMLInputElement>(null);

  // Track if user is actively editing
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Convert the value from default (Celsius) to display unit
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

  // Compute display value from props when not editing
  const displayValue = useMemo(() => {
    const converted = convertTemperatureFromDefault(numericValue);
    return converted.toFixed(decimalPlaces);
  }, [numericValue, convertTemperatureFromDefault, decimalPlaces]);

  const handleFocus = () => {
    setIsEditing(true);
    setEditValue(displayValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Limit decimal places
    if (inputValue.includes('.')) {
      const [intPart, decPart] = inputValue.split('.');
      if (decPart && decPart.length > decimalPlaces) {
        inputValue = `${intPart}.${decPart.slice(0, decimalPlaces)}`;
      }
    }

    setEditValue(inputValue);

    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      // Convert back to default unit (Celsius) before calling onChange
      const defaultValue = convertTemperatureToDefault(numValue);
      onChange(defaultValue);
    } else if (inputValue === '' || inputValue === '-') {
      onChange(0);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onBlur?.();
  };

  // Adjust min/max based on current unit
  const displayMin = temperatureUnit === 'C' ? min : celsiusToFahrenheit(min);
  const displayMax = temperatureUnit === 'C' ? max : celsiusToFahrenheit(max);

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && label && (
        <Label
          htmlFor={id}
          className={cn('text-xs font-medium', labelClassName, {
            'text-destructive': error,
          })}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="number"
          step={step}
          min={displayMin}
          max={displayMax}
          value={isEditing ? editValue : displayValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={cn(
            'text-xs h-9 pr-10',
            {
              'border-destructive focus-visible:ring-destructive': error,
            },
            inputClassName,
          )}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {getTemperatureUnitLabel()}
        </span>
      </div>
      {error && <p className="text-[10px] text-destructive mt-0.5">{error}</p>}
    </div>
  );
}
