'use client';

import { MapPin, Wrench, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type CompanyBranch } from '@/data/services/company-branches.api';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface BranchCardProps {
  branch: CompanyBranch;
  companyId: string;
}

export function BranchCard({ branch, companyId }: BranchCardProps) {
  const t = useTranslations('companies');

  const machineCount = branch._count?.machines ?? 0;
  const location = branch.location;

  return (
    <Card
      className="hover:border-orange-500/50 hover:shadow-md transition-all"
      data-testid={`branch-card-${branch.id}`}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <MapPin className="h-6 w-6 text-orange-500" />
            </div>
            {branch.isMainBranch && (
              <span
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
                data-testid="branch-main-badge"
              >
                {t('mainBranch')}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{branch.name}</h3>
            {location && <p className="text-sm text-muted-foreground mt-1">{location}</p>}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Wrench className="h-4 w-4" />
            <span>
              {machineCount} {machineCount === 1 ? t('machine') : t('machines')}
            </span>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full justify-between hover:bg-orange-100 hover:text-orange-500 dark:hover:bg-orange-500/20"
            size="sm"
          >
            <Link href={`/admin/companies/${companyId}/branches/${branch.id}`}>
              {t('viewMachines')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
