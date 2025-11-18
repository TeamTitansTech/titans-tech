'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { Typography } from '@/components/ui/typography';
import { Wrench, ChevronRight, Calendar, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MachineCardProps } from '@/data/types/machines.types';

const statusClassNames = {
  operational: 'bg-green-600 text-white dark:bg-green-500',
  maintenance: 'bg-yellow-600 text-white dark:bg-yellow-500',
  offline: 'bg-red-600 text-white dark:bg-red-500',
};

interface ExtendedMachineCardProps extends MachineCardProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MachineCard({
  id,
  name,
  blueprintName,
  location,
  lastInspection,
  status = 'operational',
  onEdit,
  onDelete,
}: ExtendedMachineCardProps) {
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
                  <Typography variant="h3" className="truncate">
                    {name}
                  </Typography>
                </ConditionalTooltip>
                <ConditionalTooltip
                  content={blueprintName}
                  className="text-sm text-muted-foreground truncate"
                >
                  {blueprintName}
                </ConditionalTooltip>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${statusClassNames[status]}`}
            >
              {t(`status.${status}`)}
            </span>
          </div>

          <div className="space-y-2">
            {location && (
              <Typography variant="small" className="text-muted-foreground">
                <span className="font-medium">{t('location')}:</span> {location}
              </Typography>
            )}
            {lastInspection && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <Typography variant="small" className="text-muted-foreground">
                  <span className="font-medium">{t('lastInspection')}:</span> {lastInspection}
                </Typography>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 justify-between" size="sm">
              <Link href={`/admin/machines/${id}`}>
                {t('viewDetails')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button onClick={onEdit} variant="outline" size="sm" className="flex-1">
                <Pencil className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={onDelete}
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('delete')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
