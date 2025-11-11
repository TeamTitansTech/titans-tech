'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Separator } from '@/components/ui/separator';
import { GeneralSettingsSection } from './GeneralSettingsSection';
import { CompanyManagementSection } from './CompanyManagementSection';
import { getAllCompanies, type Company } from '@/data/services/companies.api';
import { toast } from 'sonner';

export function AdminSettings() {
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
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-muted-foreground mt-2">{t('pageDescription')}</p>
      </div>

      <Separator />

      <GeneralSettingsSection />

      <Separator />

      <CompanyManagementSection
        companies={companies}
        selectedCompanyId={selectedCompanyId}
        onSelectCompany={setSelectedCompanyId}
        isLoading={isLoadingCompanies}
        selectedCompany={selectedCompany}
      />
    </div>
  );
}
