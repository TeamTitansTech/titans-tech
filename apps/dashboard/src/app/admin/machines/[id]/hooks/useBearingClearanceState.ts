import { useState } from 'react';
import {
  type BearingClearanceData,
  MatingPartType,
  YesNoNaDncType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
} from '@/data/types/services.types';
import { defaultBearingData } from '../components/sections/BearingClearanceSection';
import { desanitizeBearingDataForDisplay } from '../components/sections/bearingClearanceUtils';

export interface BearingClearanceSectionData {
  outerBefore?: BearingClearanceData;
  outerAfter?: BearingClearanceData;
  innerBefore?: BearingClearanceData;
  innerAfter?: BearingClearanceData;
  // API uses different field names
  outerData?: BearingClearanceData;
  innerData?: BearingClearanceData;
}

interface UseBearingClearanceStateProps {
  initialData?: BearingClearanceSectionData;
}

export function useBearingClearanceState({ initialData }: UseBearingClearanceStateProps = {}) {
  // Handle field name mapping: API uses outerData/innerData, component uses outerAfter/innerAfter
  // Desanitize data from database (convert 0 back to undefined for empty fields)
  const outerAfterInitial = desanitizeBearingDataForDisplay(
    initialData?.outerData || initialData?.outerAfter,
  );
  const innerAfterInitial = desanitizeBearingDataForDisplay(
    initialData?.innerData || initialData?.innerAfter,
  );
  const outerBeforeInitial = desanitizeBearingDataForDisplay(initialData?.outerBefore);
  const innerBeforeInitial = desanitizeBearingDataForDisplay(initialData?.innerBefore);

  // Store initial loaded data for "touched" detection (compare against this, not default)
  const [initialOuterBeforeData] = useState<BearingClearanceData>(
    outerBeforeInitial || defaultBearingData,
  );
  const [initialOuterAfterData] = useState<BearingClearanceData>(
    outerAfterInitial || defaultBearingData,
  );
  const [initialInnerBeforeData] = useState<BearingClearanceData>(
    innerBeforeInitial || defaultBearingData,
  );
  const [initialInnerAfterData] = useState<BearingClearanceData>(
    innerAfterInitial || defaultBearingData,
  );

  // Include before measurements checkbox
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(
    !!(outerBeforeInitial || innerBeforeInitial),
  );

  // Bearing data states
  const [outerBeforeData, setOuterBeforeData] = useState<BearingClearanceData>(
    outerBeforeInitial || defaultBearingData,
  );
  const [outerAfterData, setOuterAfterData] = useState<BearingClearanceData>(
    outerAfterInitial || defaultBearingData,
  );
  const [innerBeforeData, setInnerBeforeData] = useState<BearingClearanceData>(
    innerBeforeInitial || defaultBearingData,
  );
  const [innerAfterData, setInnerAfterData] = useState<BearingClearanceData>(
    innerAfterInitial || defaultBearingData,
  );

  // Separate states for each tab and time period
  const [outerBeforeHasBeenAdjusted, setOuterBeforeHasBeenAdjusted] = useState<
    YesNoNaDncType | undefined
  >(outerBeforeInitial?.hasBeenAdjusted);
  const [outerAfterHasBeenAdjusted, setOuterAfterHasBeenAdjusted] = useState<
    YesNoNaDncType | undefined
  >(outerAfterInitial?.hasBeenAdjusted);
  const [innerBeforeHasBeenAdjusted, setInnerBeforeHasBeenAdjusted] = useState<
    YesNoNaDncType | undefined
  >(innerBeforeInitial?.hasBeenAdjusted);
  const [innerAfterHasBeenAdjusted, setInnerAfterHasBeenAdjusted] = useState<
    YesNoNaDncType | undefined
  >(innerAfterInitial?.hasBeenAdjusted);

  // Tab-specific fields (separate for Outer and Inner)
  const [outerCombinedWith, setOuterCombinedWith] = useState(
    (outerAfterInitial || outerBeforeInitial)?.combinedWith || '',
  );
  const [outerMatingPart, setOuterMatingPart] = useState<MatingPartType | undefined>(
    (outerAfterInitial || outerBeforeInitial)?.matingPart,
  );
  const [innerCombinedWith, setInnerCombinedWith] = useState(
    (innerAfterInitial || innerBeforeInitial)?.combinedWith || '',
  );
  const [innerMatingPart, setInnerMatingPart] = useState<MatingPartType | undefined>(
    (innerAfterInitial || innerBeforeInitial)?.matingPart,
  );

  // Shared fields (Shutdown Adjustment Mechanism)
  const [slideMotorMounts, setSlideMotorMounts] = useState<
    ConditionOkNaDncBrokenWornType | undefined
  >(outerAfterInitial?.slideMotorMounts || outerBeforeInitial?.slideMotorMounts || undefined);
  const [powerCordHoses, setPowerCordHoses] = useState<ConditionOkNaDncDamagedType | undefined>(
    outerAfterInitial?.powerCordHoses || outerBeforeInitial?.powerCordHoses || undefined,
  );
  const [chainsGearsSprockets, setChainsGearsSprockets] = useState<
    ConditionOkNaDncBrokenLooseType | undefined
  >(
    outerAfterInitial?.chainsGearsSprockets ||
      outerBeforeInitial?.chainsGearsSprockets ||
      undefined,
  );
  const [lockingClamps, setLockingClamps] = useState<ConditionOkNaDncDamagedType | undefined>(
    outerAfterInitial?.lockingClamps || outerBeforeInitial?.lockingClamps || undefined,
  );
  const [notes, setNotes] = useState(outerAfterInitial?.notes || outerBeforeInitial?.notes || '');

  // Error states
  const [outerBeforeErrors, setOuterBeforeErrors] = useState<
    Partial<Record<keyof BearingClearanceData, string>>
  >({});
  const [outerAfterErrors, setOuterAfterErrors] = useState<
    Partial<Record<keyof BearingClearanceData, string>>
  >({});
  const [innerBeforeErrors, setInnerBeforeErrors] = useState<
    Partial<Record<keyof BearingClearanceData, string>>
  >({});
  const [innerAfterErrors, setInnerAfterErrors] = useState<
    Partial<Record<keyof BearingClearanceData, string>>
  >({});

  // Field update functions
  const updateOuterBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterBeforeData((prev) => ({ ...prev, [field]: value }));
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateOuterAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setOuterAfterData((prev) => ({ ...prev, [field]: value }));
    setOuterAfterErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateInnerBeforeField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerBeforeData((prev) => ({ ...prev, [field]: value }));
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateInnerAfterField = (
    field: keyof BearingClearanceData,
    value: string | number | boolean,
  ) => {
    setInnerAfterData((prev) => ({ ...prev, [field]: value }));
    setInnerAfterErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Blur handlers
  const setOuterBeforeFieldError = (field: keyof BearingClearanceData, error: string) => {
    setOuterBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const setOuterAfterFieldError = (field: keyof BearingClearanceData, error: string) => {
    setOuterAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  const setInnerBeforeFieldError = (field: keyof BearingClearanceData, error: string) => {
    setInnerBeforeErrors((prev) => ({ ...prev, [field]: error }));
  };

  const setInnerAfterFieldError = (field: keyof BearingClearanceData, error: string) => {
    setInnerAfterErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Note: State is initialized from initialData on mount. If initialData needs to update
  // after initial mount, the parent component should use a key prop to force remount.

  // Reset function
  const reset = () => {
    setIncludeBeforeMeasurements(false);
    setOuterBeforeData(defaultBearingData);
    setOuterAfterData(defaultBearingData);
    setInnerBeforeData(defaultBearingData);
    setInnerAfterData(defaultBearingData);
    setOuterBeforeHasBeenAdjusted(undefined);
    setOuterAfterHasBeenAdjusted(undefined);
    setInnerBeforeHasBeenAdjusted(undefined);
    setInnerAfterHasBeenAdjusted(undefined);
    setOuterCombinedWith('');
    setOuterMatingPart(undefined);
    setInnerCombinedWith('');
    setInnerMatingPart(undefined);
    setSlideMotorMounts(undefined);
    setPowerCordHoses(undefined);
    setChainsGearsSprockets(undefined);
    setLockingClamps(undefined);
    setNotes('');
    setOuterBeforeErrors({});
    setOuterAfterErrors({});
    setInnerBeforeErrors({});
    setInnerAfterErrors({});
  };

  return {
    // Initial loaded data (for touched detection)
    initialOuterBeforeData,
    initialOuterAfterData,
    initialInnerBeforeData,
    initialInnerAfterData,

    // Include before measurements
    includeBeforeMeasurements,
    setIncludeBeforeMeasurements,

    // Bearing data
    outerBeforeData,
    setOuterBeforeData,
    outerAfterData,
    setOuterAfterData,
    innerBeforeData,
    setInnerBeforeData,
    innerAfterData,
    setInnerAfterData,

    // Has been adjusted states
    outerBeforeHasBeenAdjusted,
    setOuterBeforeHasBeenAdjusted,
    outerAfterHasBeenAdjusted,
    setOuterAfterHasBeenAdjusted,
    innerBeforeHasBeenAdjusted,
    setInnerBeforeHasBeenAdjusted,
    innerAfterHasBeenAdjusted,
    setInnerAfterHasBeenAdjusted,

    // Tab-specific fields
    outerCombinedWith,
    setOuterCombinedWith,
    outerMatingPart,
    setOuterMatingPart,
    innerCombinedWith,
    setInnerCombinedWith,
    innerMatingPart,
    setInnerMatingPart,

    // Shared fields
    slideMotorMounts,
    setSlideMotorMounts,
    powerCordHoses,
    setPowerCordHoses,
    chainsGearsSprockets,
    setChainsGearsSprockets,
    lockingClamps,
    setLockingClamps,
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
