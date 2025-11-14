import { useState, useCallback } from 'react';

/**
 * Hook for managing before/after maintenance state pattern
 * @template T - The type of data for each time period
 */
export function useBeforeAfterState<T extends Record<string, any>>(
  initialBeforeData: T,
  initialAfterData: T,
) {
  const [beforeData, setBeforeData] = useState<T>(initialBeforeData);
  const [afterData, setAfterData] = useState<T>(initialAfterData);
  const [beforeErrors, setBeforeErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [afterErrors, setAfterErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(false);

  const updateBeforeField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setBeforeData((prev) => ({ ...prev, [field]: value }));
    setBeforeErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const updateAfterField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setAfterData((prev) => ({ ...prev, [field]: value }));
    setAfterErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const setBeforeFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setBeforeErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setAfterFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setAfterErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setBeforeData(initialBeforeData);
    setAfterData(initialAfterData);
    setBeforeErrors({});
    setAfterErrors({});
    setIncludeBeforeMeasurements(false);
  }, [initialBeforeData, initialAfterData]);

  return {
    beforeData,
    setBeforeData,
    afterData,
    setAfterData,
    beforeErrors,
    setBeforeErrors,
    afterErrors,
    setAfterErrors,
    includeBeforeMeasurements,
    setIncludeBeforeMeasurements,
    updateBeforeField,
    updateAfterField,
    setBeforeFieldError,
    setAfterFieldError,
    reset,
  };
}
