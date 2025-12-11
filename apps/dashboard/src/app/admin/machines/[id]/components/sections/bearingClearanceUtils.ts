import {
  type BearingClearanceData,
  MatingPartType,
  YesNoNaDncType,
  ConditionOkNaDncBrokenWornType,
  ConditionOkNaDncBrokenLooseType,
  ConditionOkNaDncDamagedType,
} from '@/data/types/services.types';

export interface SharedFields {
  slideMotorMounts: ConditionOkNaDncBrokenWornType | undefined;
  powerCordHoses: ConditionOkNaDncDamagedType | undefined;
  chainsGearsSprockets: ConditionOkNaDncBrokenLooseType | undefined;
  lockingClamps: ConditionOkNaDncDamagedType | undefined;
  notes: string;
}

export interface TabSpecificFields {
  hasBeenAdjusted: YesNoNaDncType;
  combinedWith: string;
  matingPart: MatingPartType;
}

/**
 * Builds the shared fields object for shutdown adjustment mechanism
 */
export function buildSharedFields(fields: SharedFields) {
  return {
    slideMotorMounts: fields.slideMotorMounts,
    powerCordHoses: fields.powerCordHoses,
    chainsGearsSprockets: fields.chainsGearsSprockets,
    lockingClamps: fields.lockingClamps,
    notes: fields.notes,
  };
}

/**
 * Builds the complete bearing data with tab-specific and shared fields
 */
export function buildBearingFields(
  tabFields: TabSpecificFields,
  sharedFields: SharedFields,
): Partial<BearingClearanceData> {
  return {
    hasBeenAdjusted: tabFields.hasBeenAdjusted,
    combinedWith: tabFields.combinedWith,
    matingPart: tabFields.matingPart,
    ...buildSharedFields(sharedFields),
  };
}

/**
 * Validates required "Has Been Adjusted" fields for each touched tab
 */
export function validateHasBeenAdjustedFields(params: {
  includeBeforeMeasurements: boolean;
  outerBeforeTouched: boolean;
  outerAfterTouched: boolean;
  innerBeforeTouched: boolean;
  innerAfterTouched: boolean;
  outerBeforeHasBeenAdjusted: YesNoNaDncType | undefined;
  outerAfterHasBeenAdjusted: YesNoNaDncType | undefined;
  innerBeforeHasBeenAdjusted: YesNoNaDncType | undefined;
  innerAfterHasBeenAdjusted: YesNoNaDncType | undefined;
}): string[] {
  const errors: string[] = [];
  const {
    includeBeforeMeasurements,
    outerBeforeTouched,
    outerAfterTouched,
    innerBeforeTouched,
    innerAfterTouched,
    outerBeforeHasBeenAdjusted,
    outerAfterHasBeenAdjusted,
    innerBeforeHasBeenAdjusted,
    innerAfterHasBeenAdjusted,
  } = params;

  if (includeBeforeMeasurements) {
    if (outerBeforeTouched && !outerBeforeHasBeenAdjusted) {
      errors.push(
        'Bearing Clearance: "Has Been Adjusted" field is required for Outer Before measurements',
      );
    }
    if (innerBeforeTouched && !innerBeforeHasBeenAdjusted) {
      errors.push(
        'Bearing Clearance: "Has Been Adjusted" field is required for Inner Before measurements',
      );
    }
  }
  if (outerAfterTouched && !outerAfterHasBeenAdjusted) {
    errors.push(
      'Bearing Clearance: "Has Been Adjusted" field is required for Outer After measurements',
    );
  }
  if (innerAfterTouched && !innerAfterHasBeenAdjusted) {
    errors.push(
      'Bearing Clearance: "Has Been Adjusted" field is required for Inner After measurements',
    );
  }

  return errors;
}

/**
 * Validates that at least one measurement section is filled
 */
export function validateAtLeastOneSection(
  outerAfterTouched: boolean,
  innerAfterTouched: boolean,
): string[] {
  const errors: string[] = [];

  if (!outerAfterTouched && !innerAfterTouched) {
    errors.push(
      'Bearing Clearance: You must fill at least one measurement section (Outer Data or Inner Data)',
    );
  }

  return errors;
}

// Numeric fields that need to be converted from undefined to 0 for backend submission
const NUMERIC_FIELDS: (keyof BearingClearanceData)[] = [
  'totalClearance_RH',
  'totalClearance_LH',
  'mainBearings_RH',
  'mainBearings_LH',
  'upperConnectionBearings_RH',
  'upperConnectionBearings_LH',
  'wristPinToMatingPart_RH',
  'wristPinToMatingPart_LH',
  'wristPinToBushing_RH',
  'wristPinToBushing_LH',
  'slideAdjNutToScrewSleeve_RH',
  'slideAdjNutToScrewSleeve_LH',
  'extraDoubleLockOpen_RH',
  'extraDoubleLockOpen_LH',
  'ballBoxArea_RH',
  'ballBoxArea_LH',
];

/**
 * Sanitizes bearing clearance data for backend submission.
 * Converts undefined numeric fields to 0 since the database requires non-null values.
 */
export function sanitizeBearingDataForSubmission(data: BearingClearanceData): BearingClearanceData {
  const sanitized = { ...data };
  for (const field of NUMERIC_FIELDS) {
    if (sanitized[field] === undefined || sanitized[field] === null) {
      (sanitized as Record<string, unknown>)[field] = 0;
    }
  }
  return sanitized;
}

/**
 * Desanitizes bearing clearance data for display in forms.
 * Converts 0 numeric fields back to undefined so empty inputs are shown correctly.
 * This reverses the sanitization done before saving to the database.
 */
export function desanitizeBearingDataForDisplay(
  data: BearingClearanceData | undefined,
): BearingClearanceData | undefined {
  if (!data) return undefined;
  const desanitized = { ...data };
  for (const field of NUMERIC_FIELDS) {
    if (desanitized[field] === 0) {
      (desanitized as Record<string, unknown>)[field] = undefined;
    }
  }
  return desanitized;
}
