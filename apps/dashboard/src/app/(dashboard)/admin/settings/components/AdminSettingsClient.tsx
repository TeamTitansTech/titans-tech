'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Settings2, Building2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { GeneralSettingsSection } from './GeneralSettingsSection';
import { CompanyManagementSection } from './CompanyManagementSection';
import { getAllCompanies, type Company } from '@/data/services/companies.api';
import { toast } from 'sonner';

export function AdminSettingsClient() {
  const t = useTranslations('adminSettings');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  useEffect(() => {
    async function loadCompanies() {
      setIsLoadingCompanies(true);
      const response = await getAllCompanies();
      if (response.errors) {
        toast.error(t('errors.loadingCompaniesFailed'));
      } else {
        const data = response.data || [];
        setCompanies(data);
        if (data.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(data[0].id);
        }
      }
      setIsLoadingCompanies(false);
    }

    loadCompanies();
  }, [t, selectedCompanyId]);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-muted-foreground mt-1">{t('pageDescription')}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">{t('generalSettings.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('generalSettings.description')}</p>
          </div>
        </div>
        <GeneralSettingsSection />
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <div>
            <h2 className="text-xl font-semibold">{t('companyManagement.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('companyManagement.description')}</p>
          </div>
        </div>

        <CompanyManagementSection
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          onSelectCompany={setSelectedCompanyId}
          isLoading={isLoadingCompanies}
          selectedCompany={selectedCompany}
        />
      </div>
    </div>
  );
}
