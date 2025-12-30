'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getAllBranches, type CompanyBranch } from '@/data/services/company-branches.api';
import { useCompanyUser } from '@/contexts/CompanyUserContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface BranchesSectionProps {
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
}

export function BranchesSection({ selectedBranchId, onSelectBranch }: BranchesSectionProps) {
  const t = useTranslations('settings.branches');
  const { companyUser } = useCompanyUser();
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!companyUser?.companyId) return;

    let cancelled = false;

    const fetchBranches = async () => {
      setIsLoading(true);
      const response = await getAllBranches({ companyId: companyUser.companyId });

      if (cancelled) return;

      if (response.errors) {
        toast.error(t('loadingFailed'));
      } else {
        setBranches(response.data || []);
      }
      setIsLoading(false);
    };

    fetchBranches();

    return () => {
      cancelled = true;
    };
  }, [companyUser?.companyId, t]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <h3 className="text-base font-semibold">{t('title')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <h3 className="text-base font-semibold">{t('title')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t('noBranches')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <h3 className="text-base font-semibold">{t('title')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => {
          const isSelected = branch.id === selectedBranchId;
          return (
            <Card
              key={branch.id}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50 hover:shadow-md'
              }`}
              onClick={() => onSelectBranch(branch.id)}
              data-testid={`branch-${branch.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{branch.name}</h4>
                      {branch.isMainBranch && (
                        <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {t('mainBranch')}
                        </span>
                      )}
                    </div>
                  </div>
                  {branch.location && (
                    <p className="text-sm text-muted-foreground">{branch.location}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                    <Users className="h-4 w-4" />
                    <span>{t('clickToViewUsers')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
