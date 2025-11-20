import { useState, useCallback } from 'react';

/**
 * Generic hook for managing section state with update and validation
 * @template T - The type of data being managed
 */
export function useSectionState<T extends Record<string, unknown>>(initialData: T) {
  // Store initial loaded data for "touched" detection
  const [initialSectionData] = useState<T>(initialData);

  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isTouched, setIsTouched] = useState(false);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setIsTouched(true);
  }, []);

  const updateMultipleFields = useCallback((updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }));
    setIsTouched(true);
  }, []);

  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsTouched(false);
  }, [initialData]);

  return {
    initialSectionData,
    data,
    setData,
    errors,
    setErrors,
    isTouched,
    setIsTouched,
    updateField,
    updateMultipleFields,
    setFieldError,
    clearErrors,
    reset,
  };
}
