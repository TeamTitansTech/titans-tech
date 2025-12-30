'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface EnumOption {
  value: string;
  label: string;
}

export interface EnumSelectProps {
  id: string;
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onClear?: () => void;
  options: EnumOption[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
  clearable?: boolean;
}

export function EnumSelect({
  id,
  label,
  value,
  onChange,
  onClear,
  options,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className,
  triggerClassName,
  labelClassName,
  showLabel = true,
  clearable = false,
}: EnumSelectProps) {
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
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={cn(
            'text-xs',
            {
              'border-destructive focus:ring-destructive': error,
            },
            triggerClassName,
          )}
          clearable={clearable}
          hasValue={!!value}
          onClear={onClear}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-[10px] text-destructive mt-0.5">{error}</p>}
    </div>
  );
}
