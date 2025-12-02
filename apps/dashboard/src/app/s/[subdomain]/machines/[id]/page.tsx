import { getTranslations } from 'next-intl/server';
import { getMachineById } from '@/data/services/machines.api';
import { getCurrentUser } from '@/data/services/auth.api';
import { MachineDetailsClient } from './components/MachineDetailsClient';
import { ServiceHistory } from './components/ServiceHistory';
import { UpcomingServices } from '@/components/shared/services/UpcomingServices';
import { notFound, redirect } from 'next/navigation';
import { Typography } from '@/components/ui/typography';
import { NoPermission } from '@/components/no-permission/NoPermission';
import { hasPermissionForResource, hasPermission } from '@/lib/permissions';

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

  // Check service permissions
  const canReadServices = hasPermission(user, machine.branchId, 'readServices');
  const canCreateServices = hasPermission(user, machine.branchId, 'createServices');
  const canUpdateServices = hasPermission(user, machine.branchId, 'updateServices');
  const canDeleteServices = hasPermission(user, machine.branchId, 'deleteServices');

  return (
    <div className="space-y-6 p-4">
      <MachineDetailsClient machine={response.data} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canReadServices ? (
          <UpcomingServices
            machineId={id}
            blueprintSections={machine.blueprint?.sections || []}
            canCreateServices={canCreateServices}
            canUpdateServices={canUpdateServices}
            canDeleteServices={canDeleteServices}
          />
        ) : (
          <NoPermission variant="inline" />
        )}
        <ServiceHistory machineId={id} />
      </div>
    </div>
  );
}
