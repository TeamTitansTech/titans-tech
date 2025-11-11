/**
 * Shared utility functions for section components
 */

/**
 * Check if data has been touched (modified from default)
 */
export const isDataTouched = <T extends object>(data: T, defaultData: T): boolean => {
  return (Object.keys(data) as Array<keyof T>).some((key) => {
    const dataValue = data[key];
    const defaultValue = defaultData[key];

    if (typeof dataValue === 'number' && typeof defaultValue === 'number') {
      return dataValue !== defaultValue;
    }
    if (typeof dataValue === 'string' && typeof defaultValue === 'string') {
      return dataValue.trim() !== defaultValue.trim();
    }
    if (typeof dataValue === 'boolean' && typeof defaultValue === 'boolean') {
      return dataValue !== defaultValue;
    }
    if (dataValue === undefined || dataValue === null) {
      return defaultValue !== undefined && defaultValue !== null;
    }
    return dataValue !== defaultValue;
  });
};
