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

export interface BearingClearanceSectionData {
  outerBefore?: BearingClearanceData;
  outerAfter?: BearingClearanceData;
  innerBefore?: BearingClearanceData;
  innerAfter?: BearingClearanceData;
}

interface UseBearingClearanceStateProps {
  initialData?: BearingClearanceSectionData;
}

export function useBearingClearanceState({ initialData }: UseBearingClearanceStateProps = {}) {
  // Include before measurements checkbox
  const [includeBeforeMeasurements, setIncludeBeforeMeasurements] = useState(false);

  // Bearing data states
  const [outerBeforeData, setOuterBeforeData] = useState<BearingClearanceData>(
    initialData?.outerBefore || defaultBearingData,
  );
  const [outerAfterData, setOuterAfterData] = useState<BearingClearanceData>(
    initialData?.outerAfter || defaultBearingData,
  );
  const [innerBeforeData, setInnerBeforeData] = useState<BearingClearanceData>(
    initialData?.innerBefore || defaultBearingData,
  );
  const [innerAfterData, setInnerAfterData] = useState<BearingClearanceData>(
    initialData?.innerAfter || defaultBearingData,
  );

  // Separate states for each tab and time period
  const [outerBeforeHasBeenAdjusted, setOuterBeforeHasBeenAdjusted] = useState<
    YesNoNaDncType | undefined
  >(initialData?.outerBefore?.hasBeenAdjusted);
  const [outerAfterHasBeenAdjusted, setOuterAfterHasBeenAdjusted] = useState<
    YesNoNaDncType | undefined
  >(initialData?.outerAfter?.hasBeenAdjusted);
  const [innerBeforeHasBeenAdjusted, setInnerBeforeHasBeenAdjusted] = useState<
    YesNoNaDncType | undefined
  >(initialData?.innerBefore?.hasBeenAdjusted);
  const [innerAfterHasBeenAdjusted, setInnerAfterHasBeenAdjusted] = useState<
    YesNoNaDncType | undefined
  >(initialData?.innerAfter?.hasBeenAdjusted);

  // Tab-specific fields (separate for Outer and Inner)
  const [outerCombinedWith, setOuterCombinedWith] = useState(
    (initialData?.outerAfter || initialData?.outerBefore)?.combinedWith || '',
  );
  const [outerMatingPart, setOuterMatingPart] = useState<MatingPartType>(
    (initialData?.outerAfter || initialData?.outerBefore)?.matingPart || MatingPartType.BUSHING,
  );
  const [innerCombinedWith, setInnerCombinedWith] = useState(
    (initialData?.innerAfter || initialData?.innerBefore)?.combinedWith || '',
  );
  const [innerMatingPart, setInnerMatingPart] = useState<MatingPartType>(
    (initialData?.innerAfter || initialData?.innerBefore)?.matingPart || MatingPartType.BUSHING,
  );

  // Shared fields (Shutdown Adjustment Mechanism)
  const [slideMotorMounts, setSlideMotorMounts] = useState<
    ConditionOkNaDncBrokenWornType | undefined
  >(
    initialData?.outerAfter?.slideMotorMounts ||
      initialData?.outerBefore?.slideMotorMounts ||
      undefined,
  );
  const [powerCordHoses, setPowerCordHoses] = useState<ConditionOkNaDncDamagedType | undefined>(
    initialData?.outerAfter?.powerCordHoses ||
      initialData?.outerBefore?.powerCordHoses ||
      undefined,
  );
  const [chainsGearsSprockets, setChainsGearsSprockets] = useState<
    ConditionOkNaDncBrokenLooseType | undefined
  >(
    initialData?.outerAfter?.chainsGearsSprockets ||
      initialData?.outerBefore?.chainsGearsSprockets ||
      undefined,
  );
  const [lockingClamps, setLockingClamps] = useState<ConditionOkNaDncDamagedType | undefined>(
    initialData?.outerAfter?.lockingClamps || initialData?.outerBefore?.lockingClamps || undefined,
  );
  const [notes, setNotes] = useState(
    initialData?.outerAfter?.notes || initialData?.outerBefore?.notes || '',
  );

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
    setOuterMatingPart(MatingPartType.BUSHING);
    setInnerCombinedWith('');
    setInnerMatingPart(MatingPartType.BUSHING);
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
