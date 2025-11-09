import { getTranslations } from 'next-intl/server';
import CompaniesManager from '@/app/(dashboard)/auth-test/components/CompaniesManager';

export default async function AdminCompaniesPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = await getTranslations('companies');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <p className="text-muted-foreground mt-1">Manage all companies in the system</p>
      </div>
      <CompaniesManager />
    </div>
  );
}
