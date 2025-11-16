import { useState } from 'react';
import { type GibsData, YesNoDncType } from '@/data/types/services.types';
import { defaultGibsData } from '../components/sections/GibsSection';

export interface GibsSectionData {
  outerBefore?: GibsData;
  outerAfter?: GibsData;
  innerBefore?: GibsData;
  innerAfter?: GibsData;
  hasBeenAdjusted?: YesNoDncType;
  notes?: string;
}

interface UseGibsStateProps {
  initialData?: GibsSectionData;
}

export function useGibsState({ initialData }: UseGibsStateProps = {}) {
  // Include before measurements checkbox
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(
    !!(initialData?.outerBefore || initialData?.innerBefore),
  );

  // Gibs data states
  const [outerBeforeData, setOuterBeforeData] = useState<GibsData>(
    initialData?.outerBefore || defaultGibsData,
  );
  const [outerAfterData, setOuterAfterData] = useState<GibsData>(
    initialData?.outerAfter || defaultGibsData,
  );
  const [innerBeforeData, setInnerBeforeData] = useState<GibsData>(
    initialData?.innerBefore || defaultGibsData,
  );
  const [innerAfterData, setInnerAfterData] = useState<GibsData>(
    initialData?.innerAfter || defaultGibsData,
  );

  // Global states
  const [hasBeenAdjusted, setHasBeenAdjusted] = useState<YesNoDncType | undefined>(
    initialData?.hasBeenAdjusted,
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Error states
  const [outerBeforeErrors, setOuterBeforeErrors] = useState<
    Partial<Record<keyof GibsData, string>>
  >({});
  const [outerAfterErrors, setOuterAfterErrors] = useState<Partial<Record<keyof GibsData, string>>>(
    {},
  );
  const [innerBeforeErrors, setInnerBeforeErrors] = useState<
    Partial<Record<keyof GibsData, string>>
  >({});
  const [innerAfterErrors, setInnerAfterErrors] = useState<Partial<Record<keyof GibsData, string>>>(
    {},
  );

  // Field update functions
  const updateOuterBeforeField = (field: keyof GibsData, value: string | number | undefined) => {
    setOuterBeforeData((prev) => ({ ...prev, [field]: value }));
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateOuterAfterField = (field: keyof GibsData, value: string | number | undefined) => {
    setOuterAfterData((prev) => ({ ...prev, [field]: value }));
    setOuterAfterErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateInnerBeforeField = (field: keyof GibsData, value: string | number | undefined) => {
    setInnerBeforeData((prev) => ({ ...prev, [field]: value }));
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateInnerAfterField = (field: keyof GibsData, value: string | number | undefined) => {
    setInnerAfterData((prev) => ({ ...prev, [field]: value }));
    setInnerAfterErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Error setters
  const setOuterBeforeFieldError = (field: keyof GibsData, error: string) => {
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const setOuterAfterFieldError = (field: keyof GibsData, error: string) => {
    setOuterAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  const setInnerBeforeFieldError = (field: keyof GibsData, error: string) => {
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const setInnerAfterFieldError = (field: keyof GibsData, error: string) => {
    setInnerAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Reset function
  const reset = () => {
    setIncludeBeforeMeasurements(false);
    setOuterBeforeData(defaultGibsData);
    setOuterAfterData(defaultGibsData);
    setInnerBeforeData(defaultGibsData);
    setInnerAfterData(defaultGibsData);
    setHasBeenAdjusted(undefined);
    setNotes('');
    setOuterBeforeErrors({});
    setOuterAfterErrors({});
    setInnerBeforeErrors({});
    setInnerAfterErrors({});
  };

  return {
    // Include before measurements
    includeBeforeMeasurements,
    setIncludeBeforeMeasurements,

    // Gibs data
    outerBeforeData,
    setOuterBeforeData,
    outerAfterData,
    setOuterAfterData,
    innerBeforeData,
    setInnerBeforeData,
    innerAfterData,
    setInnerAfterData,

    // Global states
    hasBeenAdjusted,
    setHasBeenAdjusted,
    notes,
    setNotes,

    // Errors
    outerBeforeErrors,
    outerAfterErrors,
    innerBeforeErrors,
    innerAfterErrors,

    // Field update functions
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
