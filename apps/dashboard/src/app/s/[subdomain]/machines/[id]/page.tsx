import { getTranslations } from 'next-intl/server';
import { getMachineById } from '@/data/services/machines.api';
import { getCurrentUser } from '@/data/services/auth.api';
import { MachineDetailsClient } from './components/MachineDetailsClient';
import { ServiceHistory } from './components/ServiceHistory';
import { notFound, redirect } from 'next/navigation';
import { Typography } from '@/components/ui/typography';
import { NoPermission } from '@/components/no-permission/NoPermission';
import { hasPermissionForResource } from '@/lib/permissions';

interface MachineDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MachineDetailPage({ params }: MachineDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations('machines');

  // Get current user and check permissions
  const userResponse = await getCurrentUser();
  if (userResponse.errors || !userResponse.data) {
    redirect('/');
  }

  const response = await getMachineById(id);

  if (response.errors) {
    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h2">{t('detailPageTitle')}</Typography>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">
            {t('errorLoading')}: {response.errors.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  if (!response.data) {
    notFound();
  }

  const machine = response.data;
  const user = userResponse.data;

  // Check if user has readMachines permission for this machine's branch
  const canViewMachine = hasPermissionForResource(user, machine, 'readMachines');

  if (!canViewMachine) {
    return <NoPermission />;
  }

  return (
    <div className="space-y-6 p-4">
      <MachineDetailsClient machine={response.data} />
      <ServiceHistory machineId={id} />
    </div>
  );
}
