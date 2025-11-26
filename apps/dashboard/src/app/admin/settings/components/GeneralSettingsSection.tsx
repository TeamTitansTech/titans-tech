// Admin wrapper for shared GeneralSettingsSection
export { GeneralSettingsSection as default } from '@/components/shared/settings/GeneralSettingsSection';

// Re-export with admin-specific defaults
import { GeneralSettingsSection as SharedGeneralSettingsSection } from '@/components/shared/settings/GeneralSettingsSection';

export function GeneralSettingsSection() {
  return <SharedGeneralSettingsSection translationNamespace="adminSettings.generalSettings" />;
}
