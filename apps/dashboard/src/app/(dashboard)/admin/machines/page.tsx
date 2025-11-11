import { getTranslations } from 'next-intl/server';
import { MachinesPageClient } from '@/app/(dashboard)/machines/components/MachinesPageClient';
import { getMachines } from '@/data/services/machines.api';
import { Typography } from '@/components/ui/typography';

export default async function AdminMachinesPage() {
  const t = await getTranslations('machines');
  const response = await getMachines();

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

  const machines = response.data || [];

  return <MachinesPageClient machines={machines} />;
}
