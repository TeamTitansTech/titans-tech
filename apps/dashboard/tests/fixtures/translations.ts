import enMessages from '../../messages/en.json';
import ptMessages from '../../messages/pt.json';
import esMessages from '../../messages/es.json';

type MessageValue = string | { [key: string]: MessageValue };
type Messages = Record<string, MessageValue>;
type Locale = 'en' | 'pt' | 'es';

const messages: Record<Locale, Messages> = {
  en: enMessages,
  pt: ptMessages,
  es: esMessages,
};

/**
 * Get translation for tests
 * @param key - Dot notation key (e.g., 'companies.newButton')
 * @param locale - Locale to use (default: 'pt')
 * @returns Translated string
 */
export function getTestTranslation(key: string, locale: Locale = 'pt'): string {
  const messageSet = messages[locale];
  const keys = key.split('.');

  let value: MessageValue = messageSet;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key} for locale ${locale}`);
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * Create a translation function scoped to a namespace
 * @param namespace - Translation namespace
 * @param locale - Locale to use
 * @returns Translation function
 */
export function createTestTranslator(namespace: string, locale: Locale = 'pt') {
  return (key: string) => getTestTranslation(`${namespace}.${key}`, locale);
}

export const testTranslations = {
  companies: createTestTranslator('companies'),

  adminSettings: {
    createCompany: createTestTranslator('adminSettings.createCompany'),
  },

  common: createTestTranslator('common'),

  validation: createTestTranslator('validation'),

  navigation: createTestTranslator('navigation'),

  settings: {
    deleteUserDialog: createTestTranslator('settings.deleteUserDialog'),
    addUserDialog: createTestTranslator('settings.addUserDialog'),
    branchSettings: createTestTranslator('settings.branchSettings'),
    userManagement: createTestTranslator('settings.userManagement'),
    branches: createTestTranslator('settings.branches'),
  },
} as const;
