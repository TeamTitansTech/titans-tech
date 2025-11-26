'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConditionalTooltip } from '@/components/ui/conditional-tooltip';
import { Typography } from '@/components/ui/typography';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wrench, Calendar, Pencil, Trash2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const statusClassNames = {
  operational: 'bg-green-600 dark:bg-green-500',
  maintenance: 'bg-yellow-600 dark:bg-yellow-500',
  offline: 'bg-red-600 dark:bg-red-500',
};

const statusBadgeClassNames = {
  operational: 'bg-green-600 text-white dark:bg-green-500',
  maintenance: 'bg-yellow-600 text-white dark:bg-yellow-500',
  offline: 'bg-red-600 text-white dark:bg-red-500',
};

export interface MachineCardProps {
  id: string;
  name: string;
  blueprintName: string;
  location?: string;
  lastInspection?: string;
  status?: 'operational' | 'maintenance' | 'offline';
  // Admin-specific props
  onEdit?: () => void;
  onDelete?: () => void;
  // Client-specific props
  canViewDetails?: boolean;
  // Appearance options
  showStatusBadge?: boolean; // If true, shows badge instead of circle
  basePath?: string; // Base path for links (e.g., '/admin/machines' or '/machines')
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
  canViewDetails = true,
  showStatusBadge = false,
  basePath = '/machines',
}: MachineCardProps) {
  const t = useTranslations('machines');
  const hasActions = !!(onEdit || onDelete);

  const cardContent = (
    <Card
      className={`relative shadow-md hover:shadow-xl transition-all duration-200 border-2 hover:border-primary/20 ${
        canViewDetails && !hasActions ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      {/* Status Indicator */}
      {!showStatusBadge && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`absolute top-[clamp(0.5rem,1.5vw,0.75rem)] right-[clamp(0.5rem,1.5vw,0.75rem)] w-[clamp(0.75rem,3vw,1rem)] h-[clamp(0.75rem,3vw,1rem)] rounded-full ${statusClassNames[status]}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t(`status.${status}`)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <CardContent className="p-[clamp(1.25rem,3vw,2rem)]">
        <div className="space-y-[clamp(0.875rem,2.5vw,1.25rem)]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div
              className={`flex items-start gap-[clamp(0.625rem,2vw,0.875rem)] min-w-0 flex-1 ${!showStatusBadge ? 'pr-5' : 'mr-2'}`}
            >
              <div className="w-[clamp(2.25rem,9vw,2.75rem)] h-[clamp(2.25rem,9vw,2.75rem)] rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Wrench className="w-[clamp(1.125rem,4.5vw,1.375rem)] h-[clamp(1.125rem,4.5vw,1.375rem)] text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <ConditionalTooltip content={name}>
                  <Typography
                    variant="h3"
                    className="truncate text-base font-semibold leading-tight"
                  >
                    {name}
                  </Typography>
                </ConditionalTooltip>
                <ConditionalTooltip
                  content={blueprintName}
                  className="text-sm text-muted-foreground truncate block leading-snug mt-0.5"
                >
                  {blueprintName}
                </ConditionalTooltip>
              </div>
            </div>

            {/* Status Badge (client style) */}
            {showStatusBadge && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${statusBadgeClassNames[status]}`}
              >
                {t(`status.${status}`)}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-[clamp(0.375rem,1.25vw,0.625rem)]">
            {location && (
              <Typography
                variant="small"
                className="text-muted-foreground text-sm truncate leading-relaxed"
              >
                {location}
              </Typography>
            )}
            {lastInspection && (
              <div className="flex items-center gap-[clamp(0.5rem,1.5vw,0.625rem)] text-muted-foreground">
                <Calendar className="w-[clamp(0.875rem,3.5vw,1.125rem)] h-[clamp(0.875rem,3.5vw,1.125rem)] shrink-0" />
                <Typography
                  variant="small"
                  className="text-muted-foreground text-sm truncate leading-relaxed"
                >
                  <span className="font-medium">{t('lastInspection')}:</span> {lastInspection}
                </Typography>
              </div>
            )}
          </div>

          {/* Actions */}
          {hasActions && (
            <div className="flex gap-2 sm:gap-2.5 md:gap-3 max-w-full">
              {onEdit && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit();
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 px-2 text-sm gap-0 sm:gap-1.5 md:gap-2"
                >
                  <Pencil className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
                  <span className="hidden sm:inline">{t('edit')}</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 px-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50 gap-0 sm:gap-1.5 md:gap-2"
                >
                  <Trash2 className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
                  <span className="hidden sm:inline">{t('delete')}</span>
                </Button>
              )}
            </div>
          )}

          {/* View Details Button (client style) */}
          {!hasActions &&
            (canViewDetails ? (
              <Button asChild variant="outline" className="w-full justify-between" size="sm">
                <Link href={`${basePath}/${id}`}>
                  {t('viewDetails')}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="w-full justify-between" size="sm" disabled>
                {t('viewDetails')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );

  // If it's an admin card with actions, wrap in Link
  if (hasActions) {
    return (
      <Link href={`${basePath}/${id}`} className="block">
        {cardContent}
      </Link>
    );
  }

  // Otherwise just return the card
  return cardContent;
}
