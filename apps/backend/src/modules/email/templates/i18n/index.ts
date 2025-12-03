import type { Locale } from './types';
import enTranslations from './locales/en.json';
import ptTranslations from './locales/pt.json';
import esTranslations from './locales/es.json';

const translations: Record<Locale, Record<string, any>> = {
  en: enTranslations,
  pt: ptTranslations,
  es: esTranslations,
};

/**
 * Get all translations for a specific locale
 * @param locale - The locale to get translations for (en, pt, es)
 * @returns The translations object for the specified locale
 */
export function getTranslations(locale: Locale = 'en'): Record<string, any> {
  return translations[locale] || translations.en;
}

/**
 * Translate a string with parameter interpolation
 * @param key - Dot-notation path to the translation key (e.g., "emails.alertNotification.subject")
 * @param locale - The locale to use for translation
 * @param params - Object with parameters to interpolate in the translation
 * @returns The translated string with parameters replaced
 */
export function t(
  key: string,
  locale: Locale = 'en',
  params?: Record<string, string | number>,
): string {
  const trans = getTranslations(locale);

  // Navigate through the nested object using dot notation
  const keys = key.split('.');
  let value: any = trans;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Key not found, return the key itself as fallback
      console.warn(`Translation key not found: ${key} for locale ${locale}`);
      return key;
    }
  }

  // If value is not a string, return the key
  if (typeof value !== 'string') {
    console.warn(
      `Translation value is not a string: ${key} for locale ${locale}`,
    );
    return key;
  }

  // If no params, return the value as is
  if (!params) {
    return value;
  }

  // Replace parameters in the format {paramName}
  let result = value;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    result = result.replace(
      new RegExp(`\\{${paramKey}\\}`, 'g'),
      String(paramValue),
    );
  }

  return result;
}

/**
 * Get subject line for email with interpolation
 * @param templateKey - The template key (e.g., "alertNotification", "urgentRequest")
 * @param locale - The locale to use
 * @param params - Parameters to interpolate
 * @returns The translated subject line
 */
export function getEmailSubject(
  templateKey: string,
  locale: Locale = 'en',
  params?: Record<string, string | number>,
): string {
  return t(`emails.${templateKey}.subject`, locale, params);
}

export * from './types';
export { Locale };
