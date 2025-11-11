import { getTranslations } from 'next-intl/server';
import CompaniesManager from '@/app/(dashboard)/auth-test/components/CompaniesManager';
import { Typography } from '@/components/ui/typography';

export default async function AdminCompaniesPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = await getTranslations('companies');

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h1">Companies</Typography>
        <Typography variant="muted" className="mt-1">
          Manage all companies in the system
        </Typography>
      </div>
      <CompaniesManager />
    </div>
  );
}
