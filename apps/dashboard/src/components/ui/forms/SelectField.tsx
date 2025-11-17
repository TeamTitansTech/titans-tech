'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface SelectFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
  type?: 'text' | 'email' | 'url';
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder,
  className,
  inputClassName,
  labelClassName,
  showLabel = true,
  type = 'text',
}: SelectFieldProps) {
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
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={cn(
          'text-xs',
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
