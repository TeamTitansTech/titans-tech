'use client';

import { useEffect, useState } from 'react';
import { Typography } from '@/components/ui/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Package, User } from 'lucide-react';
import { BranchCard } from './BranchCard';
import type { UserResponseDto } from '@titans-tech/shared';
import type { Company } from '@/data/services/companies.api';
import type { CompanyBranch } from '@/data/services/company-branches.api';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from '@/data/services/users.api';

interface BranchWithMachineCount extends CompanyBranch {
  machineCount: number;
  machines: any[];
}

interface CompanyViewProps {
  company: Company;
  branches: BranchWithMachineCount[];
  companyUser: UserResponseDto;
}

export function CompanyView({ company, branches, companyUser }: CompanyViewProps) {
  const t = useTranslations();
  const [companyAdmin, setCompanyAdmin] = useState<UserResponseDto | null>(null);

  // Calculate totals
  const totalBranches = branches.length;
  const totalMachines = branches.reduce((sum, branch) => sum + branch.machineCount, 0);

  // Load company admin
  useEffect(() => {
    async function loadCompanyAdmin() {
      try {
        const usersResponse = await getAllUsers({ companyId: company.id });
        if (usersResponse.data) {
          const admin = usersResponse.data.find(
            (user) => user.isCompanyAdmin || user.isCompanyManager,
          );
          setCompanyAdmin(admin || null);
        }
      } catch (error) {
        console.error('Error loading company admin:', error);
      }
    }

    loadCompanyAdmin();
  }, [company.id]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Company Header */}
      <div className="space-y-1">
        <Typography variant="h2" className="flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          {company.name}
        </Typography>
        <Typography variant="muted" className="text-muted-foreground">
          {t('companies.pageDescription')}
        </Typography>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('companies.totalBranches')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBranches}</div>
            <p className="text-xs text-muted-foreground">
              {totalBranches === 1 ? t('companies.branch') : t('companies.branches')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('companies.totalMachines')}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMachines}</div>
            <p className="text-xs text-muted-foreground">
              {totalMachines === 1 ? t('companies.machine') : t('companies.machines')}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Company Administrator */}
      {companyAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t('companies.companyAdmin')}
                </p>
                <p className="text-base font-semibold">{companyAdmin.name}</p>
                <p className="text-sm text-muted-foreground">{companyAdmin.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branches Section */}
      <div className="space-y-4">
        <Typography variant="h3">{t('companies.branches')}</Typography>

        {branches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <Typography variant="h4" className="text-center mb-2">
                {t('companies.noBranches')}
              </Typography>
              <Typography variant="muted" className="text-center text-muted-foreground">
                {t('companies.noBranchesDescription')}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                machineCount={branch.machineCount}
                companyUser={companyUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}