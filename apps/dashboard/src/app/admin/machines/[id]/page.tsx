import { getTranslations } from 'next-intl/server';
import { getMachineById } from '@/data/services/machines.api';
import { getPublicMachineInfo } from '@/data/services/public.api';
import { getLatestReport } from '@/data/services/services.api';
import { MachineDetails } from './components/MachineDetails';
import { UpcomingServices } from '@/components/shared/services/UpcomingServices';
import { ServiceHistory } from './components/ServiceHistory';
import { ServiceRequests } from './components/ServiceRequests';
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
  const [response, publicInfoResponse, latestReportResponse] = await Promise.all([
    getMachineById(id),
    getPublicMachineInfo(id),
    getLatestReport(id),
  ]);

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

  // Get company slug from public info for QR code generation
  const companySlug = publicInfoResponse.data?.company.slug ?? '';
  const latestReport = latestReportResponse.data || null;

  return (
    <div className="space-y-6 p-4">
      <MachineDetails
        machine={response.data}
        companySlug={companySlug}
        initialLatestReport={latestReport}
      />
      <ServiceRequests machineId={id} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingServices
          machineId={id}
          blueprintSections={response.data.blueprint?.sections || []}
          companyId={response.data.branch?.companyId}
          defaultMeasurementUnit={response.data.branch?.defaultMeasurementUnit || 'INCHES'}
        />
        <ServiceHistory
          machineId={id}
          blueprintSections={response.data.blueprint?.sections || []}
          defaultMeasurementUnit={response.data.branch?.defaultMeasurementUnit || 'INCHES'}
        />
      </div>
    </div>
  );
}
