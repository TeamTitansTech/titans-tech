import { getTranslations } from 'next-intl/server';
import { BlueprintsPageClient } from './components/BlueprintsPageClient';
import { getBlueprints } from '@/data/services/blueprints.api';
import { Typography } from '@/components/ui/typography';

export default async function BlueprintsPage() {
  const t = await getTranslations('models');
  const response = await getBlueprints();

  if (response.errors) {
    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h1">{t('pageTitle')}</Typography>
          <Typography variant="muted" className="mt-1">
            {t('pageDescription')}
          </Typography>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">
            {t('errorLoading')}: {response.errors.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  const blueprints = response.data || [];

  return <BlueprintsPageClient blueprints={blueprints} />;
}
