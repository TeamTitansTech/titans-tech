import { getTranslations } from 'next-intl/server';
import { getMachineById } from '@/data/services/machines.api';
import { MachineDetails } from './components/MachineDetails';
import { UpcomingServices } from './components/UpcomingServices';
import { ServiceHistory } from './components/ServiceHistory';
import { notFound } from 'next/navigation';
import { Typography } from '@/components/ui/typography';

interface MachineDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MachineDetailPage({ params }: MachineDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations('machines');
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

  return (
    <div className="space-y-6 p-4">
      <MachineDetails machine={response.data} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingServices
          machineId={id}
          blueprintSections={response.data.blueprint?.sections || []}
        />
        <ServiceHistory
          machineId={id}
          blueprintSections={response.data.blueprint?.sections || []}
        />
      </div>
    </div>
  );
}
