'use client';

import { Typography } from '@/components/ui/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Package } from 'lucide-react';
import { BranchCard } from './BranchCard';
import type { UserResponseDto } from '@titans-tech/shared';
import type { Company } from '@/data/services/companies.api';
import type { CompanyBranch } from '@/data/services/company-branches.api';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

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

  // Calculate totals
  const totalBranches = branches.length;
  const totalMachines = branches.reduce((sum, branch) => sum + branch.machineCount, 0);

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

        {company.brandColor && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('companies.brandColor')}
              </CardTitle>
              <div
                className="h-4 w-4 rounded"
                style={{ backgroundColor: company.brandColor }}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold uppercase">{company.brandColor}</div>
              <p className="text-xs text-muted-foreground">
                {t('companies.primaryColor')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Branches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="h3">{t('companies.branches')}</Typography>
          {companyUser.isCompanyAdmin && (
            <Badge variant="secondary">{t('companies.companyAdmin')}</Badge>
          )}
        </div>

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