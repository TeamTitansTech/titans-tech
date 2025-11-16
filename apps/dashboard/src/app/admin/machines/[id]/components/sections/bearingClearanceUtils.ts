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
