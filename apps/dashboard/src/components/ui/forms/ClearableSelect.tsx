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

export interface ClearableSelectOption {
  value: string;
  label: string;
}

export interface ClearableSelectProps {
  id: string;
  label?: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onClear: () => void;
  options: ClearableSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function ClearableSelect({
  id,
  label,
  value,
  onChange,
  onClear,
  options,
  placeholder = 'Select...',
  required = false,
  disabled = false,
  className,
  triggerClassName,
}: ClearableSelectProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={cn('mt-1', triggerClassName)}
          clearable
          hasValue={!!value}
          onClear={onClear}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
