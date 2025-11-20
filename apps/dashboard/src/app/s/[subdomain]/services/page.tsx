import { getTranslations } from 'next-intl/server';
import { Typography } from '@/components/ui/typography';
import { ServicesPageClient } from './components/ServicesPageClient';

export default async function ServicesPage() {
  const t = await getTranslations('services');

  return (
    <div className="space-y-6 p-8">
      <div>
        <Typography variant="h2">{t('pageTitle')}</Typography>
        <Typography variant="muted" className="mt-1">
          {t('pageDescription')}
        </Typography>
      </div>
      <ServicesPageClient />
    </div>
  );
}
