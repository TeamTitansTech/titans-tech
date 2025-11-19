'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Package, ChevronRight, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import type { UserResponseDto } from '@titans-tech/shared';
import type { CompanyBranch } from '@/data/services/company-branches.api';

interface BranchCardProps {
  branch: CompanyBranch;
  machineCount: number;
  companyUser: UserResponseDto;
}

export function BranchCard({ branch, machineCount, companyUser }: BranchCardProps) {
  const t = useTranslations();
  const router = useInternalRouter();

  // Find user's permissions for this branch
  const userBranch = companyUser.branches?.find(b => b.branchId === branch.id);
  const canViewMachines = userBranch?.readMachines ?? false;

  const handleViewMachines = () => {
    // Navigate to machines page with branch filter
    router.push(`/machines?branchId=${branch.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{branch.name}</span>
            </CardTitle>
            {branch.location && (
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{branch.location}</span>
              </CardDescription>
            )}
          </div>
          {branch.isMainBranch && (
            <Badge className="flex-shrink-0 bg-gray-500/10 text-gray-500 border-gray-500/20 pointer-events-none whitespace-nowrap">
              {t('companies.mainBranch')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Machine Count */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {machineCount === 0
                ? t('companies.noMachines')
                : machineCount === 1
                ? `1 ${t('companies.machine')}`
                : `${machineCount} ${t('companies.machines')}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        {canViewMachines && machineCount > 0 && (
          <Button
            onClick={handleViewMachines}
            className="w-full"
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('companies.viewMachines')}
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}