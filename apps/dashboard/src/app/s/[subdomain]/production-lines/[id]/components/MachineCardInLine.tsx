'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Box } from 'lucide-react';
import Image from 'next/image';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import { useTranslations } from 'next-intl';
import { StatusBadge } from './StatusBadge';
import type { MachineWithStatus } from '@/data/types/production-lines.types';

interface MachineCardInLineProps {
  machine: MachineWithStatus;
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

const CLEARANCE_LIMITS = {
  WARNING: 0.15,
  ALERT: 0.2,
};

type SectionStatus = 'ok' | 'warning' | 'alert' | 'unknown';

const getSectionStatus = (section: string, machine: any): SectionStatus => {
  if (!machine.inspections || machine.inspections.length === 0) {
    return 'unknown';
  }

  const latestInspection = machine.inspections[0];

  switch (section) {
    case 'BEARING_CLEARANCE': {
      const bearingCheck = latestInspection.bearingClearanceChecks;
      if (!bearingCheck || !bearingCheck.after) {
        return 'unknown';
      }

      const clearances = [
        bearingCheck.after.totalClearance_RH,
        bearingCheck.after.totalClearance_LH,
        bearingCheck.after.mainBearings_RH,
        bearingCheck.after.mainBearings_LH,
        bearingCheck.after.upperConnectionBearings_RH,
        bearingCheck.after.upperConnectionBearings_LH,
        bearingCheck.after.wristPinToMatingPart_RH,
        bearingCheck.after.wristPinToMatingPart_LH,
        bearingCheck.after.wristPinToBushing_RH,
        bearingCheck.after.wristPinToBushing_LH,
      ];

      const maxClearance = Math.max(...clearances);

      if (maxClearance >= CLEARANCE_LIMITS.ALERT) {
        return 'alert';
      } else if (maxClearance >= CLEARANCE_LIMITS.WARNING) {
        return 'warning';
      } else {
        return 'ok';
      }
    }

    default:
      return 'ok';
  }
};

export function MachineCardInLine({ machine }: MachineCardInLineProps) {
  const router = useInternalRouter();
  const t = useTranslations('machines');

  const handleClick = () => {
    router.push(`/client/machines/${machine.id}`);
  };

  const sections = machine.blueprint?.sections || [];

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all w-[320px] shrink-0"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Imagem da máquina */}
        <div className="relative aspect-square bg-muted flex items-center justify-center">
          {machine.imageUrl ? (
            <Image
              src={machine.imageUrl}
              alt={machine.name}
              fill
              className="object-cover"
              sizes="320px"
            />
          ) : (
            <div className="text-center p-6">
              <Box className="w-20 h-20 mx-auto text-muted-foreground mb-2" />
            </div>
          )}
        </div>

        {/* Nome da máquina */}
        <div className="p-4 border-t">
          <h3 className="text-lg font-semibold text-center line-clamp-2">{machine.name}</h3>
        </div>

        {/* Status badges */}
        {sections.length > 0 && (
          <div className="px-4 pb-4 space-y-2 border-t pt-4">
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
