'use client';

import { useTranslations } from 'next-intl';
import { CompanyCard } from './CompanyCard';

interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status?: 'active' | 'inactive';
  _count?: {
    branches: number;
  };
}

interface CompaniesPageClientProps {
  companies: Company[];
}

export function CompaniesPageClient({ companies }: CompaniesPageClientProps) {
  const t = useTranslations('companies');

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">{t('pageDescription')}</p>
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('emptyState')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              id={company.id}
              name={company.name}
              description={company.description || ''}
              status={company.status || 'active'}
              branchCount={company._count?.branches || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
