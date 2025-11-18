/**
 * Display a value or a fallback for empty/null/undefined values
 * @param value The value to display
 * @param yesText Text to display for true boolean values
 * @param noText Text to display for false boolean values
 * @param fallback Text to display for empty values (default: '-')
 * @returns Formatted string representation of the value
 */
export function displayValue(
  value: any,
  yesText: string = 'Yes',
  noText: string = 'No',
  fallback: string = '-',
): string {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  if (typeof value === 'boolean') {
    return value ? yesText : noText;
  }
  return String(value);
}
