import { getTranslations } from 'next-intl/server';
import { CompaniesPageClient } from './components/CompaniesPageClient';
import { getAllCompanies } from '@/data/services/companies.api';

export default async function CompaniesPage() {
  const t = await getTranslations('companies');
  const response = await getAllCompanies();

  if (response.errors) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
          <p className="text-muted-foreground mt-1">{t('pageDescription')}</p>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">
            {t('errorLoading')}: {response.errors.join(', ')}
          </p>
        </div>
      </div>
    );
  }

  const companies = response.data || [];

  return <CompaniesPageClient companies={companies} />;
}
