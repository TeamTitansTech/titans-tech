import { getTranslations } from 'next-intl/server';
import { getMachineById } from '@/data/services/machines.api';
import { MachineDetailsClient } from './components/MachineDetailsClient';
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
      <MachineDetailsClient machine={response.data} />
      <ServiceHistory machineId={id} />
    </div>
  );
}
