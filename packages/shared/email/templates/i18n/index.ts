import type { Locale } from './types';
import enTranslations from './locales/en.json';
import ptTranslations from './locales/pt.json';
import esTranslations from './locales/es.json';

const translations: Record<Locale, Record<string, any>> = {
  en: enTranslations,
  pt: ptTranslations,
  es: esTranslations,
};

export function getTranslations(locale: Locale = 'en'): Record<string, any> {
  return translations[locale] || translations.en;
}

export function t(
  key: string,
  locale: Locale = 'en',
  params?: Record<string, string | number>,
): string {
  const trans = getTranslations(locale);
  const keys = key.split('.');
  let value: any = trans;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  if (typeof value !== 'string') return key;
  if (!params) return value;
  let result = value;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    result = result.replace(new RegExp(`\{${paramKey}\}`, 'g'), String(paramValue));
  }
  return result;
}

export function getEmailSubject(
  templateKey: string,
  locale: Locale = 'en',
  params?: Record<string, string | number>,
): string {
  return t(`emails.${templateKey}.subject`, locale, params);
}

export * from './types';
export { Locale };
