'use client';

import { Building2, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type Company } from '@/data/services/companies.api';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const router = useInternalRouter();
  const t = useTranslations('companies');

  const handleClick = () => {
    router.push(`/admin/companies/${company.id}`);
  };

  const status = 'active'; // All companies are active by default
  const branchCount = company._count?.branches ?? 0;

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
      onClick={handleClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                status === 'active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {status}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{company.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {company.description ||
                'Leading industrial equipment manufacturer specializing in heavy machinery'}
            </p>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {branchCount} {branchCount === 1 ? t('branch') : t('branches')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
