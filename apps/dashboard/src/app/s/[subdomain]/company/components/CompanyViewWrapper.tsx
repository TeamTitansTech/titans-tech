'use client';

import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { CompanyView } from './CompanyView';
import type { Company } from '@/data/services/companies.api';
import type { CompanyBranch } from '@/data/services/company-branches.api';
import type { Machine } from '@/data/services/machines.api';
import { useTranslations } from 'next-intl';

interface BranchWithMachineCount extends CompanyBranch {
  machineCount: number;
  machines: Machine[];
}

interface CompanyViewWrapperProps {
  company: Company;
  branches: BranchWithMachineCount[];
}

export function CompanyViewWrapper({ company, branches }: CompanyViewWrapperProps) {
  const { companyUser, isLoading } = useCompanyUser();
  const t = useTranslations('common');
  const tErrors = useTranslations('errors');

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">{t('loadingUserInfo')}</div>
      </div>
    );
  }

  // If no user after loading, redirect to login
  if (!companyUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">{tErrors('userNotAuthenticated')}</div>
      </div>
    );
  }

  return <CompanyView company={company} branches={branches} companyUser={companyUser} />;
}
