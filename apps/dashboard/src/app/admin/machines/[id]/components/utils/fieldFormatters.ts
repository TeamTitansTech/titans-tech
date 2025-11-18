/**
 * Utility functions for formatting field names and values
 */

/**
 * Format field name from camelCase to Title Case
 */
export const formatFieldName = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Translation function type for section-specific field names
 */
export type TranslateFn = (key: string) => string;

/**
 * Translation functions registry for different sections
 */
export interface TranslationFunctions {
  bearingClearance?: TranslateFn;
  slide?: TranslateFn;
  clutch?: TranslateFn;
  counterbalance?: TranslateFn;
  tramming?: TranslateFn;
  gibs?: TranslateFn;
}

/**
 * Translate field name based on section
 * @param key - Field key to translate
 * @param sectionKey - Section identifier
 * @param translations - Object containing translation functions for each section
 * @returns Translated field name or formatted field name as fallback
 */
export const translateFieldName = (
  key: string,
  sectionKey: string | undefined,
  translations: TranslationFunctions,
): string => {
  // Try to get translation based on section
  if (sectionKey === 'BEARING_CLEARANCE' && translations.bearingClearance) {
    const translation = translations.bearingClearance(key);
    if (translation !== key) return translation;
  } else if (sectionKey === 'SLIDE' && translations.slide) {
    const translation = translations.slide(key);
    if (translation !== key) return translation;
  } else if (sectionKey === 'CLUTCH' && translations.clutch) {
    const translation = translations.clutch(key);
    if (translation !== key) return translation;
  } else if (sectionKey === 'COUNTERBALANCE_CYLINDER_AIRBAG' && translations.counterbalance) {
    const translation = translations.counterbalance(key);
    if (translation !== key) return translation;
  } else if (sectionKey === 'TRAMMING' && translations.tramming) {
    const translation = translations.tramming(key);
    if (translation !== key) return translation;
  } else if (sectionKey === 'GIBS' && translations.gibs) {
    const translation = translations.gibs(key);
    if (translation !== key) return translation;
  }

  // Fallback to formatFieldName for fields without translations
  return formatFieldName(key);
};

/**
 * Enum value translations
 */
export interface EnumTranslations {
  toBed?: string;
  toBolster?: string;
  dnc?: string;
  yes?: string;
  no?: string;
  na?: string;
}

/**
 * Display value or "-" for empty, with enum translation support
 * @param value - Value to display
 * @param enumTranslations - Optional translations for enum values
 * @returns Formatted string value
 */
export const displayValue = (value: any, enumTranslations?: EnumTranslations): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Handle enum translations if provided
  if (enumTranslations) {
    const stringValue = String(value);

    // Translate ParallelismType values
    if (stringValue === 'TO_BED' && enumTranslations.toBed) {
      return enumTranslations.toBed;
    }
    if (stringValue === 'TO_BOLSTER' && enumTranslations.toBolster) {
      return enumTranslations.toBolster;
    }
    if (stringValue === 'DNC' && enumTranslations.dnc) {
      return enumTranslations.dnc;
    }

    // Translate Yes/No/NA values
    if (stringValue === 'YES' && enumTranslations.yes) {
      return enumTranslations.yes;
    }
    if (stringValue === 'NO' && enumTranslations.no) {
      return enumTranslations.no;
    }
    if (stringValue === 'NA' && enumTranslations.na) {
      return enumTranslations.na;
    }
  }

  return String(value);
};
