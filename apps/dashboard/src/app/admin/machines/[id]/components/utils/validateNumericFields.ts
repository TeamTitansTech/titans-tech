/**
 * Validates numeric fields in measurement data
 * @param data The data object to validate
 * @param prefixes Array of field prefixes to validate (e.g., ['outer', 'inner'])
 * @returns Array of validation error messages
 */
export function validateNumericFields<T extends Record<string, unknown>>(
  data: T,
  prefixes: string[] = ['outer', 'inner'],
): string[] {
  const errors: string[] = [];

  // Get all numeric field keys from the data that match the prefixes
  const fieldsToValidate = Object.keys(data).filter((key) =>
    prefixes.some((prefix) => key.startsWith(prefix)),
  ) as (keyof T)[];

  fieldsToValidate.forEach((field) => {
    const value = data[field];
    // Only validate if the field exists in the data (not undefined)
    if (value !== undefined && (typeof value !== 'number' || isNaN(value as number))) {
      errors.push(`${String(field)} is required and must be a valid number`);
    }
  });

  return errors;
}
