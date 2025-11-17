'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface NumericInputProps {
  id: string;
  label?: string;
  value: number | string;
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
}

export function NumericInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  min = 0,
  max = 999999.9999,
  step = '0.0001',
  required = false,
  disabled = false,
  placeholder,
  className,
  inputClassName,
  labelClassName,
  showLabel = true,
}: NumericInputProps) {
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
      <Input
        id={id}
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={cn(
          'text-xs h-9',
          {
            'border-destructive focus-visible:ring-destructive': error,
          },
          inputClassName,
        )}
      />
      {error && <p className="text-[10px] text-destructive mt-0.5">{error}</p>}
    </div>
  );
}
