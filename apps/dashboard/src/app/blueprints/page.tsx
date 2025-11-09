import { getTranslations } from 'next-intl/server';
import { BlueprintsPageClient } from './components/BlueprintsPageClient';
import { getBlueprints } from '@/data/services/blueprints.api';

export default async function BlueprintsPage() {
  const t = await getTranslations('models');
  const response = await getBlueprints();

  if (response.errors) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
          <p className="text-muted-foreground mt-1">{t('pageDescription')}</p>
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
