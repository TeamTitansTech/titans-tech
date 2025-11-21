/**
 * Utility functions for working with section data
 */

/**
 * Check if a field is an ID or timestamp field
 */
export const isIdField = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return (
    key === 'id' ||
    key.endsWith('Id') ||
    key.endsWith('ID') ||
    lowerKey === 'id' ||
    lowerKey === 'createdat' ||
    lowerKey === 'updatedat' ||
    key === 'createdAt' ||
    key === 'updatedAt' ||
    key === 'created_at' ||
    key === 'updated_at'
  );
};

/**
 * Check if a field should be shown in Slide section summary
 */
export const isSlideFieldAllowedInSummary = (key: string): boolean => {
  // Position fields (not allowed)
  if (key.startsWith('position')) return false;

  // Only allow specific fields
  const allowedFields = [
    'outerParallelism',
    'outerHasParallelismBeenAdjusted',
    'innerParallelism',
    'innerHasParallelismBeenAdjusted',
    'outerShutheightIndicatorsChecked',
    'outerOverloadsOnTonnageMonitor',
    'outerShutheightActualSh',
    'outerIndicatorReading',
    'innerShutheightIndicatorsChecked',
    'innerOverloadsOnTonnageMonitor',
    'innerShutheightActualSh',
    'innerIndicatorReading',
    'notes',
  ];

  return allowedFields.includes(key);
};

/**
 * Calculate max deviation from slide position data
 */
export const calculateMaxDeviation = (data: Record<string, unknown>): string => {
  if (!data) return '-';

  const positions = [
    data.position1,
    data.position2,
    data.position3,
    data.position4,
    data.position5,
    data.position6,
  ];
  const validValues = positions.filter(
    (val): val is number => typeof val === 'number' && !isNaN(val) && val !== 0,
  );

  if (validValues.length > 1) {
    const max = Math.max(...validValues);
    const min = Math.min(...validValues);
    return (max - min).toFixed(4);
  }
  return '-';
};

/**
 * Check if data has actual values (not just defaults)
 */
export const hasActualData = (data: Record<string, unknown>): boolean => {
  if (!data) return false;

  // Check if any field has a value (including zero, which is valid)
  return Object.entries(data).some(([key, value]) => {
    if (key === 'hasBeenAdjusted' || key === 'combinedWith' || key === 'matingPart') {
      // Check if these string fields have non-empty values
      return value !== '' && value !== null && value !== undefined;
    }
    // For numeric fields, check if they exist (0 is a valid value)
    return typeof value === 'number' && !isNaN(value);
  });
};

/**
 * Extract bearing measurement rows from data
 * @param data - The bearing data
 * @param sectionKey - Optional section key for context (not used currently, just for API compatibility)
 * @returns Array of bearing rows with field, lh, rh, and differential values
 */
export const extractBearingRows = (
  data: Record<string, unknown> | undefined,
  _sectionKey?: string,
): { field: string; lh: unknown; rh: unknown; differential: string }[] => {
  if (!data) return [];

  const rows: { field: string; lh: unknown; rh: unknown; differential: string }[] = [];
  const processedFields = new Set<string>();

  // Fields to skip (non-measurement fields)
  const skipFields = [
    'hasBeenAdjusted',
    'combinedWith',
    'matingPart',
    'slideMotorMounts',
    'powerCordHoses',
    'chainsGearsSprockets',
    'lockingClamps',
    'notes',
  ];

  Object.keys(data).forEach((key) => {
    // Skip ID and timestamp fields
    if (isIdField(key)) {
      return;
    }

    // Skip non-measurement fields
    if (skipFields.includes(key)) {
      return;
    }

    // Extract field name without _RH or _LH suffix
    const baseField = key.replace(/_RH$|_LH$/, '');

    if (!processedFields.has(baseField)) {
      processedFields.add(baseField);
      const lhValue = data[`${baseField}_LH`];
      const rhValue = data[`${baseField}_RH`];

      // Calculate differential
      let differential = '-';
      if (typeof lhValue === 'number' && typeof rhValue === 'number') {
        differential = String(Math.abs(rhValue - lhValue));
      }

      rows.push({
        field: baseField, // Return raw field key for translation
        lh: lhValue,
        rh: rhValue,
        differential,
      });
    }
  });

  return rows;
};
