import { getTranslations } from 'next-intl/server';
import { Typography } from '@/components/ui/typography';
import { ServiceRequestsList } from './components/ServiceRequestsList';

export default async function ServiceRequestsPage() {
  const t = await getTranslations('serviceRequests');

  return (
    <div className="space-y-6 p-8">
      <div>
        <Typography variant="h2">{t('listTitle')}</Typography>
      </div>
      <ServiceRequestsList />
    </div>
  );
}
