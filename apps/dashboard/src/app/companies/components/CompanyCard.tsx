'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';

interface CompanyCardProps {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  branchCount: number;
}

export function CompanyCard({ name, description, status, branchCount }: CompanyCardProps) {
  const t = useTranslations('companies');

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <ConditionalTooltip content={name}>
                  <CardTitle className="text-lg truncate">{name}</CardTitle>
                </ConditionalTooltip>
              </div>
            </div>
          </div>
          <Badge
            variant={status === 'active' ? 'default' : 'secondary'}
            className={
              status === 'active'
                ? 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-0'
                : 'bg-gray-500/10 text-gray-700 dark:text-gray-400 hover:bg-gray-500/20'
            }
          >
            {t(`status.${status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="mt-auto space-y-3">
        <ConditionalTooltip
          content={description}
          className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]"
        >
          {description}
        </ConditionalTooltip>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>
            {branchCount} {branchCount === 1 ? t('branch') : t('branches')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
