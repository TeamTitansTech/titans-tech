'use client';

import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { CompanyView } from './CompanyView';
import type { Company } from '@/data/services/companies.api';
import type { CompanyBranch } from '@/data/services/company-branches.api';

interface BranchWithMachineCount extends CompanyBranch {
  machineCount: number;
  machines: any[];
}

interface CompanyViewWrapperProps {
  company: Company;
  branches: BranchWithMachineCount[];
}

export function CompanyViewWrapper({ company, branches }: CompanyViewWrapperProps) {
  const { companyUser, isLoading } = useCompanyUser();

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">
          Carregando informações do usuário...
        </div>
      </div>
    );
  }

  // If no user after loading, redirect to login
  if (!companyUser) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">
          Usuário não autenticado. Por favor, faça login novamente.
        </div>
      </div>
    );
  }

  return (
    <CompanyView
      company={company}
      branches={branches}
      companyUser={companyUser}
    />
  );
}