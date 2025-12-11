'use client';

import { useState, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUnitManager } from '@/contexts/UnitManagerContext';
import { cn } from '@/lib/utils';

export interface PressureInputProps {
  id: string;
  label?: string;
  /** Value in the default unit (atm). Undefined displays as empty. */
  value: number | string | undefined;
  /** Callback receives value in the default unit (atm). Undefined when cleared. */
  onChange: (value: number | undefined) => void;
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

export function PressureInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  min = 0,
  max = 9999.9999,
  step = '0.0001',
  required = false,
  disabled = false,
  placeholder,
  className,
  inputClassName,
  labelClassName,
  showLabel = true,
  decimalPlaces = 4,
}: PressureInputProps) {
  const { convertPressureFromDefault, convertPressureToDefault, getPressureUnitLabel } =
    useUnitManager();
  const inputRef = useRef<HTMLInputElement>(null);

  // Track if user is actively editing
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Convert the value from default (atm) to display unit
  // Handle undefined/null as empty (not 0)
  const numericValue = useMemo(() => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    }
    return value;
  }, [value]);

  // Compute display value from props when not editing
  const displayValue = useMemo(() => {
    if (numericValue === undefined) return '';
    const converted = convertPressureFromDefault(numericValue);
    return converted !== null && converted !== undefined ? converted.toFixed(decimalPlaces) : '';
  }, [numericValue, convertPressureFromDefault, decimalPlaces]);

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
      // Convert back to default unit (atm) before calling onChange
      const defaultValue = convertPressureToDefault(numValue);
      onChange(defaultValue);
    } else if (inputValue === '' || inputValue === '-') {
      // Return undefined when field is cleared (not 0)
      onChange(undefined);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onBlur?.();
  };

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
          min={min}
          max={max}
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
          {getPressureUnitLabel()}
        </span>
      </div>
      {error && <p className="text-[10px] text-destructive mt-0.5">{error}</p>}
    </div>
  );
}
