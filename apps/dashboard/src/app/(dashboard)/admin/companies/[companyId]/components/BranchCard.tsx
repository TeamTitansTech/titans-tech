'use client';

import { MapPin, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type CompanyBranch } from '@/data/services/company-branches.api';
import { useTranslations } from 'next-intl';

interface BranchCardProps {
  branch: CompanyBranch;
  companyId: string;
}

export function BranchCard({ branch }: BranchCardProps) {
  const t = useTranslations('companies');

  // Mock data for machines count - would come from API
  const machineCount: number = branch.isMainBranch ? 5 : branch.name.includes('West') ? 3 : 2;
  const location = branch.isMainBranch
    ? 'Detroit, MI'
    : branch.name.includes('West')
      ? 'Los Angeles, CA'
      : 'Houston, TX';

  return (
    <Card className="hover:border-primary/50 hover:shadow-md transition-all">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Icon and Badge */}
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <MapPin className="h-6 w-6 text-orange-500" />
            </div>
            {branch.isMainBranch && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {t('mainBranch')}
              </span>
            )}
          </div>

          {/* Branch Name */}
          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{branch.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{location}</p>
          </div>

          {/* Machine Count */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span>
              {machineCount} {machineCount === 1 ? t('machine') : t('machines')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
