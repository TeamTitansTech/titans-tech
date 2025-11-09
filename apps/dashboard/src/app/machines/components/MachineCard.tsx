'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { Wrench, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface MachineCardProps {
  id: string;
  name: string;
  blueprintName: string;
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
}

const statusVariants = {
  operational: 'success' as const,
  maintenance: 'warning' as const,
  offline: 'error' as const,
};

export function MachineCard({
  id,
  name,
  blueprintName,
  location,
  lastInspection,
  status = 'operational',
}: MachineCardProps) {
  const t = useTranslations('machines');

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 min-w-0 flex-1 mr-2">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <ConditionalTooltip content={name}>
                  <h3 className="font-semibold text-base truncate">{name}</h3>
                </ConditionalTooltip>
                <ConditionalTooltip
                  content={blueprintName}
                  className="text-sm text-muted-foreground truncate"
                >
                  {blueprintName}
                </ConditionalTooltip>
              </div>
            </div>
            <Badge variant={statusVariants[status]} className="shrink-0">
              {t(`status.${status}`)}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            {location && (
              <div className="text-muted-foreground">
                <span className="font-medium">{t('location')}:</span> {location}
              </div>
            )}
            {lastInspection && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  <span className="font-medium">{t('lastInspection')}:</span> {lastInspection}
                </span>
              </div>
            )}
          </div>

          <Button asChild variant="ghost" className="w-full justify-between" size="sm">
            <Link href={`/machines/${id}`}>
              {t('viewDetails')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
