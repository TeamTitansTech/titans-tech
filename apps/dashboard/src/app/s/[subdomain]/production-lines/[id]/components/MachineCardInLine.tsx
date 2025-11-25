'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Box } from 'lucide-react';
import Image from 'next/image';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { StatusBadge } from './StatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MachineWithStatus } from '@/data/types/production-lines.types';
import { getAlertStatus, getSectionStatus, statusColors, statusLabels } from '@/lib/alertStatus';

interface MachineCardInLineProps {
  machine: MachineWithStatus;
  canViewDetails?: boolean;
}

const SECTION_I18N_KEYS: Record<string, string> = {
  BEARING_CLEARANCE: 'bearingClearance',
  SLIDE: 'slide',
  GIBS: 'gibs',
  LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: 'lubricationHydraulics',
  CLUTCH: 'clutch',
  COUNTERBALANCE_CYLINDER_AIRBAG: 'counterbalance',
  TRAMMING: 'tramming',
  PISTONS: 'pistons',
};

export function MachineCardInLine({ machine, canViewDetails = true }: MachineCardInLineProps) {
  const router = useInternalRouter();
  const t = useTranslations('machines');

  const handleClick = () => {
    if (canViewDetails) {
      router.push(`/machines/${machine.id}`);
    }
  };

  const sections = machine.blueprint?.sections || [];
  const alertStatus = getAlertStatus(machine);

  return (
    <Card
      className={`w-[200px] shrink-0 transition-all ${
        canViewDetails
          ? 'cursor-pointer hover:border-primary/50 hover:shadow-lg'
          : 'cursor-not-allowed opacity-60'
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted flex items-center justify-center">
          {/* Status Indicator Circle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 ${statusColors[alertStatus]} z-10`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{statusLabels[alertStatus]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {machine.imageUrl ? (
            <Image
              src={machine.imageUrl}
              alt={machine.name}
              fill
              className="object-cover"
              sizes="200px"
            />
          ) : (
            <div className="text-center p-3">
              <Box className="w-12 h-12 mx-auto text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="p-2 border-t">
          <h3 className="text-xs font-semibold text-center line-clamp-2">{machine.name}</h3>
        </div>

        {/* Status badges */}
        {sections.length > 0 && (
          <div className="px-2 pb-2 space-y-1 border-t pt-2">
            {sections.map((section) => {
              const status = getSectionStatus(section, machine);
              const sectionName = t(`sectionNames.${SECTION_I18N_KEYS[section] || 'unknown'}`);

              return <StatusBadge key={section} status={status} label={sectionName} />;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
