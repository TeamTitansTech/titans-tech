// Client wrapper for shared GeneralSettingsSection
export { GeneralSettingsSection as default } from '@/components/shared/settings/GeneralSettingsSection';

// Re-export with client-specific defaults (uses default translation namespace)
import { GeneralSettingsSection as SharedGeneralSettingsSection } from '@/components/shared/settings/GeneralSettingsSection';

export function GeneralSettingsSection() {
  // Client uses default 'settings.generalSettings' namespace
  return <SharedGeneralSettingsSection />;
}
