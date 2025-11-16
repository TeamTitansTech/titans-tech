import { useState, useCallback } from 'react';

/**
 * Hook for managing before/after maintenance state pattern
 * @template T - The type of data for each time period
 */
export function useBeforeAfterState<T extends Record<string, any>>(
  initialBeforeData: T,
  initialAfterData: T,
  loadedBeforeData?: T,
  loadedAfterData?: T,
) {
  const [beforeData, setBeforeData] = useState<T>(loadedBeforeData || initialBeforeData);
  const [afterData, setAfterData] = useState<T>(loadedAfterData || initialAfterData);
  const [beforeErrors, setBeforeErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [afterErrors, setAfterErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(!!loadedBeforeData);

  // Note: State is initialized from loadedData on mount. If loadedData needs to update
  // after initial mount, the parent component should use a key prop to force remount.

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
