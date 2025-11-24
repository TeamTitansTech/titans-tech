import { getTranslations } from 'next-intl/server';
import { MachineListPage } from './components/MachineListPage';
import { getMachines } from '@/data/services/machines.api';
import { Typography } from '@/components/ui/typography';
import { NoPermission } from '@/components/no-permission/NoPermission';

export default async function AdminMachinesPage() {
  const t = await getTranslations('machines');
  const response = await getMachines();

  if (response.errors) {
    // Check for 403 Forbidden status (permission error)
    if (response.status === 403) {
      return <NoPermission />;
    }

    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h2">{t('pageTitle')}</Typography>
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

  return <MachineListPage machines={machines} />;
}
