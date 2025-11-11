'use client';

import { useState, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CompanyCard } from './CompanyCard';
import { CreateCompanyDialog } from '@/app/(dashboard)/admin/settings/components/CreateCompanyDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { type Company } from '@/data/services/companies.api';

interface CompaniesPageClientProps {
  companies: Company[];
}

export function CompaniesPageClient({ companies }: CompaniesPageClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('companies');
  const [optimisticCompanies, addOptimisticCompany] = useOptimistic(
    companies,
    (state, newCompany: Company) => [...state, newCompany],
  );

  const handleSuccess = (newCompany?: Company) => {
    if (newCompany) {
      addOptimisticCompany(newCompany);
    }
    router.refresh();
    setIsCreateDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
            <p className="text-muted-foreground">{t('pageDescription')}</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('newButton')}
          </Button>
        </div>

        {optimisticCompanies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('emptyState')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimisticCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>

      <CreateCompanyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
