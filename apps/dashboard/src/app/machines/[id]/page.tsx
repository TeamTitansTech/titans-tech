import { getTranslations } from 'next-intl/server';
import { getMachineById } from '@/data/services/machines.api';
import { MachineDetailsClient } from './components/MachineDetailsClient';
import { notFound } from 'next/navigation';

interface MachineDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MachineDetailPage({
  params,
}: MachineDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations('machines');
  const response = await getMachineById(id);

  if (response.errors) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('detailPageTitle')}
          </h1>
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

  return <MachineDetailsClient machine={response.data} />;
}
