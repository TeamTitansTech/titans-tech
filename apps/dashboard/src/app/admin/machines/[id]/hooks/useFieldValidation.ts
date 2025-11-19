import { useCallback } from 'react';

export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

/**
 * Note: Using `Record<string, any>` here is intentional to allow interfaces with optional properties.
 * TypeScript's `Record<string, unknown>` doesn't support optional fields, which most data interfaces have.
 */
export type FieldValidationRules<T extends Record<string, any>> = Partial<
  Record<keyof T, ValidationRule<unknown>[]>
>;

/**
 * Hook for field-level validation
 * @template T - The type of data being validated
 * Note: Using `Record<string, any>` here is intentional to allow interfaces with optional properties.
 */
export function useFieldValidation<T extends Record<string, any>>(rules: FieldValidationRules<T>) {
  const validateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]): string => {
      const fieldRules = rules[field];
      if (!fieldRules) return '';

      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }

      return '';
    },
    [rules],
  );

  const validateAllFields = useCallback(
    (data: T): Partial<Record<keyof T, string>> => {
      const errors: Partial<Record<keyof T, string>> = {};

      for (const field in rules) {
        const error = validateField(field, data[field]);
        if (error) {
          errors[field] = error;
        }
      }

      return errors;
    },
    [rules, validateField],
  );

  const hasErrors = useCallback((errors: Partial<Record<keyof T, string>>): boolean => {
    return Object.values(errors).some((error) => error !== '');
  }, []);

  return {
    validateField,
    validateAllFields,
    hasErrors,
  };
}

// Common validation rules
export const commonValidationRules = {
  required: (message = 'This field is required'): ValidationRule<unknown> => ({
    validate: (value) => value !== undefined && value !== null && value !== '',
    message,
  }),

  numeric: (message = 'Must be a valid number'): ValidationRule<unknown> => ({
    validate: (value) => !isNaN(Number(value)),
    message,
  }),

  min: (minValue: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value >= minValue,
    message: message || `Must be at least ${minValue}`,
  }),

  max: (maxValue: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value <= maxValue,
    message: message || `Must be at most ${maxValue}`,
  }),

  range: (min: number, max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => value >= min && value <= max,
    message: message || `Must be between ${min} and ${max}`,
  }),

  minLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= length,
    message: message || `Must be at least ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length <= length,
    message: message || `Must be at most ${length} characters`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message,
  }),
};
