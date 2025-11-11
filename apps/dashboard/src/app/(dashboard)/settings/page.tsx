import { getTranslations } from 'next-intl/server';
import { Typography } from '@/components/ui/typography';

export default async function SettingsPage() {
  const t = await getTranslations('settings');

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1">{t('pageTitle')}</Typography>
        <Typography variant="muted" className="mt-1">
          {t('pageDescription')}
        </Typography>
      </div>
      <div className="text-center py-12">
        <Typography variant="muted">Settings page - Coming soon</Typography>
      </div>
    </div>
  );
}
