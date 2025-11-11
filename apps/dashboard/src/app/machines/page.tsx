import { getTranslations } from 'next-intl/server';
import { MachinesPageClient } from './components/MachinesPageClient';
import { getMachines } from '@/data/services/machines.api';

export default async function MachinesPage() {
  const t = await getTranslations('machines');
  const response = await getMachines();

  console.debug(response, 'response');

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

  const machines = response.data || [];

  return <MachinesPageClient machines={machines} />;
}
