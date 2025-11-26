import { useState, useCallback } from 'react';

/**
 * Hook for managing outer/inner + before/after state pattern
 * Handles the complex 4-way state pattern (outerBefore, outerAfter, innerBefore, innerAfter)
 * @template T - The type of data for each section
 * Note: Using `Record<string, any>` here is intentional to allow interfaces with optional properties.
 * TypeScript's `Record<string, unknown>` doesn't support optional fields, which most data interfaces have.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useOuterInnerState<T extends Record<string, any>>(
  initialData: T,
  loadedData?: {
    outerBefore?: T;
    outerAfter?: T;
    outerData?: T; // API uses outerData instead of outerAfter
    innerBefore?: T;
    innerAfter?: T;
    innerData?: T; // API uses innerData instead of innerAfter
  },
) {
  // Store initial loaded data for "touched" detection (compare against this, not default)
  const [initialOuterBeforeData] = useState<T>(loadedData?.outerBefore || initialData);
  const [initialOuterAfterData] = useState<T>(
    loadedData?.outerAfter || loadedData?.outerData || initialData,
  );
  const [initialInnerBeforeData] = useState<T>(loadedData?.innerBefore || initialData);
  const [initialInnerAfterData] = useState<T>(
    loadedData?.innerAfter || loadedData?.innerData || initialData,
  );

  // Use loaded data if available, otherwise use initial data
  const [outerBeforeData, setOuterBeforeData] = useState<T>(loadedData?.outerBefore || initialData);
  const [outerAfterData, setOuterAfterData] = useState<T>(
    loadedData?.outerAfter || loadedData?.outerData || initialData,
  );
  const [innerBeforeData, setInnerBeforeData] = useState<T>(loadedData?.innerBefore || initialData);
  const [innerAfterData, setInnerAfterData] = useState<T>(
    loadedData?.innerAfter || loadedData?.innerData || initialData,
  );

  const [outerBeforeErrors, setOuterBeforeErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [outerAfterErrors, setOuterAfterErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [innerBeforeErrors, setInnerBeforeErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [innerAfterErrors, setInnerAfterErrors] = useState<Partial<Record<keyof T, string>>>({});

  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(
    !!(loadedData?.outerBefore || loadedData?.innerBefore),
  );

  // Note: State is initialized from loadedData on mount. If loadedData needs to update
  // after initial mount, the parent component should use a key prop to force remount.

  // Outer Before update functions
  const updateOuterBeforeField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setOuterBeforeData((prev) => ({ ...prev, [field]: value }));
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  // Outer After update functions
  const updateOuterAfterField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setOuterAfterData((prev) => ({ ...prev, [field]: value }));
    setOuterAfterErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  // Inner Before update functions
  const updateInnerBeforeField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setInnerBeforeData((prev) => ({ ...prev, [field]: value }));
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  // Inner After update functions
  const updateInnerAfterField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setInnerAfterData((prev) => ({ ...prev, [field]: value }));
    setInnerAfterErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  // Error setters
  const setOuterBeforeFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setOuterAfterFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setOuterAfterErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setInnerBeforeFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setInnerAfterFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setInnerAfterErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setOuterBeforeData(initialData);
    setOuterAfterData(initialData);
    setInnerBeforeData(initialData);
    setInnerAfterData(initialData);
    setOuterBeforeErrors({});
    setOuterAfterErrors({});
    setInnerBeforeErrors({});
    setInnerAfterErrors({});
    setIncludeBeforeMeasurements(false);
  }, [initialData]);

  return {
    // Initial loaded data (for touched detection)
    initialOuterBeforeData,
    initialOuterAfterData,
    initialInnerBeforeData,
    initialInnerAfterData,

    // Data states
    outerBeforeData,
    setOuterBeforeData,
    outerAfterData,
    setOuterAfterData,
    innerBeforeData,
    setInnerBeforeData,
    innerAfterData,
    setInnerAfterData,

    // Error states
    outerBeforeErrors,
    setOuterBeforeErrors,
    outerAfterErrors,
    setOuterAfterErrors,
    innerBeforeErrors,
    setInnerBeforeErrors,
    innerAfterErrors,
    setInnerAfterErrors,

    // Include before measurements flag
    includeBeforeMeasurements,
    setIncludeBeforeMeasurements,

    // Update functions
    updateOuterBeforeField,
    updateOuterAfterField,
    updateInnerBeforeField,
    updateInnerAfterField,

    // Error setters
    setOuterBeforeFieldError,
    setOuterAfterFieldError,
    setInnerBeforeFieldError,
    setInnerAfterFieldError,

    // Reset
    reset,
  };
}
