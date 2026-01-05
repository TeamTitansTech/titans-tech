import { getTranslations } from 'next-intl/server';
import { Typography } from '@/components/ui/typography';
import { ServicesPageClient } from '@/components/services/ServicesPageClient';

export default async function ServicesPage() {
  const t = await getTranslations('services');

  return (
    <div className="space-y-6 p-8">
      <div>
        <Typography variant="h2" data-testid="services-page-title">
          {t('pageTitle')}
        </Typography>
        <Typography variant="muted" className="mt-1" data-testid="services-page-description">
          {t('pageDescription')}
        </Typography>
      </div>
      <ServicesPageClient />
    </div>
  );
}
