/**
 * Utility function to translate enum values to human-readable strings
 * Centralized translation logic for all summary components
 */

type TranslateFn = (key: string) => string;

export function translateEnumValue(value: unknown, tCommon: TranslateFn): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? tCommon('yes') : tCommon('no');
  }

  const stringValue = String(value);

  // Comprehensive enum mapping for all service types
  const enumMap: Record<string, string> = {
    // Basic status enums
    YES: tCommon('yes'),
    NO: tCommon('no'),
    DNC: tCommon('dnc'),
    NA: tCommon('na'),
    OK: tCommon('ok'),

    // Condition enums
    DAMAGED: tCommon('damaged'),
    LEAKING: tCommon('leaking'),
    NOT_OPERATIONAL: tCommon('not_operational'),
    DARK_OIL: tCommon('dark_oil'),
    NEEDS_REPLACED: tCommon('needs_replaced'),

    // Clutch-specific enums
    GLAZED: tCommon('glazed'),
    OIL_SOAKED: tCommon('oil_soaked'),
    MISSING_SEGMENTS: tCommon('missing_segments'),
    BROKEN: tCommon('broken'),
    BENT_WORN: tCommon('bent_worn'),
    LINING_WORN: tCommon('lining_worn'),

    // Location enums
    BUSHING: tCommon('bushing'),
    BED: tCommon('bed'),
    BOLSTER: tCommon('bolster'),
  };

  return enumMap[stringValue] || stringValue;
}
