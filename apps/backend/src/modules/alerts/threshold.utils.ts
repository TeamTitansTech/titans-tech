import { Decimal } from '@prisma/client/runtime/library';

/**
 * List of all threshold field names
 */
export const THRESHOLD_FIELDS = [
  'totalClearance_greenMin',
  'totalClearance_yellowMin',
  'totalClearance_redMin',
  'mainBearings_greenMin',
  'mainBearings_yellowMin',
  'mainBearings_redMin',
  'upperConnectionBearings_greenMin',
  'upperConnectionBearings_yellowMin',
  'upperConnectionBearings_redMin',
  'wristPinToMatingPart_greenMin',
  'wristPinToMatingPart_yellowMin',
  'wristPinToMatingPart_redMin',
  'wristPinToBushing_greenMin',
  'wristPinToBushing_yellowMin',
  'wristPinToBushing_redMin',
  'slideAdjNutToScrewSleeve_greenMin',
  'slideAdjNutToScrewSleeve_yellowMin',
  'slideAdjNutToScrewSleeve_redMin',
] as const;

export type ThresholdFieldName = (typeof THRESHOLD_FIELDS)[number];

/**
 * Type for complete threshold data with Decimal fields
 */
export type ThresholdDecimalData = {
  [K in ThresholdFieldName]: Decimal;
};

/**
 * Type for partial threshold data with Decimal fields
 */
export type PartialThresholdDecimalData = {
  [K in ThresholdFieldName]?: Decimal;
};

/**
 * Converts threshold DTO fields to Decimal type for Prisma (all fields)
 *
 * @param dto - Threshold data object with all fields
 * @returns Object with all Decimal-converted threshold fields
 */
export function convertThresholdToDecimal<T extends Record<string, any>>(
  dto: T,
): ThresholdDecimalData {
  return THRESHOLD_FIELDS.reduce((acc, field) => {
    acc[field] = new Decimal(dto[field]);
    return acc;
  }, {} as any) as ThresholdDecimalData;
}

/**
 * Converts partial threshold DTO fields to Decimal type for Prisma
 *
 * @param dto - Partial threshold data object
 * @returns Object with Decimal-converted threshold fields (only provided fields)
 */
export function convertPartialThresholdToDecimal<T extends Record<string, any>>(
  dto: T,
): PartialThresholdDecimalData {
  const data: any = {};
  Object.keys(dto).forEach((key) => {
    const value = dto[key];
    if (value !== undefined && THRESHOLD_FIELDS.includes(key as any)) {
      data[key] = new Decimal(value);
    }
  });
  return data as PartialThresholdDecimalData;
}
