'use client';

import { useState, type ChangeEvent } from 'react';

/**
 * Options for configuring numeric input behavior
 */
export interface NumericInputOptions {
  /**
   * Maximum number of decimal places allowed
   * @default 4
   */
  maxDecimals?: number;

  /**
   * Whether negative values are allowed
   * @default true
   */
  allowNegative?: boolean;

  /**
   * Minimum value allowed
   * @default undefined
   */
  min?: number;

  /**
   * Maximum value allowed
   * @default 999999.9999
   */
  max?: number;

  /**
   * Whether the field is required (if false, allows undefined on empty)
   * @default false
   */
  required?: boolean;
}

/**
 * Hook for handling numeric inputs with proper empty state management and validation
 *
 * This hook solves the common problem of `Number(e.target.value) || 0` which prevents
 * users from clearing the input field. Instead, it uses local state to allow temporary
 * values like "-", ".", etc., and only converts to number on blur.
 *
 * Features:
 * - Allows users to clear the field (returns undefined if not required)
 * - Validates decimal places while typing
 * - Supports negative values
 * - Min/max validation
 * - Syncs with external prop changes
 *
 * @param initialValue - The initial numeric value (can be undefined)
 * @param onChange - Callback when value changes (receives number | undefined)
 * @param options - Optional configuration
 * @returns [displayValue, handleChange, handleBlur] - Value and handlers for input
 *
 * @example
 * ```tsx
 * const [value, handleChange, handleBlur] = useNumericInput(
 *   data.position1,
 *   (val) => updateFn('position1', val),
 *   { maxDecimals: 4, allowNegative: true }
 * );
 *
 * <Input
 *   type="number"
 *   step="0.0001"
 *   value={value}
 *   onChange={handleChange}
 *   onBlur={handleBlur}
 * />
 * ```
 */
export function useNumericInput(
  initialValue: number | undefined,
  onChange: (value: number | undefined) => void,
  options: NumericInputOptions = {},
): [
  string, // displayValue - for input value prop
  (e: ChangeEvent<HTMLInputElement>) => void, // handleChange
  () => void, // handleBlur
] {
  const {
    maxDecimals = 4,
    allowNegative = true,
    min,
    max = 999999.9999,
    required = false,
  } = options;

  // Local state for display value (string to allow typing "-", ".", etc.)
  // We use a function initializer to avoid recreating the initial value on every render
  const [displayValue, setDisplayValue] = useState<string>(() =>
    initialValue !== undefined ? initialValue.toString() : '',
  );

  // Track the previous initialValue to detect external changes
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);

  // Validate that value has at most maxDecimals decimal places
  const hasValidDecimals = (value: string): boolean => {
    const parts = value.split('.');
    if (parts.length <= 1) return true; // No decimals or just integer part
    return parts[1].length <= maxDecimals;
  };

  // Validate that value is within min/max bounds (if specified)
  const isWithinBounds = (numValue: number): boolean => {
    if (min !== undefined && numValue < min) return false;
    if (max !== undefined && numValue > max) return false;
    return true;
  };

  // Handle input change - allows any input with validation
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow empty string
    if (newValue === '') {
      setDisplayValue('');
      return;
    }

    // Allow typing minus sign at the beginning
    if (allowNegative && newValue === '-') {
      setDisplayValue('-');
      return;
    }

    // Validate decimal places
    if (!hasValidDecimals(newValue)) {
      return; // Don't update if exceeds max decimals
    }

    // Allow the update (validation happens on blur)
    setDisplayValue(newValue);
  };

  // Handle blur - converts to number and validates
  const handleBlur = () => {
    // Empty field
    if (displayValue === '' || displayValue === '-') {
      if (required) {
        // Reset to 0 or initial value if required
        const fallback = initialValue !== undefined ? initialValue : 0;
        setDisplayValue(fallback.toString());
        onChange(fallback);
      } else {
        // Allow undefined for optional fields
        setDisplayValue('');
        onChange(undefined);
      }
      return;
    }

    // Try to parse the number
    const numValue = parseFloat(displayValue);

    if (!isNaN(numValue)) {
      // Check bounds
      if (!isWithinBounds(numValue)) {
        // Reset to nearest bound or initial value
        let boundedValue = numValue;
        if (min !== undefined && numValue < min) boundedValue = min;
        if (max !== undefined && numValue > max) boundedValue = max;

        setDisplayValue(boundedValue.toString());
        onChange(boundedValue);
        return;
      }

      // Valid number - update with proper formatting
      setDisplayValue(numValue.toString());
      onChange(numValue);
    } else {
      // Invalid number - reset to initial value or 0
      const fallback = initialValue !== undefined ? initialValue : required ? 0 : undefined;
      setDisplayValue(fallback !== undefined ? fallback.toString() : '');
      onChange(fallback);
    }
  };

  // Sync with external prop changes (during render, not in effect)
  // This is the recommended React pattern to avoid cascading renders
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setDisplayValue(initialValue !== undefined ? initialValue.toString() : '');
  }

  return [displayValue, handleChange, handleBlur];
}
